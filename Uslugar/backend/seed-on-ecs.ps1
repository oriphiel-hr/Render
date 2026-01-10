# Run seed directly on ECS container (has access to RDS)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SEED Legal Statuses on ECS Container" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$CLUSTER = "uslugar-cluster"
$SERVICE = "uslugar-service"
$REGION = "eu-north-1"

Write-Host "1. Finding running ECS task..." -ForegroundColor Yellow

# Get task ARN
$taskArn = aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --query 'taskArns[0]' --output text

if (-Not $taskArn -or $taskArn -eq "None") {
    Write-Host "ERROR: No running tasks found!" -ForegroundColor Red
    Write-Host "Make sure ECS service is running." -ForegroundColor Yellow
    exit 1
}

Write-Host "   Task: $taskArn" -ForegroundColor Green
Write-Host ""

Write-Host "2. Creating seed script on container..." -ForegroundColor Yellow

# Create inline seed script
$seedScript = @'
node -e "
import('$PRISMA/client').then(async ({PrismaClient}) => {
  const prisma = new PrismaClient();
  const statuses = [
    {id:'cls1_individual',code:'INDIVIDUAL',name:'Fizička osoba',description:'Privatna osoba bez registrirane djelatnosti',isActive:true},
    {id:'cls2_sole_trader',code:'SOLE_TRADER',name:'Obrtnik',description:'Registrirani obrt - fizička osoba s OIB-om',isActive:true},
    {id:'cls3_pausal',code:'PAUSAL',name:'Paušalni obrt',description:'Obrt s paušalnim oporezivanjem',isActive:true},
    {id:'cls4_doo',code:'DOO',name:'d.o.o.',description:'Društvo s ograničenom odgovornošću',isActive:true},
    {id:'cls5_jdoo',code:'JDOO',name:'j.d.o.o.',description:'Jednostavno društvo s ograničenom odgovornošću',isActive:true},
    {id:'cls6_freelancer',code:'FREELANCER',name:'Samostalni djelatnik',description:'Freelancer s paušalnim oporezivanjem',isActive:true}
  ];
  for(const s of statuses){
    await prisma.legalStatus.upsert({where:{id:s.id},update:s,create:s});
    console.log('OK:',s.code);
  }
  await prisma.\$disconnect();
  console.log('SEED COMPLETE!');
}).catch(e=>{console.error(e);process.exit(1);});
"
'@

Write-Host "3. Executing seed on ECS..." -ForegroundColor Yellow
Write-Host ""

# Execute on ECS container
aws ecs execute-command `
    --cluster $CLUSTER `
    --task $taskArn `
    --container uslugar `
    --region $REGION `
    --interactive `
    --command "/bin/sh -c `"$seedScript`""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

