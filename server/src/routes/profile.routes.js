const express = require('express');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

router.get('/:username', profileController.show);

module.exports = router;
