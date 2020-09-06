const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},

		role: {
			type: Number,
			default: 0
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('user', userSchema);
