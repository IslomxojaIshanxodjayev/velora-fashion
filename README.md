# Velora Fashion - Full Stack Application

A modern web application for Velora Fashion with automated CI/CD deployment to AWS EC2 using Docker and GitHub Actions.

## 📋 Project Structure

```
velora-fashion/
├── css/
│   └── style.css           # Styling
├── js/
│   ├── app.js             # Main application
│   ├── charts.js          # Chart functionality
│   └── crm.js             # CRM features
├── nginx/
│   └── velora-fashion.conf # Nginx reverse proxy config
├── scripts/
│   ├── setup-ec2.sh       # EC2 setup script
│   └── configure-aws.sh   # AWS configuration script
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions workflow
├── Dockerfile             # Docker container definition
├── docker-compose.yml     # Local development setup
├── index.html             # Main application file
├── database.json          # Application data
└── DEPLOYMENT_GUIDE.md    # Comprehensive deployment guide
```

## 🚀 Quick Start

### Local Development

1. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Open http://localhost:8080 in your browser

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 🔧 Setup Requirements

### Windows
1. Install [AWS CLI v2](https://awscli.amazonaws.com/AWSCLIV2.msi)
2. Install [GitHub CLI](https://github.com/cli/cli/releases)
3. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

### macOS/Linux
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install GitHub CLI
brew install gh  # macOS
sudo apt-get install gh  # Ubuntu/Debian

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 🔐 Configuration

### GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **EC2_SSH_KEY** - Your private SSH key for EC2 access
   ```bash
   gh secret set EC2_SSH_KEY < ~/.ssh/your-key.pem
   ```

### AWS Configuration

Configure AWS CLI with your credentials:

**Windows (PowerShell):**
```powershell
.\scripts\configure-aws.ps1
```

**macOS/Linux:**
```bash
bash scripts/configure-aws.sh
```

Or manually:
```bash
aws configure
# Enter:
# AWS Access Key ID: [your-key-id]
# AWS Secret Access Key: [your-secret-key]
# Default region: eu-north-1
# Default output format: json
```

### GitHub CLI Authentication

```bash
gh auth login
# Choose: GitHub.com
# Choose: HTTPS
# Choose: Login with a web browser
# Authorize in browser
```

## 📦 Docker

### Build Docker Image

```bash
docker build -t velora-fashion .
```

### Run Container

```bash
# Development mode
docker run -d -p 8080:8080 -v $(pwd):/app velora-fashion

# Production mode
docker run -d -p 8080:8080 --restart unless-stopped velora-fashion
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚢 GitHub Actions CI/CD

The repository includes an automated workflow (`.github/workflows/deploy.yml`) that:

1. **Builds** your application as a Docker image
2. **Pushes** the image to GitHub Container Registry (ghcr.io)
3. **Deploys** to your EC2 instance automatically

### Triggering Deployment

Simply push to the `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Then watch the deployment in GitHub Actions:
- Go to your repository → Actions
- Click the latest workflow run
- Monitor progress in real-time

## 🔒 HTTPS & Certbot

### Install SSL Certificate

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@56.228.15.15

# Get certificate from Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

### Auto-Renewal

Certbot automatically renews certificates 30 days before expiration:

```bash
# Enable auto-renewal
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

## 📊 Monitoring

### Check Application Status

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@56.228.15.15

# View running containers
docker ps

# Check container logs
docker logs velora-fashion

# Monitor resource usage
docker stats
```

### Health Checks

```bash
# HTTP
curl http://56.228.15.15:8080

# HTTPS
curl https://your-domain.com

# Check headers
curl -I https://your-domain.com
```

## 🔄 CI/CD Pipeline

```
┌─────────────────┐
│  Git Push       │
│  (main branch)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  GitHub Actions Workflow    │
├─────────────────────────────┤
│ 1. Checkout code            │
│ 2. Build Docker image       │
│ 3. Push to ghcr.io          │
│ 4. SSH to EC2               │
│ 5. Pull & deploy image      │
│ 6. Restart container        │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────┐
│  AWS EC2 Instance    │
│  56.228.15.15        │
├──────────────────────┤
│  Docker Container    │
│  (Velora Fashion)    │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Nginx Reverse Proxy │
│  (HTTPS + Certs)     │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Your Domain         │
│  https://yourdomain  │
└──────────────────────┘
```

## 🛠️ Troubleshooting

### Docker Issues

```bash
# Rebuild image without cache
docker build --no-cache -t velora-fashion .

# Remove dangling images
docker image prune -a

# Check Docker logs
docker logs velora-fashion

# Restart container
docker restart velora-fashion
```

### GitHub Actions Issues

```bash
# View workflow logs
gh run list

# Get detailed run info
gh run view <run-id> --log
```

### EC2 Connection Issues

```bash
# Test SSH connection
ssh -i your-key.pem ec2-user@56.228.15.15

# Check security group allows SSH (port 22)
# Check security group allows HTTP (port 80)
# Check security group allows HTTPS (port 443)
```

### Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# View certificate details
sudo openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
```

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [Docker Docs](https://docs.docker.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS EC2 Docs](https://docs.aws.amazon.com/ec2/)
- [Certbot Docs](https://certbot.eff.org/)
- [Nginx Docs](https://nginx.org/en/docs/)

## 🔗 Useful Commands

### Git
```bash
# Clone repository
git clone https://github.com/IslomxojaIshanxodjayev/velora-fashion.git
cd velora-fashion

# View remote
git remote -v

# Fetch latest changes
git fetch origin

# Pull latest changes
git pull origin main

# Push changes
git push origin main
```

### GitHub CLI
```bash
# View repository info
gh repo view

# List workflows
gh workflow list

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Create issue
gh issue create

# Create pull request
gh pr create
```

### AWS CLI
```bash
# Configure credentials
aws configure

# List EC2 instances
aws ec2 describe-instances --region eu-north-1

# Get instance info
aws ec2 describe-instances --region eu-north-1 --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress,State.Name]' --output table
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues and questions:
1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Review GitHub Actions logs
3. Check EC2 instance logs
4. Consult Docker documentation

---

**Last Updated:** 2026-06-14
**Status:** ✅ Ready for Deployment
