const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerSchema, loginSchema } = require('../validators/auth.schema');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);

module.exports = router;
