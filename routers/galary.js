const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('config');

const fs = require('fs');
const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');

const Galary = require('../models/galary');
// @route   api/flats
// @desc    get all flats
// @access  Public
router.get('/', async (req, res) => {
	try {
		const picture = await Galary.find({}).sort('-created');
		res.json(picture);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

// @route   api/flats
// @desc    add a flat to database
// @access  Private
router.post(
	'/',
	[
		auth,
		[
			check('type', 'Please Enter Type of the image')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log({ errors: errors.array() });
			return res.status(400).json({ errors: errors.array() });
		}

		const dirname = path.join(__dirname, '../');
		if (req.files === null) {
			return res.status(400).json({ msg: 'No File Uploaded' });
		}

		const file = req.files.file;

		console.log(file);
		const imagename = '/uploads/image-' + Date.now() + path.extname(file.name);

		// Deployed Image Direction
		const imagedirection = `${dirname}/client/${config.get(
			'dire'
		)}${imagename}`;

		file.mv(imagedirection, err => {
			if (err) {
				console.error('ERROR !!!' + err);
				return res.status(500).send(err);
			}
		});
		console.log(file);
		const { type } = req.body;

		try {
			const newPicture = new Galary({
				image: imagename,
				type
			});

			const picture = await newPicture.save();

			res.json(picture);
		} catch (error) {
			console.log(error.message);
			res.status(500).send('server error');
		}
	}
);

// @route    api/flats/:id
// @desc     update flat
// @access   private
router.put('/:id', auth, async (req, res) => {
	const { image, type } = req.body;

	const pictureFields = {};

	if (image) pictureFields.image = image;
	if (type) pictureFields.title = type;

	try {
		let picture = await Galary.findById(req.params.id);

		if (!picture) return res.status(400).json('flat not found');

		picture = await Galary.findByIdAndUpdate(req.params.id, pictureFields);
		res.json(flat);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

// @route   api/flats/:id
// @desc    delete flat
// @access  private
router.delete('/:id', auth, async (req, res) => {
	const dirname = path.join(__dirname, '../');
	try {
		let picture = await Galary.findById(req.params.id);
		const paths = `${dirname}/client/public/${picture.image}`;
		if (fs.existsSync(paths)) {
			fs.unlink(`${dirname}/client/public/` + picture.image, err => {
				if (err) throw err;
			});
		}

		if (!picture) return res.status(400).json('flat not found');

		await Galary.findByIdAndRemove(picture._id);

		res.json({ msg: 'Image is deleted' });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

module.exports = router;
