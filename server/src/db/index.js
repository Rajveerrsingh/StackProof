const { getConfig } = require('../config');
const { createMemoryRepository } = require('./memory');
const { connectMongo } = require('./mongo');

async function connectRepository() {
  const { mongoUri } = getConfig();
  if (!mongoUri) {
    console.log('No MONGODB_URI set — using the in-memory store');
    return createMemoryRepository();
  }

  console.log('Connecting to MongoDB');
  const repo = await connectMongo(mongoUri);
  console.log('MongoDB connected');
  return repo;
}

module.exports = { connectRepository };
