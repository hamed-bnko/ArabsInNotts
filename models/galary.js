const mongoose = require('mongoose');

const GalarySchema = new mongoose.Schema(
	{
		image: {
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

module.exports = mongoose.model('galary', GalarySchema);
