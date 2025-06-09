const admin = require('firebase-admin');
const serviceAccount = require('../../services/dualdimension-66190-firebase-adminsdk-fbsvc-ab4439d4df.json'); // Replace with the correct path

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'dualdimension-66190.firebasestorage.app', // Correct bucket name
});

// Get a reference to the storage bucket
const bucket = admin.storage().bucket();

module.exports = { bucket };