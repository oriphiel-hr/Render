#!/usr/bin/env python3
"""
Deploy uslugar backend to AWS ECS
Usage: python deploy-to-aws.py
"""

import boto3
import json

# Configuration
REGION = 'eu-north-1'
CLUSTER = 'apps-cluster'
SERVICE = 'uslugar-service-2gk1f1mv'
NEW_IMAGE = '666203386231.dkr.ecr.eu-north-1.amazonaws.com/uslugar-api:ff14e36'
CONTAINER_NAME = 'uslugar'

print("=" * 60)
print("  Deploying Uslugar Backend to AWS ECS")
print("=" * 60)
print()

# Initialize AWS clients
ecs = boto3.client('ecs', region_name=REGION)

print(f"Region: {REGION}")
print(f"Cluster: {CLUSTER}")
print(f"Service: {SERVICE}")
print(f"New Image: {NEW_IMAGE}")
print()

# Step 1: Get current task definition
print("[1/4] Fetching current task definition...")
response = ecs.describe_services(
    cluster=CLUSTER,
    services=[SERVICE]
)

if not response['services']:
    print(f"ERROR: Service {SERVICE} not found!")
    exit(1)

current_task_def_arn = response['services'][0]['taskDefinition']
print(f"  Current: {current_task_def_arn}")

# Step 2: Get task definition details
print("[2/4] Downloading task definition...")
response = ecs.describe_task_definition(taskDefinition=current_task_def_arn)
task_def = response['taskDefinition']

# Step 3: Update image and prepare new task definition
print("[3/4] Preparing new task definition...")

# Find container and update image
container_found = False
for container in task_def['containerDefinitions']:
    if container['name'] == CONTAINER_NAME:
        old_image = container['image']
        container['image'] = NEW_IMAGE
        container_found = True
        print(f"  Old image: {old_image}")
        print(f"  New image: {NEW_IMAGE}")
        break

if not container_found:
    print(f"WARNING: Container '{CONTAINER_NAME}' not found, using first container")
    task_def['containerDefinitions'][0]['image'] = NEW_IMAGE

# Remove fields that cannot be used in register_task_definition
fields_to_remove = [
    'taskDefinitionArn', 'revision', 'status', 'requiresAttributes',
    'compatibilities', 'registeredAt', 'registeredBy', 'deregisteredAt'
]

for field in fields_to_remove:
    task_def.pop(field, None)

# Register new task definition
print("[4/4] Registering new task definition...")
response = ecs.register_task_definition(**task_def)
new_task_def_arn = response['taskDefinition']['taskDefinitionArn']
print(f"  New task definition: {new_task_def_arn}")

# Step 4: Update service
print()
print("Updating ECS service...")
response = ecs.update_service(
    cluster=CLUSTER,
    service=SERVICE,
    taskDefinition=new_task_def_arn,
    forceNewDeployment=True
)

print()
print("=" * 60)
print("✅ DEPLOYMENT STARTED!")
print("=" * 60)
print()
print("Service is being updated with new task definition.")
print()
print("Monitor deployment:")
print(f"  aws ecs describe-services --cluster {CLUSTER} --services {SERVICE} --region {REGION}")
print()
print("Check logs:")
print(f"  CloudWatch Logs: /ecs/uslugar")
print()
print("Test backend:")
print("  curl https://uslugar.api.oriph.io/api/health")
print()

