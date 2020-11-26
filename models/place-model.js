const { text } = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const requiredString = {
	type: String,
	required: true,
};

const placeSchema = new Schema({
	title: requiredString,
	description: requiredString,
	address: requiredString,
	image: requiredString,
	location: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true },
	},
	creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Place', placeSchema);
