const mongoose = require('mongoose');

const TranslatorSchema = new mongoose.Schema(
	{
		image: {
			type: String,
			trim: true
		},
		name: {
			type: String,
			trim: true
		},
		about: {
			type: String,
			trim: true
		},
		enname: {
			type: String,
			trim: true
		},
		enabout: {
			type: String,
			trim: true
		},

		email: {
			type: String,
			trim: true
		},
		facebook: {
			type: String,
			trim: true
		},
		instagram: {
			type: String,
			trim: true
		},
		phone: {
			type: String,
			trim: true
		},
		about: {
			type: String,
			trim: true
		},
		type: {
			type: String,
			trim: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('translator', TranslatorSchema);
