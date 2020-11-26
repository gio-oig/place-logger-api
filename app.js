const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const corse = require('cors');

const placesRoutes = require('./routes/places-route');
const usersRoutes = require('./routes/users-route');

const HttpError = require('./models/http-error');

const app = express();

app.use(corse());
app.use(morgan('common'));
app.use(express.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

//  cache routing errors
app.use((req, res, next) => {
	const error = new HttpError('Could not find this route');
	return next(error);
});

// catch all other error
app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({
		message: error.message || 'An unknown error occurred!',
		stack: error.stack,
	});
});

mongoose
	.connect(
		'mongodb+srv://giorgi:giooig_geo@travel-logger.fkkuo.mongodb.net/places?retryWrites=true&w=majority',
		{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
	)
	.then(() => {
		app.listen(5000);
	})
	.catch((error) => {
		console.log(error);
	});
