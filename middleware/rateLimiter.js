const rateLimit = require('express-rate-limit');
const logEvents = require('../middleware/logger');

const loginLimiter = rateLimit({
    windowMs: 10 * 1000,
    limit: 3,
    message: { "message": "You are allowed to send only 3 requests per 10 seconds from an IP", "gotRateLimited" : "You are sending too many requests" },
    headers: (req, res, next, options) => {
        // options is the obj that is passed to this, windowMs, limit...
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errorLogFile.log");
        // res.gotRateLimited = "You are sending too many requests"
        res.statusCode(options.statusCode).send(options.message);
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false
});

module.exports = loginLimiter;