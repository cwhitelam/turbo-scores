FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (we need dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Create a simple production server
RUN echo 'import express from "express";import { fileURLToPath } from "url";import { dirname, join } from "path";const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);const app = express();const port = process.env.PORT || 3000;app.use(express.static(join(__dirname, "dist")));app.get("*", (req, res) => {res.sendFile(join(__dirname, "dist", "index.html"));});app.listen(port, () => {console.log(`Server running on port ${port}`);});' > server.js

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 