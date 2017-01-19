var express = require('express');
var _ = require('underscore');
var app = express();

var connections = [];
var title = 'Untitled Presentation';
var audience = [];
// There is only one speaker.
var speaker = {};

app.use(express.static('./public'));
app.use(express.static('./node_modules/bootstrap/dist'));

var server = app.listen(3000);
var io = require('socket.io').listen(server);

// Add an event listener.
io.sockets.on('connection', function(socket) {

	// Handle socket disconnection.
	socket.once('disconnect', function(){
		// this refers to the socket that has just disconnected.
		var member = _.findWhere(audience, {id: this.id});

		if (member) {
			audience.splice(audience.indexOf(member), 1);
			// Send an update of participating audience to all
			// remaining audience.
			io.sockets.emit('audience', audience);
			console.log('Left: ' + member.name + ' (' + audience.length +
				' remaining audience members)');
		} else if (this.id === speaker.id) {
			console.log(speaker.name + ' has left. ' + title + ' is over.');
			speaker = {};
			title = 'Untitled Presentation';
			io.sockets.emit('end', {
				title: title,
				speaker: ''
			});
		}

		// Notice that this function is defined even before the push statement.
		connections.splice(connections.indexOf(socket), 1);
		socket.disconnect();
		console.log('Disconnected: ' + connections.length + ' sockets remaining.');
	});

	// Audience join.
	socket.on('join', function(payload){
		// this here refers to the parameter 'socket'.
		var newMember = {
			id: this.id,
			name: payload.name,
			type: 'member'
		}
		this.emit('joined', newMember);
		// Register new member.
		audience.push(newMember);
		// broadcast all connected sockets.
		io.sockets.emit('audience', audience);
		console.log('Audience Joined: ', payload.name);
	});

	// Speaker join.
	socket.on('start', function(payload) {
		speaker.name = payload.name;
		// this <-> socket.
		speaker.id = this.id;
		speaker.type = 'speaker';
		title = payload.title;
		// the type property differentiates audience and speaker.
		this.emit('joined', speaker);

		io.sockets.emit('start', {
			title: title,
			speaker: speaker.name
		});
		console.log('Presentation Started: ' + title + ' by ' + speaker.name);
	});

	// Emit event that can be handled by the client.
	socket.emit('welcome', {
		title: title,
		audience: audience,
		speaker: speaker.name
	});

	connections.push(socket);
	console.log('Connected: ' + connections.length + ' sockets connected.');
})

console.log("Polling server is running at localhost:3000");