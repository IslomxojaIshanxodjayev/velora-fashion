# AWS CLI Configuration Script for Windows PowerShell

Write-Host "==========================================" 
Write-Host "AWS CLI Configuration" -ForegroundColor Green
Write-Host "==========================================" 
Write-Host ""
Write-Host "This script will guide you through configuring AWS CLI."
Write-Host "You'll need your AWS credentials from the AWS Console."
Write-Host ""

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI version:"
    Write-Host $awsVersion -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: AWS CLI is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "To configure AWS CLI, you need:"
Write-Host "1. AWS Access Key ID"
Write-Host "2. AWS Secret Access Key"
Write-Host "3. Default region (we recommend: eu-north-1)"
Write-Host ""

Write-Host "Getting your AWS credentials:" -ForegroundColor Yellow
Write-Host "1. Go to https://console.aws.amazon.com/"
Write-Host "2. Click on your username (top right)"
Write-Host "3. Click 'Security Credentials'"
Write-Host "4. Under 'Access keys', click 'Create access key'"
Write-Host "5. Choose 'Application running on an AWS compute service'"
Write-Host "6. Copy your Access Key ID and Secret Access Key"
Write-Host ""

# Prompt for credentials
$accessKeyId = Read-Host "AWS Access Key ID"
$secretAccessKey = Read-Host "AWS Secret Access Key (input hidden)" -AsSecureString
$secretAccessKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secretAccessKey)
)
$region = Read-Host "Default region (eu-north-1)"
if ([string]::IsNullOrWhiteSpace($region)) {
    $region = "eu-north-1"
}
$output = Read-Host "Default output format (json) [Enter for json]"
if ([string]::IsNullOrWhiteSpace($output)) {
    $output = "json"
}

# Configure AWS CLI
Write-Host ""
Write-Host "Configuring AWS CLI..." -ForegroundColor Cyan

# Create .aws directory if it doesn't exist
$awsDir = Join-Path $env:USERPROFILE ".aws"
if (-not (Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir -Force | Out-Null
}

# Write credentials file
$credentialsFile = Join-Path $awsDir "credentials"
$credentialsContent = @"
[default]
aws_access_key_id = $accessKeyId
aws_secret_access_key = $secretAccessKeyPlain
"@
Set-Content -Path $credentialsFile -Value $credentialsContent -Force

# Write config file
$configFile = Join-Path $awsDir "config"
$configContent = @"
[default]
region = $region
output = $output
"@
Set-Content -Path $configFile -Value $configContent -Force

Write-Host "Configuration Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your AWS credentials are stored in:"
Write-Host "  $credentialsFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your AWS config is stored in:"
Write-Host "  $configFile" -ForegroundColor Cyan
Write-Host ""

# Verify configuration
Write-Host "Verifying configuration..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Host "Correct AWS CLI is properly configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Account ID: $($identity.Account)"
    Write-Host "User ARN: $($identity.Arn)"
    Write-Host "User ID: $($identity.UserId)"
} catch {
    Write-Host "X AWS CLI configuration verification failed!" -ForegroundColor Red
    Write-Host "Please check your credentials and try again."
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up EC2 instance with Docker"
Write-Host "2. Add GitHub Secrets (EC2_SSH_KEY)"
Write-Host "3. Push to main branch to trigger deployment"
Write-Host ""
