const express = require('express');

const app = express();
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const fileUpload = require('express-fileupload');

const connectDB = require('./config/db');

//connect to database
connectDB();

const {
	generateMessage,
	generateLocationMessage
} = require('./utils/message.js');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const server = http.createServer(app);

// init Midelware

app.use(fileUpload());

app.use(express.json({ extended: false }));

//Define Routes

app.use('/api/users', require('./routers/auth/users'));
app.use('/api/auth', require('./routers/auth/auth'));
app.use('/api/flats', require('./routers/flat'));
app.use('/api/translators', require('./routers/translator'));
app.use('/api/r&s', require('./routers/R&S'));
app.use('/api/univer', require('./routers/university'));
app.use('/api/galary', require('./routers/galary'));
app.use('/api/sendameessage', require('./routers/sendemail'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('client/build'));

	app.get('*', (req, res) =>
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
	);
}

app.get('*', (req, res) =>
	res.sendFile(
		path.resolve(__dirname, 'client', 'sniper.mais-aream.com', 'index.html')
	)
);
const PORT = process.env.PORT || 3030;

var io = socketIO(server);
var users = new Users();

io.on('connection', socket => {
	socket.on('leave', params => {
		socket.leave(params.room);
	});

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback('Bad request');
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);

		io.to(params.room).emit('updateUserList', users.getUserList(params.room));
		socket.emit(
			'newMessage',
			generateMessage('Admin', params.room, 'Welcome to the chat app.')
		);
		socket.broadcast
			.to(params.room)
			.emit(
				'newMessage',
				generateMessage('Admin', params.room, `${params.name} has joined.`)
			);

		callback();
	});

	socket.on('createMessage', (message, callback) => {
		var user = users.getUser(socket.id);
		if (user && isRealString(message.text)) {
			let tempObj = generateMessage(user.name, user.room, message.text);
			io.to(user.room).emit('newMessage', tempObj);
			callback({
				data: tempObj
			});
		}
		callback();
	});

	socket.on('createLocationMsg', coords => {
		var user = users.getUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				'createLocationMsg',
				generateLocationMessage(user.name, user.room, coords.lat, coords.lon)
			);
		}
	});

	socket.on('disconnect', () => {
		var user = users.removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit(
				'newMessage',
				generateMessage('Admin', user.room, `${user.name} has left.`)
			);
		}
	});
});

server.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});
