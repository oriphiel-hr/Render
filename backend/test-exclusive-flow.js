// Test script for USLUGAR EXCLUSIVE flow
// Run: node test-exclusive-flow.js

import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/auth.js';
import { purchaseLead, markLeadContacted, markLeadConverted, refundLead } from './src/services/lead-service.js';
import { addCredits, getCreditsBalance } from './src/services/credit-service.js';
import { evaluateAndUpdateJobScore } from './src/services/ai-lead-scoring.js';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  
  // Delete test data
  await prisma.leadPurchase.deleteMany({ where: { provider: { email: { contains: 'test.exclusive' } } } });
  await prisma.creditTransaction.deleteMany({ where: { user: { email: { contains: 'test.exclusive' } } } });
  await prisma.providerROI.deleteMany({ where: { provider: { email: { contains: 'test.exclusive' } } } });
  await prisma.clientVerification.deleteMany({ where: { user: { email: { contains: 'test.exclusive' } } } });
  await prisma.subscription.deleteMany({ where: { userId: { in: await prisma.user.findMany({ where: { email: { contains: 'test.exclusive' } }, select: { id: true } }).then(u => u.map(x => x.id)) } } });
  await prisma.job.deleteMany({ where: { user: { email: { contains: 'test.exclusive' } } } });
  await prisma.providerProfile.deleteMany({ where: { user: { email: { contains: 'test.exclusive' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'test.exclusive' } } });
  
  console.log('✅ Cleanup complete\n');
}

