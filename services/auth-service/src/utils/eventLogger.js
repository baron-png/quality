// filepath: c:\Users\Administrator\parrot\auth-deployed\auth-service\src\utils\eventLogger.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logEvent = async (eventType, eventData) => {
  try {
    await prisma.eventLog.create({
      data: { eventType, eventData: JSON.stringify(eventData) },
    });
    console.log(`Event logged: ${eventType}`);
  } catch (error) {
    console.error('Error logging event:', error.message);
  }
};

module.exports = { logEvent };