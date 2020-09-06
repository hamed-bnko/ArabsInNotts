const express = require('express');
const router = express.Router();
const config = require('config');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');

const Resturants = require('../models/Resturans');
// @route   api/flats
// @desc    get all flats
// @access  Public
router.get('/', async (req, res) => {
	try {
		const resturant = await Resturants.find({}).sort('-created');
		res.json(resturant);
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
				.isEmpty(),
			check('name', 'name of resturant or Sport Club')
				.not()
				.isEmpty(),
			check(
				'description',
				'Please Enter Description of resturant or Sport Club'
			)
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
			address,
			description,
			enname,
			endescription,
			type
		} = req.body;

		console.log(req.body);

		try {
			const newResturant = new Resturants({
				image: imagename,
				name,
				address,
				description,
				enname,
				endescription,
				type,
				user: { id: req.user.id, name: req.user.name }
			});

			const resturan = await newResturant.save();

			res.json(resturan);
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
		address,
		description,
		enname,
		endescription,
		type
	} = req.body;

	const resturanFields = {};

	if (image) resturanFields.image = image;
	if (name) resturanFields.name = name;
	if (address) resturanFields.address = address;
	if (description) resturanFields.description = description;
	if (enname) resturanFields.enname = enname;
	if (endescription) resturanFields.endescription = endescription;
	if (type) resturanFields.type = type;

	try {
		let resturant = await Resturants.findById(req.params.id);

		if (!resturant) return res.status(400).json('Resturant not found');

		resturant = await Resturants.findByIdAndUpdate(
			req.params.id,
			resturanFields
		);
		res.json(resturant);
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
		let resturant = await Resturants.findById(req.params.id);
		const paths = `${dirname}/client/public/${resturant.image}`;
		if (fs.existsSync(paths)) {
			fs.unlink(`${dirname}/client/public/` + resturant.image, err => {
				if (err) throw err;
			});
		}

		if (!resturant) return res.status(400).json('flat not found');

		await Resturants.findByIdAndRemove(resturant._id);

		res.json({ msg: 'Resturant is deleted' });
	} catch (error) {
		console.log(error.message);
		res.status(500).send('server error');
	}
});

module.exports = router;
