const express = require('express');
const { PrismaClient } = require('@prisma/client');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Middleware
const allowedOrigins = ['http://localhost:3000', 'https://www.dualdimension.org'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Mount routes under /tenant/api
app.use('/tenant/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Tenant Service is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    console.log(`Tenant Service running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});