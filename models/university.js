const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema(
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
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('university', UniversitySchema);
