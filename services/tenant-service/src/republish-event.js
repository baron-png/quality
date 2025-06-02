const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'manual-producer', brokers: ['kafka:9092'] });
const producer = kafka.producer();

const republishEvent = async () => {
  await producer.connect();

  const eventPayload = {
    id: 'c066afda-3c6a-49d5-8196-48af07f8cd56',
    email: 'olivecyber20@gmail.com',
    roleIds: ['dad1bed5-571f-4659-8cbf-75668e325c60'],
    tenantId: '41a1b88e-805d-43b0-be6d-38677d6502f0',
    departmentId: '2f715b82-9d59-4c41-b513-78b209318add',
  };

  try {
    await producer.send({
      topic: 'user.updated',
      messages: [{ value: JSON.stringify(eventPayload) }],
    });
    console.log('Event republished to topic user.updated:', eventPayload);
  } catch (error) {
    console.error('Error republishing event:', error.message);
  } finally {
    await producer.disconnect();
  }
};

republishEvent().catch((error) => {
  console.error('Error in republishEvent:', error.message);
});
