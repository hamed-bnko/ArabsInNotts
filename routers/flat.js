const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const config = require('config');
const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');

const Flats = require('../models/Flats');
// @route   api/flats
// @desc    get all flats
// @access  Public
router.get('/', async (req, res) => {
	try {
		const flats = await Flats.find({}).sort('-created');
		res.json(flats);
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
			check('address', 'Please Enter Address of the flat')
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

		console.log('here');
		const dirname = path.join(__dirname, '../');
		if (req.files === null) {
			return res.status(400).json({ msg: 'No File Uploaded' });
		}

		const file = req.files.file;

		console.log(file);
		const imagename = '/uploads/image-' + Date.now() + path.extname(file.name);

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
		const { title, address, description, entitle, endescription } = req.body;

		console.log(req.body);

		try {
			const newFlat = new Flats({
				image: imagename,
				title,
				address,
				description,
				entitle,
				endescription,
				user: { id: req.user.id, name: req.user.name }
			});

			const flat = await newFlat.save();

			res.json(flat);
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
	const {
		image,
		title,
		address,
		description,
		entitle,
		endescription
	} = req.body;

	const flatFields = {};

	if (image) flatFields.image = image;
	if (title) flatFields.title = title;
	if (address) flatFields.address = address;
	if (description) flatFields.description = description;
	if (entitle) flatFields.entitle = entitle;
	if (endescription) flatFields.endescription = endescription;
	console.log(flatFields);

	try {
		let flat = await Flats.findById(req.params.id);

		if (!flat) return res.status(400).json('flat not found');

		flat = await Flats.findByIdAndUpdate(req.params.id, flatFields);
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
		let flat = await Flats.findById(req.params.id);
		const paths = `${dirname}/client/public/${flat.image}`;
		if (fs.existsSync(paths)) {
			fs.unlink(`${dirname}/client/public/` + flat.image, err => {
				if (err) throw err;
			});
		}

		if (!flat) return res.status(400).json('flat not found');

		await Flats.findByIdAndRemove(flat._id);

		res.json({ msg: 'flat is deleted' });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

module.exports = router;
