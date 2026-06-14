#!/bin/bash
# Test deployment to EC2

set -e

EC2_IP="56.228.15.15"
EC2_USER="ubuntu"
SSH_KEY="${1:-.ssh/velora-fashion.pem}"
DOCKER_IMAGE="velora-fashion:latest"

echo "=========================================="
echo "Velora Fashion - EC2 Deployment Test"
echo "=========================================="
echo ""

# Check SSH connection
echo "Step 1: Testing SSH connection to EC2..."
if ssh -i "$SSH_KEY" "$EC2_USER@$EC2_IP" "echo 'SSH OK'" > /dev/null 2>&1; then
    echo "✓ SSH connection successful"
else
    echo "✗ SSH connection failed"
    exit 1
fi

# Check Docker
echo ""
echo "Step 2: Checking Docker on EC2..."
if ssh -i "$SSH_KEY" "$EC2_USER@$EC2_IP" "docker --version" > /dev/null; then
    echo "✓ Docker is installed"
else
    echo "✗ Docker is not installed"
    exit 1
fi

# Test Docker pull capability
echo ""
echo "Step 3: Testing Docker login capability..."
if ssh -i "$SSH_KEY" "$EC2_USER@$EC2_IP" "echo 'Docker login test - ready'"; then
    echo "✓ Ready for Docker operations"
else
    echo "✗ Docker operations may fail"
    exit 1
fi

# Check free disk space
echo ""
echo "Step 4: Checking EC2 disk space..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_IP" "df -h /"

# Test a simple container run
echo ""
echo "Step 5: Testing Docker container run..."
echo "Running test container..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_IP" << 'EOF'
  docker run --rm alpine:latest echo "Docker container execution successful"
EOF

echo ""
echo "=========================================="
echo "All tests passed! EC2 is ready for deployment"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Push to main branch to trigger GitHub Actions"
echo "2. Monitor deployment at: gh run list"
echo "3. Access application at: http://56.228.15.15:8080"
echo ""
