# 🚀 POKRENITE OVO U CLOUDSHELL

## Kopirajte i pokrenite SVE jednom naredbom:

```bash
# 1. Enable ECS Exec on service
aws ecs update-service \
  --cluster apps-cluster \
  --service uslugar-service-2gk1f1mv \
  --region eu-north-1 \
  --enable-execute-command \
  --query 'service.{clusterName:clusterName,serviceName:serviceName,enableExecuteCommand:enableExecuteCommand}' \
  --output table

# 2. Wait for service to stabilize
echo "Waiting for service to update..."
aws ecs wait services-stable --cluster apps-cluster --services uslugar-service-2gk1f1mv --region eu-north-1

# 3. Get new task ARN
TASK_ARN=$(aws ecs list-tasks --cluster apps-cluster --service-name uslugar-service-2gk1f1mv --region eu-north-1 --query 'taskArns[0]' --output text)
echo "Task ARN: $TASK_ARN"

# 4. Execute SQL commands (Batch 1 - 18 categories)
aws ecs execute-command \
  --cluster apps-cluster \
  --task $TASK_ARN \
  --container uslugar \
  --region eu-north-1 \
  --command "export DATABASE_URL='postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar' && psql \$DATABASE_URL -c \"INSERT INTO \\\"Category\\\" (id, name, description, \\\"isActive\\\", icon, \\\"requiresLicense\\\", \\\"nkdCode\\\", \\\"createdAt\\\") VALUES ('arch_001', 'Arhitekti', 'Projektiranje građevina, renovacije, legalizacije', false, '🏗️', true, '71.11', NOW()), ('arch_002', 'Dizajneri interijera', 'Dizajn interijera, namještaj, dekor', false, '🎨', false, '74.10', NOW()), ('arch_003', '3D vizualizacija', '3D modeli, renderi, virtualne turneje', false, '🖼️', false, '74.20', NOW()), ('arch_004', 'Projektiranje građevina', 'Građevinski projekti, statika, instalacije', false, '🏛️', true, '71.12', NOW()), ('arch_005', 'Vrtni dizajn', 'Dizajn vrtova, krajobrazno uređenje', false, '🌳', false, '71.12', NOW()), ('it_001', 'Web dizajn', 'Dizajn web stranica, UI/UX', false, '💻', false, '62.01', NOW()), ('it_002', 'Programiranje', 'Razvoj aplikacija, software', false, '🔧', false, '62.01', NOW()), ('it_003', 'Mobilne aplikacije', 'iOS, Android aplikacije', false, '📱', false, '62.01', NOW()), ('it_004', 'SEO optimizacija', 'Optimizacija za tražilice', false, '🔍', false, '62.02', NOW()), ('it_005', 'Cyber sigurnost', 'Sigurnost IT sustava', false, '🛡️', false, '62.02', NOW()), ('it_006', 'Cloud servisi', 'Cloud infrastruktura, migracije', false, '☁️', false, '62.02', NOW()), ('it_007', 'IT konzulting', 'IT savjetovanje, implementacija', false, '📊', false, '62.03', NOW()), ('health_001', 'Fizioterapija', 'Fizikalna terapija, rehabilitacija', false, '🏥', true, '86.90', NOW()), ('health_002', 'Nutricionizam', 'Prehrambena savjetovanja', false, '🥗', true, '86.90', NOW()), ('health_003', 'Mentalno zdravlje', 'Psihološke usluge, savjetovanje', false, '🧘', true, '86.90', NOW()), ('health_004', 'Kućni liječnik', 'Kućni posjeti, pregledi', false, '👨‍⚕️', true, '86.21', NOW()), ('health_005', 'Stomatologija', 'Zubarske usluge', false, '🦷', true, '86.23', NOW()), ('health_006', 'Optometristi', 'Pregled vida, naočale', false, '👁️', true, '86.90', NOW()) ON CONFLICT (id) DO NOTHING;\""

echo ""
echo "✅ Batch 1 complete!"
echo "Check results in AWS Console or run verification query."
```

---

## ⚠️ Ako ne radi, koristite AWS Console

1. Otvorite: https://console.aws.amazon.com/ecs/v2/clusters/apps-cluster/services/uslugar-service-2gk1f1mv/tasks
2. Kliknite Running task → Connect → Execute Command
3. Kopirajte naredbe iz `RUN-IN-AWS-CONSOLE.md`
