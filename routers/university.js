const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const config = require('config');

const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');

const University = require('../models/university');
// @route   api/flats
// @desc    get all flats
// @access  Public
router.get('/', async (req, res) => {
	try {
		const university = await University.find({}).sort('-created');
		res.json(university);
	} catch (err) {
		console.log(err.message);
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
			check('name', 'Please Enter Name of the University')
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
		const { name, about, enname, enabout } = req.body;

		console.log(req.body);

		try {
			const newUniversity = new University({
				image: imagename,
				name,
				about,
				enname,
				enabout
			});

			const university = await newUniversity.save();

			res.json(university);
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
	const { image, name, about, enname, enabout } = req.body;

	const universityFields = {};

	if (image) universityFields.image = image;
	if (name) universityFields.name = name;
	if (about) universityFields.about = about;
	if (enname) universityFields.enname = enname;
	if (enabout) universityFields.enabout = enabout;

	try {
		let university = await University.findById(req.params.id);

		if (!university) return res.status(400).json('flat not found');

		university = await University.findByIdAndUpdate(
			req.params.id,
			universityFields
		);
		res.json(university);
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
		let university = await University.findById(req.params.id);
		const paths = `${dirname}/client/public/${university.image}`;

		if (!university) return res.status(400).json('University not found');

		if (fs.existsSync(paths)) {
			fs.unlink(`${dirname}/client/public/` + university.image, err => {
				if (err) throw err;
			});
		}

		await University.findByIdAndRemove(university._id);

		res.json({ msg: 'university is deleted' });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

module.exports = router;
