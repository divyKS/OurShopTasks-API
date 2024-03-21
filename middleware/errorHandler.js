const { logEvents } = require('./logger');

const errorHandler = (err, req, res, next) => {
	logEvents(`${err.name}:${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errorLogFile.log');
	console.log(err.stack);
	const statusCode = res.statusCode ? res.statusCode : 500;
	res.status(statusCode);
	res.json({ message: err.message });
};

module.exports = errorHandler;
