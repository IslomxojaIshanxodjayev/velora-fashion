FROM node:18-alpine

WORKDIR /app

# Copy package files if they exist
COPY package*.json ./

# Install dependencies if package.json exists, otherwise skip
RUN if [ -f package.json ]; then npm install; else echo "No package.json found"; fi

# Copy application files
COPY . .

# Expose port 8080 for the application
EXPOSE 8080

# Start a simple HTTP server to serve the static files with correct MIME types
CMD ["node", "server.js"]
