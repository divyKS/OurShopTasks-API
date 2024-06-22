// can use express async handler too and then t will be required here once just like dotenv
require('dotenv').config() // need to write it only once for the application, writing this loads the environment variables from a .env file into process.env so that they can be accessed throughout my application.
const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose');
const connectToDB = require('./config/dbConnection');

const PORT = process.env.PORT || 3500;

const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const userRouter = require('./routes/userRoutes');
const noteRouter = require('./routes/noteRoutes');
const authRouter = require('./routes/authRoutes');
const verifyJWT = require('./middleware/verifyJWT');

connectToDB();
// logger has to be the first middleware, otherwise the requests which get served by some other middlewares won't get logged. Every request that comes will go through this middleware first and get logged to the logFile
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/', express.static(path.join(__dirname, 'public')));


// all routes starting with / will be routed to the root.js router
app.use('/', require('./routes/root'));

app.use('/auth', authRouter);
app.use('/users', verifyJWT, userRouter);
app.use('/notes', verifyJWT, noteRouter);

app.all('*', (req, res) => {
	res.status(400);
	if (req.accepts('html')) {
		res.sendFile(path.join(__dirname, 'views/404.html'));
	} else if (req.accepts('json')) {
		res.json({ message: '404 Not Found' });
	} else {
		res.type('txt').send('404 Not Found');
	}
});


app.use(errorHandler);


// 'open' event is emitted after 'connected' event will can run multiple times, but we want it to be done just the first time
mongoose.connection.once('open', () => {
	console.log('Connection to DB successful (from server.js)')
	app.listen(PORT, () => {
		console.log(`app listening on port ${PORT}`);
	});
});

mongoose.connection.on('error', (err) => {
	console.log("(server.js)", err);
	logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrorsLogFile.log')
});
