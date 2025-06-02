# Step 1: Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Step 2: Production Stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the built application from the builder stage
COPY --from=builder /app /app

# Expose the application port
EXPOSE 5000

# Start the application (skip migrations and seeding)
CMD ["node", "src/index.js"]