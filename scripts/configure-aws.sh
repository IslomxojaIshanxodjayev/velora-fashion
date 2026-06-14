#!/usr/bin/env bash
# AWS CLI Configuration Helper Script

echo "=========================================="
echo "AWS CLI Configuration"
echo "=========================================="
echo ""
echo "This script will guide you through configuring AWS CLI."
echo "You'll need your AWS credentials from the AWS Console."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "ERROR: AWS CLI is not installed!"
    exit 1
fi

echo "AWS CLI version:"
aws --version
echo ""

echo "To configure AWS CLI, you need:"
echo "1. AWS Access Key ID"
echo "2. AWS Secret Access Key"
echo "3. Default region (we recommend: eu-north-1)"
echo ""

echo "Getting your AWS credentials:"
echo "1. Go to https://console.aws.amazon.com/"
echo "2. Click on your username (top right)"
echo "3. Click 'Security Credentials'"
echo "4. Under 'Access keys', click 'Create access key'"
echo "5. Choose 'Application running on an AWS compute service'"
echo "6. Copy your Access Key ID and Secret Access Key"
echo ""

# Run AWS configure
aws configure

echo ""
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "Your AWS credentials are stored in:"
echo "  Linux/macOS: ~/.aws/credentials"
echo "  Windows: %UserProfile%\.aws\credentials"
echo ""
echo "Your AWS config is stored in:"
echo "  Linux/macOS: ~/.aws/config"
echo "  Windows: %UserProfile%\.aws\config"
echo ""

# Verify configuration
echo "Verifying configuration..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✓ AWS CLI is properly configured!"
    echo ""
    aws sts get-caller-identity
else
    echo "✗ AWS CLI configuration verification failed!"
    echo "Please check your credentials and try again."
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Set up EC2 instance with Docker"
echo "2. Add GitHub Secrets (EC2_SSH_KEY)"
echo "3. Push to main branch to trigger deployment"
echo ""
