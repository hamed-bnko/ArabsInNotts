const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('config');
const fs = require('fs');
const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');

const Translaters = require('../models/Translaters');
// @route   api/flats
// @desc    get all flats
// @access  Public
router.get('/', async (req, res) => {
	try {
		const translaters = await Translaters.find({}).sort('-created');
		res.json(translaters);
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
			check('name', 'Please Enter Address of the flat')
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

		// Image Direction
		// const imagedirection =`${dirname}/client/public${imagename}`
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

		const {
			name,
			about,
			enname,
			enabout,
			email,
			phone,
			instagram,
			facebook,
			type
		} = req.body;

		console.log(req.body);

		try {
			const newTraslator = new Translaters({
				image: imagename,
				name,
				about,
				enname,
				enabout,
				email,
				phone,
				instagram,
				facebook,
				type
			});

			const translaters = await newTraslator.save();

			res.json(translaters);
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
		name,
		about,
		enname,
		enabout,
		email,
		phone,
		instagram,
		facebook,
		type
	} = req.body;

	const translatorFields = {};

	if (image) translatorFields.image = image;
	if (name) translatorFields.name = name;
	if (about) translatorFields.about = about;
	if (enname) translatorFields.enname = enname;
	if (enabout) translatorFields.enabout = enabout;
	if (phone) translatorFields.phone = phone;
	if (instagram) translatorFields.instagram = instagram;
	if (facebook) translatorFields.facebook = facebook;
	if (email) translatorFields.email = email;
	if (type) translatorFields.type = type;

	console.log(translatorFields);
	try {
		let transletor = await Translaters.findById(req.params.id);

		if (!transletor) return res.status(400).json('flat not found');

		transletor = await Translaters.findByIdAndUpdate(
			req.params.id,
			translatorFields
		);
		res.json(transletor);
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
		let translaters = await Translaters.findById(req.params.id);
		const paths = `${dirname}/client/public/${translaters.image}`;
		if (fs.existsSync(paths)) {
			fs.unlink(`${dirname}/client/public/` + translaters.image, err => {
				if (err) throw err;
			});
		}

		if (!translaters) return res.status(400).json('flat not found');

		await Translaters.findByIdAndRemove(translaters._id);

		res.json({ msg: 'flat is deleted' });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

module.exports = router;
