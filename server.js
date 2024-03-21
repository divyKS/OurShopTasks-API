const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 3500;

const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');


// logger has to be the first middleware, otherwise the requests which get served by some other middlewares won't get logged
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/', express.static(path.join(__dirname, 'public')));


// all routes starting with / will be routed to the root.js router
app.use('/', require('./routes/root'));

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


app.listen(PORT, () => {
	console.log(`app listening on port ${PORT}`);
});

