const { Server } = require('socket.io');

let io;

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: false,
    },
  });

  // Do not register event handlers here!
  // Event handlers will be registered in server.js after all modules are loaded.

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('WebSocket instance not initialized. Call initWebSocket first.');
  }
  return io;
};

module.exports = { initWebSocket, getIO };
