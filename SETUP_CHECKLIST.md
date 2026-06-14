# 🚀 Setup Checklist - Velora Fashion AWS Deployment

## ✅ Completed Steps

### 1. ✓ Tools Installed
- [x] AWS CLI v2 installed (`aws --version`: aws-cli/2.35.4)
- [x] GitHub CLI installed (`gh --version`: v2.60.1)
- [x] Git installed and configured

### 2. ✓ GitHub Authentication
- [x] GitHub CLI authenticated as `IslomxojaIshanxodjayev`
- [x] HTTPS protocol configured
- [x] Git credentials configured

### 3. ✓ Deployment Infrastructure Created
- [x] `Dockerfile` - Container definition
- [x] `docker-compose.yml` - Local development setup
- [x] `.github/workflows/deploy.yml` - GitHub Actions CI/CD workflow
- [x] `nginx/velora-fashion.conf` - HTTPS reverse proxy configuration
- [x] `scripts/configure-aws.ps1` - AWS config for Windows
- [x] `scripts/configure-aws.sh` - AWS config for Linux/macOS
- [x] `scripts/setup-ec2.sh` - EC2 instance setup script
- [x] `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- [x] `README.md` - Project documentation
- [x] `QUICK_START.ps1` - Windows setup automation
- [x] `.gitignore` - Sensitive files protection

### 4. ✓ Git Repository Updated
- [x] All files committed to GitHub
- [x] Pushed to main branch
- [x] Commit: feat: Add Docker, GitHub Actions, and AWS deployment infrastructure

---

## 📋 Next Steps - IMPORTANT

### Step 1: Configure AWS Credentials
**Status:** ⏳ Pending

Choose one method:

**Option A: Windows PowerShell (Recommended)**
```powershell
.\scripts\configure-aws.ps1
```
Then enter your AWS credentials:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `eu-north-1`
- Default output format: `json`

**Option B: Command Line**
```bash
aws configure
```

**Option C: Manual Configuration**
Create `%UserProfile%\.aws\credentials`:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

Create `%UserProfile%\.aws\config`:
```
[default]
region = eu-north-1
output = json
```

### Step 2: Set Up EC2 Instance with Docker
**Status:** ⏳ Pending

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@56.228.15.15
   ```

2. **Copy the setup script and run it:**
   ```bash
   # Download the script content and run:
   bash scripts/setup-ec2.sh
   ```

   OR **Run commands manually:**
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker ec2-user
   ```

3. **Install Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Install Certbot for HTTPS:**
   ```bash
   sudo yum install -y certbot
   ```

### Step 3: Add GitHub Secrets
**Status:** ⏳ Pending

Your GitHub Actions workflow needs secrets to deploy:

#### Add EC2_SSH_KEY
This is your private SSH key for EC2 access.

**Using GitHub CLI:**
```powershell
# Windows PowerShell
gc C:\Users\user\.ssh\your-key.pem | gh secret set EC2_SSH_KEY
```

```bash
# Linux/macOS
cat ~/.ssh/your-key.pem | gh secret set EC2_SSH_KEY
```

**Using GitHub Web UI:**
1. Go to: GitHub → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `EC2_SSH_KEY`
4. Value: Paste entire private key file content
5. Click "Add secret"

### Step 4: Configure Your Domain
**Status:** ⏳ Pending

1. **Update DNS Records:**
   - Add `A` record: `your-domain.com` → `56.228.15.15`
   - Add `A` record: `www.your-domain.com` → `56.228.15.15`
   - Wait for DNS propagation (5-30 minutes)

2. **Update EC2 Security Group:**
   - Allow inbound on port 80 (HTTP - for Certbot)
   - Allow inbound on port 443 (HTTPS)
   - Allow inbound on port 22 (SSH)

3. **Update Nginx Configuration:**
   Edit `/etc/nginx/conf.d/velora-fashion.conf` on EC2:
   - Replace `your-domain.com` with your actual domain

### Step 5: Install SSL Certificate
**Status:** ⏳ Pending

SSH into EC2 and get certificate from Let's Encrypt:
```bash
ssh -i your-key.pem ec2-user@56.228.15.15

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# When prompted:
# - Enter your email
# - Agree to terms
# - Choose whether to share email
```

### Step 6: Set Up Nginx
**Status:** ⏳ Pending

On your EC2 instance:
```bash
# Install Nginx
sudo yum install -y nginx

# Copy the nginx config from the repo:
# Edit /etc/nginx/conf.d/velora-fashion.conf
# Change 'your-domain.com' to your actual domain

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### Step 7: Trigger First Deployment
**Status:** ⏳ Ready

Once all above steps are complete, trigger deployment:

