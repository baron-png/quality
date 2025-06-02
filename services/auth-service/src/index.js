require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const { connectDB } = require('./services/db');
const routes = require('./routes/index');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      'https://www.dualdimension.org', // Production origin
      'http://localhost:3000', 
      '*'       // Local development origin
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

// Connect to database
connectDB();

// Routes
app.use('/api', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Auth Service running on port ${port}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected');
  process.exit(0);
});

module.exports = app;