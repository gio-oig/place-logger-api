const mongoose = require('mongoose');
const unicValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const userSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 6 },
	image: { type: String, required: true },
	places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
});
userSchema.plugin(unicValidator);

module.exports = mongoose.model('User', userSchema);