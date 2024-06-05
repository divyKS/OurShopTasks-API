const express = require('express');
const router = express.Router();
const loginLimiter = require('../middleware/rateLimiter');
const { login, refresh, logout } = require('../controllers/authController');

router.post('/', loginLimiter, login);
router.get('/refresh', refresh);
// LOGOUT is a post, since we are changing the state of server, it does delete a resource of a cookie, 
router.post('/logout', logout);

module.exports = router;