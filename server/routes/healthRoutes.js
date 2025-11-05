const express = require('express');
const healthController = require('./../controllers/healthController');

const router = express.Router();

// Public health check endpoint - no authentication required
router.get('/', healthController.getHealth);

module.exports = router;
