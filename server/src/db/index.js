const { getConfig } = require('../config');
const { createMemoryRepository } = require('./memory');
const { connectMongo } = require('./mongo');

async function connectRepository() {
  const { mongoUri } = getConfig();
  if (!mongoUri) {
    console.log('No MONGODB_URI set — using the in-memory store');
    return createMemoryRepository();
  }

  let lastError = null;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt})`);
      const repo = await connectMongo(mongoUri);
      console.log('MongoDB connected');
      return repo;
    } catch (err) {
      lastError = err;
      console.log('MongoDB not ready yet');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

module.exports = { connectRepository };
