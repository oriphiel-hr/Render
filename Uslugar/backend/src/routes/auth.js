import { Router } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, signToken, auth } from '../lib/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email.js';
import { deleteUserWithRelations } from '../lib/delete-helpers.js';
import axios from 'axios';
import { validateOIB } from '../lib/kyc-verification.js';

const r = Router();

r.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, role = 'USER', phone, city, legalStatusId, taxId, companyName } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ error: 'Missing fields' });
    
    // VALIDACIJA: PROVIDER pravni status (OBAVEZNO - prema zakonu)
    if (role === 'PROVIDER') {
      if (!legalStatusId) {
        return res.status(400).json({ 
          error: 'Pravni status je obavezan',
          message: 'Prema zakonu, svi pružatelji usluga moraju biti registrirani kao obrt, firma ili samostalni djelatnik.'
        });
      }
      
      if (!taxId) {
        return res.status(400).json({ 
          error: 'OIB je obavezan',
          message: 'Pružatelji usluga moraju unijeti svoj OIB.'
        });
      }
      
      // Provjeri da li legal status postoji i da je aktivan
      const legalStatus = await prisma.legalStatus.findUnique({ where: { id: legalStatusId } });
      if (!legalStatus || !legalStatus.isActive) {
        return res.status(400).json({ 
          error: 'Nevažeći pravni status',
          message: 'Odabrani pravni status ne postoji ili nije aktivan.'
        });
      }
      
      // Zabrani fizičku osobu kao pružatelja
      if (legalStatus.code === 'INDIVIDUAL') {
        return res.status(400).json({ 
          error: 'Nevažeći pravni status',
          message: 'Pružatelji usluga ne mogu biti registrirani kao fizička osoba bez djelatnosti.'
        });
      }
      
      // Provjeri naziv tvrtke (obavezno osim za freelancere)
      if (legalStatus.code !== 'FREELANCER' && !companyName) {
        return res.status(400).json({ 
          error: 'Naziv tvrtke/obrta je obavezan',
          message: 'Unesite naziv vaše tvrtke ili obrta. Samostalni djelatnici mogu raditi pod svojim imenom.'
        });
      }
    }
    
    // Check if email+role combination already exists
    // Allow same email for different roles (USER can also be PROVIDER)
    // But prevent duplicate email within same role
    const exists = await prisma.user.findUnique({ 
      where: { 
        email_role: {
          email: email,
          role: role
        }
      } 
    });
    if (exists) {
      return res.status(409).json({ 
        error: 'Email already in use',
        message: `Email ${email} je već registriran kao ${role === 'USER' ? 'korisnik' : role === 'PROVIDER' ? 'pružatelj' : 'administrator'}. Možete registrirati isti email s drugom ulogom.`
      });
    }
    
    const passwordHash = await hashPassword(password);
    
    // Generiraj verification token (32 byte random hex)
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    const userData = {
      email,
      passwordHash,
      fullName,
      role,
      phone,
      city,
      verificationToken,
      tokenExpiresAt
    };
    
    // Dodaj legalStatusId, taxId, companyName samo ako nisu prazni
    // Za USER-e koji nisu pravne osobe, ove vrijednosti ne smiju biti postavljene
    if (legalStatusId && legalStatusId !== '' && legalStatusId !== null) {
      userData.legalStatusId = legalStatusId;
    }
    if (taxId && taxId !== '' && taxId !== null) {
      userData.taxId = taxId;
    }
    if (companyName && companyName !== '' && companyName !== null) {
      userData.companyName = companyName;
    }
    
    const user = await prisma.user.create({ data: userData });
    
    if (role === 'PROVIDER') {
      const providerProfile = await prisma.providerProfile.create({ 
        data: { 
          userId: user.id, 
          bio: '', 
          serviceArea: city || '',
          legalStatusId,
          taxId,
          companyName
        } 
      });
      
      // Auto-verify i dodijeli badge ako je moguće (tek nakon registracije)
      try {
        if (taxId && legalStatusId && validateOIB(taxId)) {
          const legalStatus = await prisma.legalStatus.findUnique({
            where: { id: legalStatusId }
          });
          
          if (legalStatus) {
            let badgeData = null;
            let isVerified = false;
            
            // Sudski registar za d.o.o./j.d.o.o.
            if (legalStatus.code === 'DOO' || legalStatus.code === 'JDOO') {
              try {
                const clientId = process.env.SUDREG_CLIENT_ID;
                const clientSecret = process.env.SUDREG_CLIENT_SECRET;
                
                if (clientId && clientSecret) {
                  const tokenResponse = await axios.post(
                    'https://sudreg-data.gov.hr/api/oauth/token',
                    'grant_type=client_credentials',
                    {
                      auth: { username: clientId, password: clientSecret },
                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                  ).catch(() => null);
                  
                  if (tokenResponse?.data?.access_token) {
                    const sudResponse = await axios.get(
                      'https://sudreg-data.gov.hr/api/javni/detalji_subjekta',
                      {
                        params: { tip_identifikatora: 'oib', identifikator: taxId },
                        headers: { 'Authorization': `Bearer ${tokenResponse.data.access_token}` },
                        timeout: 10000
                      }
                    ).catch(() => null);
                    
                    if (sudResponse?.data?.status === 1) {
                      const companyNameFromSud = sudResponse.data.skracena_tvrtka?.ime || sudResponse.data.tvrtka?.ime || companyName;
                      badgeData = {
                        BUSINESS: {
                          verified: true,
                          source: 'SUDSKI_REGISTAR',
                          date: new Date().toISOString(),
                          companyName: companyNameFromSud
                        }
                      };
                      isVerified = true;
                      console.log('[Register] ✅ Auto-verified via Sudski registar');
                    }
                  }
                }
              } catch (err) {
                console.log('[Register] ⚠️ Auto-verify failed (Sudski):', err.message);
              }
            }
            
            // Spremi badge ako je STVARNO verificiran (samo ako Sudski API potvrdi)
            if (badgeData && isVerified) {
              await prisma.providerProfile.update({
                where: { userId: user.id },
                data: {
                  badgeData: badgeData,
                  kycVerified: true,
                  kycVerifiedAt: new Date(),
                  kycOibValidated: true
                }
              });
              console.log('[Register] ✅ Badge saved - verified by Sudski registar');
            } else {
              console.log('[Register] ⚠️ Badge NOT saved - verification failed or company not active');
            }
          }
        }
      } catch (verifyError) {
        console.error('[Register] Error during auto-verify:', verifyError);
        // Ne blokiraj registraciju ako auto-verify faila
      }
    }
    
    // Pošalji verification email - OBAVEZNO
    try {
      await sendVerificationEmail(email, fullName, verificationToken);
      console.log('[OK] Verification email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.error('Email error details:', emailError.message);
      
      // Izbriši user-a ako email nije poslan (rollback)
      // Koristimo helper jer može imati ProviderProfile
      await deleteUserWithRelations(user.id);
      
      return res.status(500).json({ 
        error: 'Greška pri slanju verifikacijskog email-a. Pokušajte ponovno.',
        details: process.env.NODE_ENV === 'development' ? emailError.message : 'SMTP configuration error'
      });
    }
    
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.fullName });
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, isVerified: user.isVerified },
      message: 'Registracija uspješna! Provjerite email za aktivacijski link.'
    });
  } catch (e) { next(e); }
});

