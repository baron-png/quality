require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const routes = require('./routes');
const { initWebSocket } = require('./services/websocket');
const { syncDocument, syncChangeRequest } = require('./controllers/notification.controller');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// CORS configuration (temporary for testing)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api', routes);

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize WebSocket
const io = initWebSocket(server);
io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('join', ({ tenantId }) => {
    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
      logger.info(`Socket ${socket.id} joined room tenant:${tenantId}`);
    }
  });

  socket.on('document.created', async (payload) => {
    try {
      await syncDocument(payload);
      socket.emit('document.synchronized', { status: 'Document synchronized', id: payload.id });
    } catch (error) {
      logger.error('Error processing document.created event:', error);
      socket.emit('error', { error: 'Failed to sync document' });
    }
  });

  socket.on('changeRequest.created', async (payload) => {
    try {
      await syncChangeRequest(payload);
      socket.emit('changeRequest.synchronized', { status: 'Change request synchronized', id: payload.id });
    } catch (error) {
      logger.error('Error processing changeRequest.created event:', error);
      socket.emit('error', { error: 'Failed to sync change request' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5006;
const startService = async () => {
  try {
    server.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start notification service:', error);
    process.exit(1);
  }
};

startService();

module.exports = { app, server };
