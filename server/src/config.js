function getConfig() {
  return {
    port: Number(process.env.PORT) || 4721,
    mongoUri: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'dev-only-stackproof-secret',
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:43123',
    isProd: process.env.NODE_ENV === 'production',
  };
}

module.exports = { getConfig };
