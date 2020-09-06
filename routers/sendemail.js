const express = require('express');
const router = express.Router();
const config = require('config');
const nodemailer = require('nodemailer');

const { check, validationResult } = require('express-validator');

// @route   api/flats
// @desc    get all flats
// @access  Public
router.post(
	'/',
	[
		check('firstname', 'Please Enter Address of the flat')
			.not()
			.isEmpty()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log({ errors: errors.array() });
			return res.status(400).json({ errors: errors.array() });
		}

		const { firstname, lastname, email, phone, message } = req.body;

		console.log(firstname);

		try {
			let testAccount = await nodemailer.createTestAccount();

			// create reusable transporter object using the default SMTP transport
			let transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'arabsinnotts@gmail.com',
					pass: config.get('pswe')
				}
			});

			// send mail with defined transport object
			let info = await transporter.sendMail({
				from: 'arabsinnotts@gmail.com', // sender address
				to: 'ahmad88ze@yahoo.com', // list of receivers
				subject: 'استفسار من الموقع', // Subject line
				text: 'Hello world?', // plain text body
				html: `First Name : ${firstname} ,Last Name : ${lastname} <br> Email Sender : ${email} Phone Number : ${phone} <br > Message : ${message}` // html body
			});

			console.log('Message sent: %s', info.messageId);
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

			return res.status(200).json({ msg: 'Message Sent' });
		} catch (error) {
			console.log(error.message);
			res.status(500).send('server error');
		}
	}
);

module.exports = router;
