const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const { getCoordinates } = require('../utils');

const User = require('../models/user-model');
const Place = require('../models/place-model');

const HttpError = require('../models/http-error');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => {
	const param = req.params.pid;
	let place;

	try {
		place = await Place.findById(param);
		console.log(place);
	} catch (error) {
		return next(
			new HttpError('Somthing went wrong, could not find place', 404)
		);
	}

	if (!place) {
		return next(
			new HttpError('could not find a place for the provided id.', 404)
		);
	}

	res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;
	let userWithPlaces;

	try {
		userWithPlaces = await User.findById(userId).populate('places');
		// console.log(userWithPlaces);
	} catch (error) {
		return next(new HttpError('Somting went wrong, Culd not find Places', 404));
	}

	if (!userWithPlaces || userWithPlaces.places.length === 0) {
		return next(
			new HttpError('could not find a places for the provided id.', 404)
		);
	}
	res.json({
		places: userWithPlaces.places.map((place) =>
			place.toObject({ getters: true })
		),
	});
};

const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError('Invalid inputs passed, please check your data', 422)
		);
	}

	const { title, description, address, creator } = req.body;
	const createdPlace = new Place({
		title,
		description,
		address,
		location: getCoordinates(),
		image:
			'https://images.unsplash.com/photo-1561731172-9d906d7b13bf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=968&q=80',
		creator,
	});

	let user;

	try {
		user = await User.findById(creator);
		console.log(user);
	} catch (error) {
		return next(new HttpError('Creating place faild, please try again'), 500);
	}

	if (!user) {
		return next(new HttpError('Could not find user for provided	id'), 404);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdPlace.save({ session: sess });
		user.places.push(createdPlace);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (error) {
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
	const placeId = req.params.pid;
	const { title, description } = req.body;

	let place;

	try {
		place = await Place.findById(placeId);
	} catch (error) {
		// return next(new HttpError('Could not update place', 500));
		return next(error);
	}

	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (error) {
		return next(new HttpError('Could not save place', 500));
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;
	let place;
	try {
		place = await Place.findById(placeId).populate('creator');
	} catch (error) {
		return next(new HttpError('Could not find place', 500));
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.remove({ session: sess });
		place.creator.places.pull(place);
		await place.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (error) {
		return next(new HttpError('Could not delete place,', 500));
	}

	res.status(200).json({ massage: 'Place Deleted' });
};

module.exports = {
	getPlaceById,
	getPlacesByUserId,
	createPlace,
	updatePlace,
	deletePlace,
};
