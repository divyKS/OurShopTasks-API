const rateLimit = require('express-rate-limit');
const logEvents = require('../middleware/logger');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    message: { "message": "You are allowed to send only 3 requests per minute from an IP" },
    headers: (req, res, next, options) => {
        // options is the obj that is passed to this, windowMs, limit...
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLogFile.log");
        res.statusCode(options.statusCode).send(options.message);
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

module.exports = loginLimiter;