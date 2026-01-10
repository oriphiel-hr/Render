# ⚠️ SECURITY WARNING

## NIKADA ne commitaj credentials u Git!

Twilio credentials (Account SID, Auth Token) su **osjetljivi podaci** i **NE SMIJU** biti u Git history-u.

### ✅ Pravilno korištenje:

1. **Koristi environment variables:**
```bash
export TWILIO_ACCOUNT_SID="AC..."
export TWILIO_AUTH_TOKEN="your_token"
export TWILIO_PHONE_NUMBER="+1..."
```

2. **Koristi AWS Secrets Manager** za production credentials

3. **Koristi placeholders u dokumentaciji:**
   - ❌ `TWILIO_AUTH_TOKEN="your_actual_token_here"`
   - ✅ `TWILIO_AUTH_TOKEN="your_auth_token_here"`

### 🛡️ Ako si slučajno commit-ao credentials:

1. **Odmah rotiraj credentials u Twilio Console**
2. **Obriši credentials iz Git history:**
   ```bash
   git filter-repo --path TWILIO-SMS-TROUBLESHOOTING.md --invert-paths
   # Ili
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch TWILIO-SMS-TROUBLESHOOTING.md" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Provjeri da credentials nisu u trenutnim fajlovima**
4. **Force push (oprezno - obriše Git history)**

### 📝 Best Practices:

- ✅ Koristi `.env` fajlove (dodani u `.gitignore`)
- ✅ Koristi AWS Secrets Manager za production
- ✅ Koristi environment variables u CI/CD
- ❌ NIKADA ne stavljaj credentials u kod
- ❌ NIKADA ne commitaj `.env` fajlove
- ❌ NIKADA ne stavljaj credentials u dokumentaciju

---

**Zapamti:** Ako Twilio rotira credentials zbog ekspozicije, moraš ažurirati AWS Secrets Manager s novim credentials!

