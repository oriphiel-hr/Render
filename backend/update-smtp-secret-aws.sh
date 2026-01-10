#!/bin/bash

# Update SMTP Secret in AWS Secrets Manager
# This script updates the SMTP credentials in AWS Secrets Manager

REGION="eu-north-1"
SECRET_NAME="uslugar-smtp-config-5xXBg5"

echo "==================================="
echo "AWS Secrets Manager - SMTP Update"
echo "==================================="
echo ""

# Check if secret exists
echo "Checking if secret exists..."
if ! aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region "$REGION" &>/dev/null; then
    echo "Error: Secret '$SECRET_NAME' not found in AWS Secrets Manager"
    echo "Please create the secret first or check the secret name."
    exit 1
fi
echo "✓ Secret found"
echo ""

# Create temporary JSON file with new values
cat > /tmp/smtp-secret-update.json << EOF
{
  "SMTP_HOST": "smtp.hostinger.com",
  "SMTP_PORT": "465",
  "SMTP_USER": "uslugar@oriphiel.hr",
  "SMTP_PASS": "c|1TYK4YqbF",
  "FRONTEND_URL": "https://uslugar.oriph.io"
}
EOF

echo "Updating secret with new values:"
echo "  Host: smtp.hostinger.com"
echo "  Port: 465"
echo "  User: uslugar@oriphiel.hr"
echo "  Pass: ********"
echo "  Frontend URL: https://uslugar.oriph.io"
echo ""

# Update secret in AWS
echo "Updating secret in AWS Secrets Manager..."
if aws secretsmanager put-secret-value \
    --secret-id "$SECRET_NAME" \
    --secret-string file:///tmp/smtp-secret-update.json \
    --region "$REGION" \
    > /dev/null 2>&1; then
    
    echo ""
    echo "✓ Secret updated successfully!"
    echo ""
    
    # Verify the update
    echo "Verifying update..."
    SECRET_VALUE=$(aws secretsmanager get-secret-value \
        --secret-id "$SECRET_NAME" \
        --region "$REGION" \
        --query 'SecretString' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✓ Verification successful!"
        echo ""
        echo "Current secret values:"
        echo "$SECRET_VALUE" | python3 -c "import json, sys; data=json.load(sys.stdin); print(f\"  SMTP_HOST: {data['SMTP_HOST']}\"); print(f\"  SMTP_PORT: {data['SMTP_PORT']}\"); print(f\"  SMTP_USER: {data['SMTP_USER']}\"); print('  SMTP_PASS: ********'); print(f\"  FRONTEND_URL: {data['FRONTEND_URL']}\")" 2>/dev/null || echo "$SECRET_VALUE"
        echo ""
        echo "Next steps:"
        echo "1. Restart ECS task to pick up new secret values"
        echo "2. Test email sending functionality"
    else
        echo "Warning: Could not verify secret update"
    fi
    
    # Clean up
    rm -f /tmp/smtp-secret-update.json
else
    echo ""
    echo "✗ Error updating secret"
    rm -f /tmp/smtp-secret-update.json
    exit 1
fi

echo ""
echo "==================================="
echo "Update complete!"
echo "==================================="

