#!/bin/bash
set -e

REGION="eu-north-1"
ROLE_NAME="ecsTaskExecutionRole"
SECRET_ARN="arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-twilio-config-xv1Y6q"

echo "========================================"
echo "  Dodavanje Dozvola za Twilio Secret"
echo "========================================"
echo ""

echo "🔍 Provjera trenutne role: $ROLE_NAME"

# Provjeri da li role postoji
ROLE_EXISTS=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.RoleName' --output text 2>/dev/null)

if [ -z "$ROLE_EXISTS" ]; then
  echo "  ❌ Role $ROLE_NAME ne postoji!"
  exit 1
fi

echo "  ✅ Role postoji"

# Provjeri trenutnu policy
echo ""
echo "📋 Trenutne inline policies:"
aws iam list-role-policies --role-name $ROLE_NAME --output table

# Kreiraj novu policy dokument za Twilio secret
POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "$SECRET_ARN"
      ]
    }
  ]
}
EOF
)

# Provjeri da li već postoji inline policy za Twilio
EXISTING_POLICY=$(aws iam get-role-policy --role-name $ROLE_NAME --policy-name "TwilioSecretAccess" 2>/dev/null || echo "")

if [ -z "$EXISTING_POLICY" ]; then
  echo ""
  echo "➕ Dodavanje nove inline policy 'TwilioSecretAccess'..."
  
  echo "$POLICY_DOC" > /tmp/twilio-secret-policy.json
  
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name "TwilioSecretAccess" \
    --policy-document file:///tmp/twilio-secret-policy.json \
    --region $REGION
  
  echo "  ✅ Policy dodana"
  
  rm -f /tmp/twilio-secret-policy.json
else
  echo ""
  echo "ℹ️  Policy 'TwilioSecretAccess' već postoji - ažuriranje..."
  
  echo "$POLICY_DOC" > /tmp/twilio-secret-policy.json
  
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name "TwilioSecretAccess" \
    --policy-document file:///tmp/twilio-secret-policy.json \
    --region $REGION
  
  echo "  ✅ Policy ažurirana"
  
  rm -f /tmp/twilio-secret-policy.json
fi

echo ""
echo "========================================"
echo "  ✅ Dozvole dodane!"
echo "========================================"
echo ""
echo "🚀 Sada pokrenite deployment ponovno:"
echo "   aws ecs update-service --cluster apps-cluster --service uslugar-service-2gk1f1mv --task-definition uslugar:330 --force-new-deployment --region eu-north-1"
echo ""

