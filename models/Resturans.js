const mongoose = require('mongoose');

const ResturanSchema = new mongoose.Schema(
	{
		image: {
			type: String,
			trim: true
		},
		user: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user'
			},
			name: String
		},
		name: {
			type: String,
			trim: true
		},
		address: {
			type: String,
			trim: true
		},
		description: {
			type: String,
			trim: true
		},
		enname: {
			type: String,
			trim: true
		},
		endescription: {
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

module.exports = mongoose.model('r&s', ResturanSchema);
