const jwt = require('jsonwebtoken');
const { getConfig } = require('../config');
const { AppError } = require('../lib/errors');

function signToken(userId) {
  const { jwtSecret } = getConfig();
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    next(new AppError(401, 'Sign in to continue'));
    return;
  }

  try {
    const { jwtSecret } = getConfig();
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'Session expired, sign in again'));
  }
}

module.exports = { signToken, requireAuth };
