const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema(
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
		title: {
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
		entitle: {
			type: String,
			trim: true
		},
		endescription: {
			type: String,
			trim: true
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('flat', flatSchema);
