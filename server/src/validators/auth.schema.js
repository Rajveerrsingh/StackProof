const { z } = require('zod');

const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, 'Use 3–20 letters, numbers, or underscores');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(60),
  username,
  email: z.string().trim().toLowerCase().email('Enter a real email'),
  password: z.string().min(8, 'Use at least 8 characters').max(72),
  headline: z.string().trim().max(80).optional().default(''),
  location: z.string().trim().max(60).optional().default(''),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a real email'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
