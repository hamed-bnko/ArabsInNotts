const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Users = require('../../models/Users');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Privet
router.get('/', auth, async (req, res) => {
	try {
		const user = await Users.findById(req.user.id).select('-password');
		res.json(user);
	} catch (error) {
		console.log(error);
		res.status(500).send('server error');
	}
});

// @route   GET api/auth
// @desc    Get logged in user
// @access  Privet
router.post(
	'/',
	[
		check('email', 'Please enter your email').isEmail(),
		check('password', 'password is required').exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			let user = await Users.findOne({ email });

			if (!user) {
				return res.status(400).json({ msg: 'inValed Cretential' });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ msg: 'inValed Cretential' });
			}

			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{
					expiresIn: 360000
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (error) {
			console.log(error.message);
			res.status(500).json('server error');
		}
	}
);

module.exports = router;
