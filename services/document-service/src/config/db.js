const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); 

try {
  require('@prisma/client');
} catch (error) {
  console.error('Prisma client is not initialized. Please run "prisma generate" and try again.');
  process.exit(1);
}

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

module.exports = { connectDB, prisma };