```bash
# Make a small change (optional)
# git add .
# git commit -m "Trigger deployment"

# Push to main
git push origin main

# Watch deployment in GitHub Actions
gh run list
```

---

## 📊 Deployment Architecture

```
┌──────────────────────────────────────┐
│     Your Local Windows Machine       │
├──────────────────────────────────────┤
│ - AWS CLI v2.35.4                    │
│ - GitHub CLI v2.60.1                 │
│ - Git                                 │
│ - Docker Desktop (optional)           │
└──────────────┬───────────────────────┘
               │
               │ git push origin main
               ▼
┌──────────────────────────────────────┐
│    GitHub Repository                 │
│  IslomxojaIshanxodjayev/velora-fashion│
├──────────────────────────────────────┤
│ - Main Branch                        │
│ - .github/workflows/deploy.yml       │
│ - Dockerfile                         │
│ - Source code                        │
└──────────────┬───────────────────────┘
               │
               │ on: push to main
               ▼
┌──────────────────────────────────────┐
│   GitHub Actions (CI/CD)             │
├──────────────────────────────────────┤
│ 1. Checkout code                     │
│ 2. Build Docker image                │
│ 3. Push to ghcr.io                   │
│ 4. SSH to EC2                        │
│ 5. Pull & run container              │
└──────────────┬───────────────────────┘
               │
               │ SSH + Docker pull
               ▼
┌──────────────────────────────────────┐
│    AWS EC2 Instance                  │
│    56.228.15.15 (eu-north-1)         │
├──────────────────────────────────────┤
│ - Docker running                     │
│ - Container: velora-fashion:latest   │
│ - Port 8080 (internal)               │
│ - Nginx port 8080 → port 8080       │
└──────────────┬───────────────────────┘
               │
               │ localhost:8080
               ▼
┌──────────────────────────────────────┐
│        Nginx Reverse Proxy            │
├──────────────────────────────────────┤
│ - Port 80 → 443 (redirect HTTP)      │
│ - Port 443 (HTTPS with Certbot SSL)  │
│ - Proxy to localhost:8080            │
│ - Domain: your-domain.com            │
└──────────────┬───────────────────────┘
               │
               │ HTTPS
               ▼
┌──────────────────────────────────────┐
│     Users Access Application         │
│     https://your-domain.com          │
└──────────────────────────────────────┘
```

---

## 🔧 Quick Command Reference

### AWS Configuration
```powershell
# Windows PowerShell
.\scripts\configure-aws.ps1
```

### Local Testing
```bash
# Build Docker image
docker build -t velora-fashion .

# Run with Docker Compose
docker-compose up -d

# View logs
docker logs -f velora-fashion

# Stop
docker-compose down
```

### GitHub Commands
```bash
# Check auth status
gh auth status

# Add secrets
gh secret set EC2_SSH_KEY < C:\path\to\key.pem

# View workflows
gh workflow list

# View runs
gh run list

# View specific run
gh run view <run-id> --log
```

### Git Commands
```bash
# Check status
git status

# View commits
git log --oneline -5

# View branches
git branch -a

# Push to GitHub
git push origin main
```

### EC2 SSH Commands
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@56.228.15.15

# Run Docker commands
docker ps
docker logs velora-fashion
docker restart velora-fashion

# Check certificate
sudo certbot certificates

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## ⚠️ Important Reminders

1. **EC2_SSH_KEY** must be added to GitHub Secrets for deployment to work
2. **Domain DNS** must point to EC2 IP (56.228.15.15)
3. **SSL Certificate** must be installed on EC2 for HTTPS
4. **Nginx** must be configured with your domain name
5. **Security Group** must allow ports 22, 80, 443 inbound

---

## 📚 Documentation Files

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
- **[README.md](README.md)** - Project overview and quick start
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - GitHub Actions workflow
- **[Dockerfile](Dockerfile)** - Container definition
- **[docker-compose.yml](docker-compose.yml)** - Local dev setup

---

## ❓ Troubleshooting

### AWS CLI not found
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
aws --version
```

### GitHub CLI not authenticated
```bash
gh auth login
# Follow the browser authentication steps
```

### Docker not found locally
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

### GitHub Actions deployment fails
1. Check EC2_SSH_KEY is set: `gh secret list`
2. Verify SSH key permissions: `chmod 600 your-key.pem`
3. Check EC2 security group allows SSH
4. Review workflow logs: `gh run view <run-id> --log`

### EC2 connection fails
1. Verify IP: `56.228.15.15`
2. Verify security group allows SSH (port 22)
3. Verify SSH key file path
4. Check key permissions: `chmod 600 your-key.pem`

---

**Status:** ✅ Infrastructure Ready | ⏳ Configuration In Progress
**Last Updated:** 2026-06-14
**Version:** 1.0
