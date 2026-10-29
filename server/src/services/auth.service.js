const bcrypt = require('bcryptjs');
const { AppError } = require('../lib/errors');
const { signToken } = require('../middleware/auth');

const ROUNDS = 10;

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    headline: user.headline || '',
    location: user.location || '',
    bio: user.bio || '',
    createdAt: user.createdAt,
  };
}

async function register(repo, input) {
  const existingEmail = await repo.users.findByEmail(input.email);
  if (existingEmail) throw new AppError(409, 'That email is already registered');

  const existingName = await repo.users.findByUsername(input.username);
  if (existingName) throw new AppError(409, 'That username is taken');

  const passwordHash = await bcrypt.hash(input.password, ROUNDS);
  const user = await repo.users.create({
    name: input.name,
    username: input.username,
    email: input.email,
    passwordHash,
    headline: input.headline || 'Building in public',
    location: input.location || '',
    bio: '',
  });

  return { token: signToken(user.id), user: publicUser(user) };
}

async function login(repo, input) {
  const user = await repo.users.findByEmail(input.email);
  if (!user) throw new AppError(401, 'Email or password is wrong');

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new AppError(401, 'Email or password is wrong');

  return { token: signToken(user.id), user: publicUser(user) };
}

async function me(repo, userId) {
  const user = await repo.users.findById(userId);
  if (!user) throw new AppError(401, 'Sign in to continue');
  return publicUser(user);
}

module.exports = { register, login, me, publicUser };
