# Quick Start Guide for Windows

Write-Host "=========================================="
Write-Host "Velora Fashion - Quick Start Setup" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""

# Step 1: Verify AWS CLI
Write-Host "Step 1: Verifying AWS CLI..." -ForegroundColor Cyan
try {
    $awsVersion = aws --version
    Write-Host "✓ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found. Download from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Red
    exit 1
}

# Step 2: Verify GitHub CLI
Write-Host ""
Write-Host "Step 2: Verifying GitHub CLI..." -ForegroundColor Cyan
try {
    $ghVersion = gh --version
    Write-Host "✓ GitHub CLI installed: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ GitHub CLI not found. Download from: https://github.com/cli/cli/releases" -ForegroundColor Red
    exit 1
}

# Step 3: Verify Docker
Write-Host ""
Write-Host "Step 3: Verifying Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Step 4: Configure AWS
Write-Host ""
Write-Host "Step 4: Configuring AWS Credentials..." -ForegroundColor Cyan
$configAWS = Read-Host "Do you want to configure AWS credentials now? (y/n) [default: y]"
if ([string]::IsNullOrWhiteSpace($configAWS) -or $configAWS -eq "y") {
    & ".\scripts\configure-aws.ps1"
}

# Step 5: GitHub Authentication
Write-Host ""
Write-Host "Step 5: GitHub Authentication..." -ForegroundColor Cyan
try {
    $ghStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Already authenticated with GitHub" -ForegroundColor Green
    }
} catch {
    Write-Host "Authenticating with GitHub..." -ForegroundColor Yellow
    gh auth login
}

# Step 6: Add GitHub Secrets
Write-Host ""
Write-Host "Step 6: Adding GitHub Secrets..." -ForegroundColor Cyan
Write-Host ""
Write-Host "You need to add your EC2 SSH key to GitHub Secrets."
Write-Host "Path: Settings → Secrets and variables → Actions → New repository secret"
Write-Host ""
$sshKeyPath = Read-Host "Enter path to your EC2 private key (e.g., C:\Users\user\.ssh\id_rsa.pem) [or press Enter to skip]"

if (-not [string]::IsNullOrWhiteSpace($sshKeyPath) -and (Test-Path $sshKeyPath)) {
    try {
        $keyContent = Get-Content $sshKeyPath -Raw
        Write-Host "Setting EC2_SSH_KEY secret..."
        # Use echo to pipe the key content to gh secret set
        $keyContent | gh secret set EC2_SSH_KEY
        Write-Host "✓ EC2_SSH_KEY secret added" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to set secret. You can do this manually in GitHub UI." -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping SSH key setup. You can add it manually in GitHub:" -ForegroundColor Yellow
    Write-Host "  gh secret set EC2_SSH_KEY < C:\path\to\your\key.pem"
}

# Summary
Write-Host ""
Write-Host "=========================================="
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review DEPLOYMENT_GUIDE.md for detailed instructions"
Write-Host "2. Set up your EC2 instance with Docker"
Write-Host "3. Add EC2_SSH_KEY to GitHub Secrets (if not done above)"
Write-Host "4. Configure your domain and HTTPS with Certbot"
Write-Host "5. Push to main branch to trigger deployment"
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # Test local deployment"
Write-Host "  docker-compose up -d"
Write-Host ""
Write-Host "  # View logs"
Write-Host "  docker logs -f velora-fashion"
Write-Host ""
Write-Host "  # Push to GitHub (triggers deployment)"
Write-Host "  git push origin main"
Write-Host ""
Write-Host "  # View deployment status"
Write-Host "  gh run list"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - DEPLOYMENT_GUIDE.md"
Write-Host "  - README.md"
Write-Host ""