r.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body; // Optional role parameter
    console.log('[LOGIN] Attempting login for email:', email, 'role:', role || 'any');
    
    // Find all users with this email
    const users = await prisma.user.findMany({ 
      where: { email },
      include: {
        providerProfile: true // Include provider profile to check taxId
      }
    });
    
    if (users.length === 0) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password - try each user
    let validUsers = [];
    for (const u of users) {
      const ok = await verifyPassword(password, u.passwordHash);
      if (ok) {
        validUsers.push(u);
      }
    }
    
    if (validUsers.length === 0) {
      console.log('[LOGIN] Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // If role is specified, try to find that specific user
    if (role) {
      const userWithRole = validUsers.find(u => u.role === role);
      if (!userWithRole) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: `Korisnik s emailom ${email} i ulogom ${role} nije pronađen. Molimo provjerite ulogu.`
        });
      }
      
      console.log('[LOGIN] Successful login for:', email, 'role:', userWithRole.role);
      const token = signToken({ id: userWithRole.id, email: userWithRole.email, role: userWithRole.role, name: userWithRole.fullName });
      return res.json({ 
        token, 
        user: { 
          id: userWithRole.id, 
          email: userWithRole.email, 
          role: userWithRole.role, 
          fullName: userWithRole.fullName, 
          isVerified: userWithRole.isVerified 
        } 
      });
    }
    
    // If multiple users with same email and password, check if they're same company
    if (validUsers.length > 1) {
      // Check if any user is USER and any is PROVIDER with same taxId
      const userRole = validUsers.find(u => u.role === 'USER');
      const providerRole = validUsers.find(u => u.role === 'PROVIDER');
      
      if (userRole && providerRole) {
        // Check if they have same taxId (same company)
        // taxId can be in User model or ProviderProfile model
        const userTaxId = userRole.taxId;
        const providerTaxId = providerRole.taxId || providerRole.providerProfile?.taxId;
        
        // Both must have taxId and they must match
        if (userTaxId && providerTaxId && userTaxId.trim() === providerTaxId.trim()) {
          // Same company - ask user to choose role
          console.log('[LOGIN] Same company found for:', email, 'taxId:', userTaxId);
          return res.status(200).json({
            requiresRoleSelection: true,
            availableRoles: [
              {
                role: 'USER',
                label: 'Korisnik usluge',
                description: 'Prijavite se kao korisnik koji traži usluge'
              },
              {
                role: 'PROVIDER',
                label: 'Pružatelj usluga',
                description: 'Prijavite se kao pružatelj koji nudi usluge'
              }
            ],
            message: 'Odaberite ulogu za prijavu'
          });
        }
      }
      
      // If not same company, just use first valid user (or could return selection)
      // For now, we'll default to first user
      const user = validUsers[0];
      console.log('[LOGIN] Multiple users found, using first:', email, 'role:', user.role);
      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.fullName });
      return res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          fullName: user.fullName, 
          isVerified: user.isVerified 
        } 
      });
    }
    
    // Single user, proceed with login
    const user = validUsers[0];
    console.log('[LOGIN] Successful login for:', email, 'role:', user.role);
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.fullName });
    
    // Track TRIAL engagement - login
    try {
      const { trackLogin } = await import('../services/trial-engagement-service.js');
      await trackLogin(user.id);
    } catch (engagementError) {
      console.error('[AUTH] Error tracking TRIAL engagement:', engagementError);
      // Ne baci grešku - engagement tracking ne smije blokirati login
    }
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        fullName: user.fullName, 
        isVerified: user.isVerified 
      } 
    });
  } catch (e) {
    console.error('[LOGIN] Error:', e);
    next(e);
  }
});