async function createTestUsers() {
  console.log('👤 Creating test users...');
  
  const passwordHash = await hashPassword('Test123');
  
  // Create test client (USER)
  const client = await prisma.user.create({
    data: {
      email: 'test.exclusive.client@uslugar.hr',
      passwordHash,
      fullName: 'Test Client',
      role: 'USER',
      phone: '+385991111111',
      city: 'Zagreb',
      isVerified: true
    }
  });
  
  // Create client verification
  await prisma.clientVerification.create({
    data: {
      userId: client.id,
      phoneVerified: true,
      emailVerified: true,
      idVerified: false,
      companyVerified: false,
      trustScore: 50,
      verifiedAt: new Date()
    }
  });
  
  // Get legal status
  const legalStatus = await prisma.legalStatus.findFirst({ where: { code: 'SOLE_TRADER' } });
  
  // Create test provider
  const provider = await prisma.user.create({
    data: {
      email: 'test.exclusive.provider@uslugar.hr',
      passwordHash,
      fullName: 'Test Provider',
      role: 'PROVIDER',
      phone: '+385992222222',
      city: 'Zagreb',
      isVerified: true,
      legalStatusId: legalStatus.id,
      taxId: '12345678901',
      companyName: 'Test Obrt'
    }
  });
  
  // Create provider profile
  const category = await prisma.category.findFirst();
  await prisma.providerProfile.create({
    data: {
      userId: provider.id,
      bio: 'Test provider for EXCLUSIVE features',
      serviceArea: 'Zagreb',
      categories: {
        connect: [{ id: category.id }]
      }
    }
  });
  
  // Create TRIAL subscription with 10 credits (for testing)
  await prisma.subscription.create({
    data: {
      userId: provider.id,
      plan: 'TRIAL',
      status: 'ACTIVE',
      creditsBalance: 10, // Give 10 credits for testing
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  
  console.log(`✅ Client created: ${client.email} (ID: ${client.id})`);
  console.log(`✅ Provider created: ${provider.email} (ID: ${provider.id})`);
  console.log(`✅ Provider has 10 test credits\n`);
  
  return { client, provider, category };
}

async function createTestJob(clientId, categoryId) {
  console.log('📋 Creating test job (exclusive lead)...');
  
  const job = await prisma.job.create({
    data: {
      title: 'Popravak vodovodnih instalacija - HITNO',
      description: 'Potreban vodoinstalater za hitnu popravku cijevi u stanu. Curenje u kupatilu. Potrebno odmah riješiti problem. Spreman platiti premium cijenu za brzu uslugu.',
      userId: clientId,
      categoryId: categoryId,
      budgetMin: 500,
      budgetMax: 1500,
      city: 'Zagreb',
      urgency: 'HIGH',
      jobSize: 'MEDIUM',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      isExclusive: true,
      leadPrice: 10,
      leadStatus: 'AVAILABLE',
      clientVerified: true,
      qualityScore: 0 // Will be calculated by AI
    }
  });
  
  console.log(`✅ Job created: ${job.title} (ID: ${job.id})`);
  console.log(`   Budget: ${job.budgetMin}-${job.budgetMax} EUR`);
  console.log(`   Status: ${job.leadStatus}\n`);
  
  return job;
}

async function testAIScoring(jobId) {
  console.log('🤖 Testing AI Quality Scoring...');
  
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { user: { include: { clientVerification: true } } }
  });
  
  const result = await evaluateAndUpdateJobScore(job, prisma);
  
  console.log(`✅ AI Scoring complete:`);
  console.log(`   Quality Score: ${result.score}/100`);
  console.log(`   Category: ${result.category.label}`);
  console.log(`   Recommended Price: ${result.recommendedPrice} kredita\n`);
  
  return result;
}

async function testLeadPurchase(providerId, jobId) {
  console.log('💳 Testing Lead Purchase...');
  
  // Check credits before
  const balanceBefore = await getCreditsBalance(providerId);
  console.log(`   Credits before: ${balanceBefore.balance}`);
  
  try {
    const result = await purchaseLead(jobId, providerId);
    
    console.log(`✅ Lead purchased successfully!`);
    console.log(`   Purchase ID: ${result.purchase.id}`);
    console.log(`   Credits spent: ${result.purchase.creditsSpent}`);
    console.log(`   Credits remaining: ${result.creditsRemaining}`);
    console.log(`   Status: ${result.purchase.status}\n`);
    
    return result.purchase;
  } catch (error) {
    console.error(`❌ Purchase failed: ${error.message}\n`);
    throw error;
  }
}

async function testMarkContacted(purchaseId, providerId) {
  console.log('📞 Testing Mark as Contacted...');
  
  const updated = await markLeadContacted(purchaseId, providerId);
  
  console.log(`✅ Lead marked as contacted:`);
  console.log(`   Status: ${updated.status}`);
  console.log(`   Contacted at: ${updated.contactedAt}\n`);
  
  return updated;
}

async function testMarkConverted(purchaseId, providerId) {
  console.log('🎉 Testing Mark as Converted...');
  
  const revenue = 1200; // EUR
  const updated = await markLeadConverted(purchaseId, providerId, revenue);
  
  console.log(`✅ Lead marked as converted:`);
  console.log(`   Status: ${updated.status}`);
  console.log(`   Converted at: ${updated.convertedAt}`);
  console.log(`   Revenue: ${revenue} EUR\n`);
  
  return updated;
}

async function testROI(providerId) {
  console.log('📊 Testing ROI Dashboard...');
  
  const roi = await prisma.providerROI.findUnique({
    where: { providerId }
  });
  
  if (roi) {
    console.log(`✅ ROI Statistics:`);
    console.log(`   Total Leads Purchased: ${roi.totalLeadsPurchased}`);
    console.log(`   Total Leads Contacted: ${roi.totalLeadsContacted}`);
    console.log(`   Total Leads Converted: ${roi.totalLeadsConverted}`);
    console.log(`   Total Credits Spent: ${roi.totalCreditsSpent}`);
    console.log(`   Total Revenue: ${roi.totalRevenue} EUR`);
    console.log(`   Conversion Rate: ${roi.conversionRate.toFixed(2)}%`);
    console.log(`   ROI: ${roi.roi.toFixed(2)}%`);
    console.log(`   Avg Lead Value: ${roi.avgLeadValue.toFixed(2)} EUR\n`);
  } else {
    console.log(`⚠️  No ROI data yet\n`);
  }
  
  return roi;
}

async function testRefund(purchaseId, providerId) {
  console.log('💰 Testing Refund System...');
  
  // Check credits before
  const balanceBefore = await getCreditsBalance(providerId);
  console.log(`   Credits before refund: ${balanceBefore.balance}`);
  
  const updated = await refundLead(purchaseId, providerId, 'Client did not respond - test refund');
  
  const balanceAfter = await getCreditsBalance(providerId);
  console.log(`✅ Refund processed:`);
  console.log(`   Status: ${updated.status}`);
  console.log(`   Refunded at: ${updated.refundedAt}`);
  console.log(`   Reason: ${updated.refundReason}`);
  console.log(`   Credits after refund: ${balanceAfter.balance}`);
  console.log(`   Credits refunded: ${balanceAfter.balance - balanceBefore.balance}\n`);
  
  return updated;
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  🧪 USLUGAR EXCLUSIVE - INTEGRATION TEST               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  try {
    // Cleanup
    await cleanup();
    
    // 1. Create test users
    const { client, provider, category } = await createTestUsers();
    
    // 2. Create test job (exclusive lead)
    const job = await createTestJob(client.id, category.id);
    
    // 3. Test AI scoring
    await testAIScoring(job.id);
    
    // 4. Test lead purchase
    const purchase = await testLeadPurchase(provider.id, job.id);
    
    // 5. Test mark as contacted
    await testMarkContacted(purchase.id, provider.id);
    
    // 6. Test ROI
    await testROI(provider.id);
    
    // === Refund test (separate purchase) ===
    console.log('─────────────────────────────────────────────────────────');
    console.log('TESTING REFUND FLOW\n');
    
    // Create another job for refund test
    const job2 = await createTestJob(client.id, category.id);
    await testAIScoring(job2.id);
    const purchase2 = await testLeadPurchase(provider.id, job2.id);
    
    // 7. Test refund
    await testRefund(purchase2.id, provider.id);
    
    // Final ROI check
    console.log('─────────────────────────────────────────────────────────');
    console.log('FINAL ROI CHECK\n');
    await testROI(provider.id);
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL TESTS PASSED!                                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('Test users:');
    console.log(`  Client: test.exclusive.client@uslugar.hr / Test123`);
    console.log(`  Provider: test.exclusive.provider@uslugar.hr / Test123`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();

