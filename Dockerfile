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

# Start a simple HTTP server to serve the static files
CMD ["node", "-e", "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { const filePath = path.join('/app', req.url === '/' ? 'index.html' : req.url); fs.readFile(filePath, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); res.end(data); } }); }); server.listen(8080, () => console.log('Server running on port 8080'));"]