r.get('/verify', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Missing verification token' });
    
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) return res.status(404).json({ error: 'Invalid or expired token' });
    
    // Provjeri da li je token istekao
    if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
      return res.status(410).json({ error: 'Verification link has expired' });
    }
    
    // Ako je već verificiran
    if (user.isVerified) {
      return res.json({ message: 'Email already verified', user: { email: user.email, isVerified: true } });
    }
    
    // Verificiraj korisnika
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null, // Clear token nakon verifikacije
        tokenExpiresAt: null
      }
    });
    
    // Pokreni automatsku verifikaciju nakon email verifikacije
    try {
      const { triggerAutoVerification } = await import('../services/auto-verification.js');
      await triggerAutoVerification(user.id, { type: 'email', value: user.email });
    } catch (autoVerifyError) {
      console.error('[Auth] Auto-verification failed after email verification:', autoVerifyError);
      // Ne baci grešku - samo logiraj
    }
    
    // Obavijesti korisnika o email verifikaciji
    try {
      const { notifyEmailVerification } = await import('../services/verification-notifications.js');
      await notifyEmailVerification(user.id, true);
    } catch (notifError) {
      console.error('[Auth] Failed to send email verification notification:', notifError);
    }
    
    res.json({ 
      message: 'Email successfully verified!',
      user: { email: user.email, fullName: user.fullName, isVerified: true }
    });
  } catch (e) { next(e); }
});

r.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    // Find user by email (can be multiple with different roles)
    // For verification resend, we'll use the first user found
    const users = await prisma.user.findMany({ where: { email } });
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Use first user (or could iterate through all if needed)
    const user = users[0];
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });
    
    // Generiraj novi token
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, tokenExpiresAt }
    });
    
    await sendVerificationEmail(email, user.fullName, verificationToken);
    
    res.json({ message: 'Verification email resent' });
  } catch (e) { next(e); }
});

r.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    // Find user by email (can be multiple with different roles)
    const users = await prisma.user.findMany({ where: { email } });
    
    // Security: Uvijek vrati success, čak i ako user ne postoji
    // Ovo sprječava da napadač zna koji email-ovi postoje u sustavu
    if (users.length === 0) {
      console.log('Forgot password attempt for non-existent email:', email);
      return res.json({ message: 'If that email exists, a password reset link has been sent.' });
    }
    
    // Use first user for password reset
    const user = users[0];
    
    // Generiraj reset token (32 byte random hex)
    const resetPasswordToken = randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpires }
    });
    
    try {
      await sendPasswordResetEmail(email, user.fullName, resetPasswordToken);
      console.log('[OK] Password reset email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ 
        error: 'Greška pri slanju email-a. Pokušajte ponovno.',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
    
    res.json({ message: 'If that email exists, a password reset link has been sent.' });
  } catch (e) { next(e); }
});

