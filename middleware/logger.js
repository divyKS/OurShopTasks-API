const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const logEvents = async (message, logFileName) => {
	const dateText = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
	const loggingText = `${dateText}\t${uuid()}\t${message}\n`;
	try {
		if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
			await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
		}
		await fsPromises.appendFile(
			path.join(__dirname, '../logs', logFileName),
			loggingText
		);
	} catch (e) {
		console.log('Error in logEvents:', e);
	}
};

const logger = (req, res, next) => {
	logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'logFile.log');
	console.log(`${req.method} ${req.path}`);
	next();
};

module.exports = { logEvents, logger };
