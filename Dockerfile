# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files, built assets, and server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./

# Install production dependencies only
RUN npm ci --only=production

# Expose the port the app runs on
ENV PORT=3000
EXPOSE 3000

# Start the application using the production server
CMD ["node", "server.js"] 