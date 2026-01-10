#!/usr/bin/env node
/**
 * Deploy uslugar backend to AWS ECS
 * Usage: node deploy-to-aws.js
 */

const { spawn } = require('child_process');

// Configuration
const REGION = 'eu-north-1';
const CLUSTER = 'apps-cluster';
const SERVICE = 'uslugar-service-2gk1f1mv';
const NEW_IMAGE = '666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:ff14e36';
const CONTAINER_NAME = 'uslugar';

console.log('='.repeat(60));
console.log('  Deploying Uslugar Backend to AWS ECS');
console.log('='.repeat(60));
console.log();
console.log(`Region: ${REGION}`);
console.log(`Cluster: ${CLUSTER}`);
console.log(`Service: ${SERVICE}`);
console.log(`New Image: ${NEW_IMAGE}`);
console.log();

// Helper to run AWS CLI commands
function runAWSCommand(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('aws', args, { shell: true });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Command failed with code ${code}`));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          resolve(stdout);
        }
      }
    });
  });
}

async function deploy() {
  try {
    // Step 1: Get current task definition
    console.log('[1/4] Fetching current task definition...');
    const serviceInfo = await runAWSCommand([
      'ecs', 'describe-services',
      '--cluster', CLUSTER,
      '--services', SERVICE,
      '--region', REGION
    ]);

    if (!serviceInfo.services || serviceInfo.services.length === 0) {
      throw new Error(`Service ${SERVICE} not found!`);
    }

    const currentTaskDefArn = serviceInfo.services[0].taskDefinition;
    console.log(`  Current: ${currentTaskDefArn}`);

    // Step 2: Get task definition details
    console.log('[2/4] Downloading task definition...');
    const taskDefInfo = await runAWSCommand([
      'ecs', 'describe-task-definition',
      '--task-definition', currentTaskDefArn,
      '--region', REGION
    ]);

    const taskDef = taskDefInfo.taskDefinition;

    // Step 3: Update image
    console.log('[3/4] Preparing new task definition...');
    let containerFound = false;
    for (const container of taskDef.containerDefinitions) {
      if (container.name === CONTAINER_NAME) {
        console.log(`  Old image: ${container.image}`);
        container.image = NEW_IMAGE;
        console.log(`  New image: ${NEW_IMAGE}`);
        containerFound = true;
        break;
      }
    }

    if (!containerFound) {
      console.log(`WARNING: Container '${CONTAINER_NAME}' not found, using first container`);
      taskDef.containerDefinitions[0].image = NEW_IMAGE;
    }

    // Remove fields that cannot be used in register
    const fieldsToRemove = [
      'taskDefinitionArn', 'revision', 'status', 'requiresAttributes',
      'compatibilities', 'registeredAt', 'registeredBy', 'deregisteredAt'
    ];

    fieldsToRemove.forEach(field => delete taskDef[field]);

    // Save task def to file for registration
    const fs = require('fs');
    fs.writeFileSync('taskdef-deploy.json', JSON.stringify(taskDef, null, 2));

    // Register new task definition
    console.log('[4/4] Registering new task definition...');
    const newTaskDefInfo = await runAWSCommand([
      'ecs', 'register-task-definition',
      '--cli-input-json', `file://taskdef-deploy.json`,
      '--region', REGION
    ]);

    const newTaskDefArn = newTaskDefInfo.taskDefinition.taskDefinitionArn;
    console.log(`  New task definition: ${newTaskDefArn}`);

    // Step 4: Update service
    console.log();
    console.log('Updating ECS service...');
    await runAWSCommand([
      'ecs', 'update-service',
      '--cluster', CLUSTER,
      '--service', SERVICE,
      '--task-definition', newTaskDefArn,
      '--force-new-deployment',
      '--region', REGION
    ]);

    console.log();
    console.log('='.repeat(60));
    console.log('✅ DEPLOYMENT STARTED!');
    console.log('='.repeat(60));
    console.log();
    console.log('Service is being updated with new task definition.');
    console.log();
    console.log('Monitor deployment:');
    console.log(`  aws ecs describe-services --cluster ${CLUSTER} --services ${SERVICE} --region ${REGION}`);
    console.log();
    console.log('Test backend:');
    console.log('  curl https://uslugar.api.oriph.io/api/health');
    console.log();

  } catch (error) {
    console.error();
    console.error('❌ DEPLOYMENT FAILED!');
    console.error(error.message);
    process.exit(1);
  }
}

deploy();