r.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const user = await prisma.user.findUnique({ where: { resetPasswordToken: token } });
    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired reset token' });
    }
    
    // Provjeri da li je token istekao
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return res.status(410).json({ error: 'Reset link has expired. Please request a new one.' });
    }
    
    // Hash novu lozinku
    const passwordHash = await hashPassword(newPassword);
    
    //Updateaj lozinku i clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });
    
    console.log('[OK] Password reset successful for:', user.email);
    
    res.json({ 
      message: 'Password successfully reset! You can now login with your new password.',
      user: { email: user.email, fullName: user.fullName }
    });
  } catch (e) { next(e); }
});

// Upgrade USER to PROVIDER
r.post('/upgrade-to-provider', async (req, res, next) => {
  try {
    const { email, password, legalStatusId, taxId, companyName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // VALIDACIJA: Pravni status (OBAVEZNO - prema zakonu)
    if (!legalStatusId) {
      return res.status(400).json({ 
        error: 'Pravni status je obavezan',
        message: 'Prema zakonu, svi pružatelji usluga moraju biti registrirani kao obrt, firma ili samostalni djelatnik.',
        requiredFields: ['legalStatusId', 'taxId']
      });
    }
    
    if (!taxId) {
      return res.status(400).json({ 
        error: 'OIB je obavezan',
        message: 'Pružatelji usluga moraju unijeti svoj OIB.',
        requiredFields: ['taxId']
      });
    }
    
    // Provjeri da li legal status postoji i da je aktivan
    const legalStatus = await prisma.legalStatus.findUnique({ where: { id: legalStatusId } });
    if (!legalStatus || !legalStatus.isActive) {
      return res.status(400).json({ 
        error: 'Nevažeći pravni status',
        message: 'Odabrani pravni status ne postoji ili nije aktivan.'
      });
    }
    
    // Zabrani fizičku osobu kao pružatelja
    if (legalStatus.code === 'INDIVIDUAL') {
      return res.status(400).json({ 
        error: 'Nevažeći pravni status',
        message: 'Pružatelji usluga ne mogu biti registrirani kao fizička osoba bez djelatnosti.'
      });
    }
    
    // Provjeri naziv firme (obavezno osim za freelancere)
    if (legalStatus.code !== 'FREELANCER' && !companyName) {
      return res.status(400).json({ 
        error: 'Naziv firme/obrta je obavezan',
        message: 'Unesite naziv vaše firme ili obrta. Samostalni djelatnici mogu raditi pod svojim imenom.',
        requiredFields: ['companyName']
      });
    }
    
    // Verify user credentials
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if already a provider
    if (user.role === 'PROVIDER') {
      return res.status(400).json({ error: 'Already a provider' });
    }
    
    // Upgrade to PROVIDER and add legal info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        role: 'PROVIDER',
        legalStatusId,
        taxId,
        companyName
      }
    });
    
    // Create ProviderProfile if it doesn't exist
    const existingProfile = await prisma.providerProfile.findUnique({ 
      where: { userId: user.id } 
    });
    
    if (!existingProfile) {
      await prisma.providerProfile.create({
        data: {
          userId: user.id,
          bio: '',
          serviceArea: user.city || '',
          legalStatusId,
          taxId,
          companyName
        }
      });
    }
    
    console.log('[OK] User upgraded to PROVIDER:', user.email);
    
    // Generate new token with updated role
    const token = signToken({ 
      id: updatedUser.id, 
      email: updatedUser.email, 
      role: updatedUser.role, 
      name: updatedUser.fullName 
    });
    
    res.json({ 
      message: 'Successfully upgraded to provider!',
      token,
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        role: updatedUser.role, 
        fullName: updatedUser.fullName, 
        isVerified: updatedUser.isVerified 
      }
    });
  } catch (e) { next(e); }
});

// Link anonymous job to account after registration
r.post('/link-job', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { jobId, token } = req.body;
    
    if (!jobId || !token) {
      return res.status(400).json({ error: 'Missing jobId or token' });
    }
    
    // Find the job by ID and token
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        linkingToken: token,
        userId: null // Must be unlinked
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Invalid or expired linking token' });
    }
    
    // Check if token is expired
    if (job.linkingTokenExpiresAt && new Date() > job.linkingTokenExpiresAt) {
      return res.status(410).json({ error: 'Linking token has expired' });
    }
    
    // Link the job to the user's account
    await prisma.job.update({
      where: { id: jobId },
      data: {
        userId: req.user.id,
        linkingToken: null, // Clear token after linking
        linkingTokenExpiresAt: null
      }
    });
    
    console.log(`[OK] Job ${jobId} linked to user ${req.user.email}`);
    
    res.json({ 
      message: 'Job successfully linked to your account!',
      job: { id: job.id, title: job.title, status: job.status }
    });
  } catch (e) { next(e); }
});

export default r;