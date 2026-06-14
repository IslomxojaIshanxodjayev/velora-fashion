#!/bin/bash

# EC2 Instance Setup Script for Velora Fashion Deployment
# Run this script once on your EC2 instance to set it up for Docker deployments

set -e

echo "=========================================="
echo "Setting up EC2 Instance for Docker"
echo "=========================================="

# Update system packages
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker

# Start Docker service
echo "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (so you don't need sudo for docker commands)
echo "Adding ec2-user to docker group..."
sudo usermod -a -G docker ec2-user

# Install Docker Compose (optional but recommended)
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (optional, for direct deployments)
echo "Installing Node.js..."
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install certbot for SSL certificates
echo "Installing Certbot..."
sudo yum install -y certbot python3-certbot-nginx

# Create deployment directory
echo "Creating deployment directory..."
sudo mkdir -p /opt/velora-fashion
sudo chown -R ec2-user:ec2-user /opt/velora-fashion

echo "=========================================="
echo "EC2 setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets with your EC2 SSH key:"
echo "   - EC2_SSH_KEY: Your private key to connect to EC2"
echo ""
echo "2. To set up HTTPS with Let's Encrypt:"
echo "   sudo certbot certonly --standalone -d your-domain.com"
echo ""
echo "3. Configure a reverse proxy (nginx) to handle HTTPS and forward to Docker container"
echo ""
