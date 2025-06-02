const { Kafka } = require('kafkajs');
const dotenv = require('dotenv');
dotenv.config();

const kafka = new Kafka({
  clientId: 'tenant-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'], // Use KAFKA_BROKER from environment
});

let producer;

const connectProducer = async () => {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    console.log('Kafka producer connected for tenant-service');
  }
};

const sendEvent = async (topic, payload) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    });
    console.log(`Event sent to topic ${topic}:`, payload);
  } catch (error) {
    console.error(`Error sending event to topic ${topic}:`, error.message);
    throw error;
  }
};

const disconnectProducer = async () => {
  if (producer) {
    await producer.disconnect();
    console.log('Kafka producer disconnected for tenant-service');
  }
};

module.exports = { connectProducer, sendEvent, disconnectProducer };
