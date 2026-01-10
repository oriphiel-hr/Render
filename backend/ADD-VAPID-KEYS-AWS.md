# Dodavanje VAPID ključeva u AWS Secrets Manager

## Korak 1: Kreiraj Secret u AWS Secrets Manager

1. Otvori AWS Console → Secrets Manager
2. Klikni "Store a new secret"
3. Odaberi "Other type of secret"
4. Odaberi "Plaintext" i unesi:
```json
{
  "VAPID_PRIVATE_KEY": "2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24"
}
```
5. Klikni "Next"
6. Secret name: `uslugar-vapid-keys`
7. Klikni "Next" → "Next" → "Store"

## Korak 2: Ažuriraj Task Definition

VAPID ključevi su već dodani u `task-def-final.json`:
- `VAPID_PUBLIC_KEY` - direktno u environment (javni ključ)
- `VAPID_SUBJECT` - direktno u environment
- `VAPID_PRIVATE_KEY` - iz Secrets Manager

## Korak 3: Verificiraj ARN

Nakon kreiranja secret-a, provjeri ARN i ažuriraj u `task-def-final.json` ako je potrebno:

```bash
aws secretsmanager describe-secret --secret-id uslugar-vapid-keys --region eu-north-1
```

ARN će biti u formatu:
```
arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-vapid-keys-XXXXX
```

Ažuriraj u `task-def-final.json`:
```json
{
    "name": "VAPID_PRIVATE_KEY",
    "valueFrom": "arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-vapid-keys-XXXXX:VAPID_PRIVATE_KEY::"
}
```

## Alternativno: PowerShell skripta

```powershell
# Kreiraj secret
$secretValue = @{
    VAPID_PRIVATE_KEY = "2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24"
} | ConvertTo-Json

aws secretsmanager create-secret `
    --name uslugar-vapid-keys `
    --secret-string $secretValue `
    --region eu-north-1

# Provjeri ARN
aws secretsmanager describe-secret `
    --secret-id uslugar-vapid-keys `
    --region eu-north-1 `
    --query 'ARN' `
    --output text
```

## VAPID Ključevi

**Public Key:**
```
BDG4-j--YWXbakF85YGca1YvaghsIlnsxDIT9RnK1Obiga15pMgNbl2i-HVcoDgrZvZyPMlJMQrabWGa1-7xr30
```

**Private Key:**
```
2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24
```

**Subject:**
```
mailto:admin@uslugar.oriph.io
```

