const User = require('../models/user-model');

const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
	let users;

	try {
		users = await User.find({}, '-password');
	} catch (error) {
		return next(
			new HttpError('Fetching users failed, please try again later.', 404)
		);
	}

	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError('Invalid inputs passed, please check your data', 422)
		);
	}
	const { name, email, password } = req.body;
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (error) {
		return next(new HttpError('Signing up faild, please try again later'), 500);
	}

	if (existingUser) {
		return next(new HttpError('User already exists, please login later'), 500);
	}

	const createdUser = new User({
		name,
		email,
		image:
			'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1057&q=80',
		password,
		places: [],
	});

	try {
		await createdUser.save();
	} catch (error) {
		return next(new HttpError('signing up faild, please try again'), 500);
	}

	res.status(200).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;
	let identifedUser;

	try {
		identifedUser = await User.findOne({ email: email });
	} catch (error) {
		return next(new HttpError('Logging in faild, please try later.', 500));
	}

	if (!identifedUser || identifedUser.password !== password) {
		return next(
			new HttpError('Could not identify user, creditials seem to be wrong', 401)
		);
	}

	res.json({
		message: 'logged in',
		user: identifedUser.toObject({ getters: true }),
	});
};

module.exports = {
	getUsers,
	signup,
	login,
};
