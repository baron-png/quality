# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL (required for Prisma engine)
RUN apk add --no-cache openssl

# Copy package.json and package-lock.json to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Optional: Install Prisma CLI globally (not necessary unless you use it interactively)
RUN npm install -g prisma

# Copy Prisma files (including schema and migrations)
COPY prisma ./prisma

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Apply any existing migrations to the database
RUN npx prisma migrate deploy

# Expose port if your app listens on one (adjust if necessary)
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]
