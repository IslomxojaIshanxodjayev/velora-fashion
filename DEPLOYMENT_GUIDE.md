# Velora Fashion - AWS EC2 Deployment Guide

## Overview
This guide walks you through deploying the Velora Fashion application to AWS EC2 with Docker, GitHub Actions CI/CD, and HTTPS support using Certbot.

## Architecture
```
GitHub Repository
    ↓ (on push to main)
GitHub Actions Workflow
    ↓ (builds and pushes Docker image)
GitHub Container Registry (ghcr.io)
    ↓ (pulls latest image)
EC2 Instance (56.228.15.15)
    ↓ (runs Docker container)
Nginx + Certbot (HTTPS)
    ↓
Your Domain (example.com)
```

## Prerequisites
- AWS EC2 instance running (already created: 56.228.15.15, eu-north-1)
- Domain name (for HTTPS with Certbot)
- GitHub repository (IslomxojaIshanxodjayev/velora-fashion)
- SSH key pair for EC2 instance

## Step 1: Configure GitHub Secrets

You need to add the following secrets to your GitHub repository:

### EC2_SSH_KEY
Your private SSH key that allows GitHub Actions to connect to your EC2 instance.

**To get your EC2 SSH key:**
1. Go to AWS Console → EC2 → Key Pairs
2. Download or copy your private key (`.pem` file)
3. Go to GitHub → Settings → Secrets and variables → Actions
4. Click "New repository secret"
5. Name: `EC2_SSH_KEY`
6. Value: Paste the entire content of your private key file

### GITHUB_TOKEN
This is automatically available in GitHub Actions, no manual configuration needed.

**Steps to add secrets:**
```bash
# Using GitHub CLI (already installed)
gh secret set EC2_SSH_KEY < /path/to/your/private/key.pem
```

Or via GitHub Web Interface:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"

## Step 2: Set Up EC2 Instance

SSH into your EC2 instance and run the setup script:

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@56.228.15.15

# Download and run setup script (copy from scripts/setup-ec2.sh)
# Or run the commands manually:
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Create deployment directory
sudo mkdir -p /opt/velora-fashion
sudo chown -R ec2-user:ec2-user /opt/velora-fashion
```

## Step 3: Configure Domain and HTTPS

### Update EC2 Security Group
1. AWS Console → EC2 → Security Groups
2. Allow inbound traffic on:
   - Port 22 (SSH)
   - Port 80 (HTTP - for Certbot validation)
   - Port 443 (HTTPS)

### Point Domain to EC2 Instance
Update your domain's DNS records:
- A Record: `your-domain.com` → `56.228.15.15`
- A Record: `www.your-domain.com` → `56.228.15.15`

### Install SSL Certificate with Certbot

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@56.228.15.15

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Follow the prompts and choose your email
# Certificates will be saved to /etc/letsencrypt/live/your-domain.com/
```

### Install Nginx and Configure Reverse Proxy

```bash
# Install Nginx
sudo yum install -y nginx

# Copy the nginx configuration (from nginx/velora-fashion.conf)
# Edit /etc/nginx/conf.d/velora-fashion.conf and update 'your-domain.com' to your actual domain

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 4: Set Up GitHub Actions Workflow

The workflow file (`.github/workflows/deploy.yml`) is already configured to:

1. **Trigger:** On every push to the `main` branch
2. **Build:** Create Docker image from Dockerfile
3. **Push:** Push image to GitHub Container Registry (ghcr.io)
4. **Deploy:** SSH to EC2 and:
   - Pull the latest Docker image
   - Stop the old container
   - Start the new container on port 8080
   - Nginx proxies requests to port 8080

### Verify Workflow

```bash
# Check workflow status
gh workflow view deploy.yml

# View recent runs
gh run list --workflow=deploy.yml

# View specific run logs
gh run view <run-id> --log
```

## Step 5: Test the Deployment

1. **Make a change to your repository:**
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

2. **Watch GitHub Actions run:**
   - Go to GitHub → Actions
   - Click on the workflow run
   - Monitor the build and deploy steps

3. **Test your application:**
   - HTTP: `http://56.228.15.15:8080`
   - HTTPS: `https://your-domain.com`

## Step 6: Certbot Auto-Renewal Setup

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@56.228.15.15

# Set up automatic renewal with cron
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer

# Or manually add to crontab (optional)
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## Troubleshooting

### Docker not found error
```bash
# Refresh docker group membership
newgrp docker
# Or log out and log back in
```

### GitHub Actions deployment fails
1. Check EC2_SSH_KEY secret is properly set
2. Verify SSH key has correct permissions: `chmod 600 key.pem`
3. Check EC2 security group allows SSH from GitHub Actions IPs
4. Verify EC2 instance is running

### Certificate renewal fails
```bash
# Check certificate status
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Nginx shows 502 Bad Gateway
```bash
# Check if Docker container is running
docker ps

# Check Docker logs
docker logs velora-fashion

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Useful Commands

### Local Development
```bash
# Build Docker image locally
docker build -t velora-fashion .

# Run with Docker Compose
docker-compose up -d

# View logs
docker logs -f velora-fashion

# Stop container
docker-compose down
```

### EC2 Management
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@56.228.15.15

# Check running containers
docker ps

# View application logs
docker logs velora-fashion

# Restart container
docker restart velora-fashion

# Manual deployment (if GitHub Actions fails)
docker pull ghcr.io/IslomxojaIshanxodjayev/velora-fashion:latest
docker stop velora-fashion || true
docker rm velora-fashion || true
docker run -d --name velora-fashion --restart unless-stopped -p 8080:8080 ghcr.io/IslomxojaIshanxodjayev/velora-fashion:latest
```

## Monitoring and Maintenance

### Check application health
```bash
curl https://your-domain.com
curl -I https://your-domain.com  # Check headers
```

### View Docker stats
```bash
docker stats
```

### Check Nginx status
```bash
sudo systemctl status nginx
```

## Security Considerations

1. **SSH Key Management:**
   - Keep EC2_SSH_KEY secret secure
   - Regularly rotate SSH keys
   - Use key-based authentication only

2. **Certificate Security:**
   - Certbot auto-renewal is enabled
   - Certificates auto-renew 30 days before expiration
   - Monitor certificate expiration

3. **Firewall:**
   - Only allow necessary ports in security group
   - Block suspicious IPs with security group rules

4. **Updates:**
   - Regularly update EC2 instance: `sudo yum update -y`
   - Update Docker images regularly
   - Monitor security patches

## Next Steps

1. Configure your domain name
2. Add EC2_SSH_KEY to GitHub secrets
3. SSH into EC2 and run setup script
4. Install Certbot and get SSL certificate
5. Configure Nginx reverse proxy
6. Push changes to trigger first deployment
7. Monitor deployment in GitHub Actions

For more information:
- GitHub Actions: https://docs.github.com/en/actions
- Docker: https://docs.docker.com/
- Certbot: https://certbot.eff.org/
- Nginx: https://nginx.org/en/docs/
