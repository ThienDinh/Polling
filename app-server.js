var express = require('express');
var _ = require('underscore');
var app = express();

// List of connections.
var connections = [];
var title = 'Untitled Presentation';
// There are many audience.
var audience = [];
// There is only one speaker.
var speaker = {};

// Serve the compiled React with JSX and ES6, also bootstrap.
app.use(express.static('./public'));
app.use(express.static('./node_modules/bootstrap/dist'));

// Listen to port 3000.
var server = app.listen(3000);
// Attach a socket listener to the server.
var io = require('socket.io').listen(server);

// When a new socket connection established.
io.sockets.on('connection', function(socket) {

	// Set up handler for socket disconnection.
	socket.once('disconnect', function(){
		// this refers to the socket that has just disconnected.
		var member = _.findWhere(audience, {id: this.id});
		// Check if the member who has just disconnected is from the audience.
		if (member) {
			// The member is from the audience, remove it from the list 'audience'.
			audience.splice(audience.indexOf(member), 1);
			// Send an update of participating audience list to all
			// remaining audience.
			io.sockets.emit('audience', audience);
			console.log('Left: ' + member.name + ' (' + audience.length +
				' remaining audience members)');
		} else if (this.id === speaker.id) {
			// Else the member is a speaker.
			console.log(speaker.name + ' has left. ' + title + ' is over.');
			// Reset the speaker and the title variables on the server side.
			speaker = {};
			title = 'Untitled Presentation';
			// Emit the event 'end' to all the connecting socket to inform
			// them that the presentation has ended and they should update
			// their presentation title and speaker's name to default.
			io.sockets.emit('end', {
				title: title,
				speaker: ''
			});
		}

		// Notice that this function is defined even before the push statement.
		// Remove this socket from active sockets list.
		connections.splice(connections.indexOf(socket), 1);
		// Disconnect the server from this socket.
		socket.disconnect();
		console.log('Disconnected: ' + connections.length + ' sockets remaining.');
	});

	// Handle the event when a new member who will be an audience try to connect to the server.
	socket.on('join', function(payload){
		// this here refers to the parameter 'socket'.
		var newMember = {
			id: this.id,
			name: payload.name,
			type: 'member'
		}
		// Emit the event 'joined', indicating that the member has joined successfully, to this connecting socket.
		this.emit('joined', newMember);
		// Register new member.
		audience.push(newMember);
		// Broadcast to all connecting sockets that a new audience has joined with an updated list of audience.
		io.sockets.emit('audience', audience);
		console.log('Audience Joined: ', payload.name);
	});

	// Handle the event when the speaker has joined, which starts the presentation.
	socket.on('start', function(payload) {
		// Store the speaker's name.
		speaker.name = payload.name;
		// this <-> socket.
		speaker.id = this.id;
		// Specify the type as 'speaker' to differentiate with the 'audience' when passing back data to the client.
		speaker.type = 'speaker';
		// Set the title of the presentation.
		title = payload.title;
		// Emit the event 'joined' to the current socket.
		// Notice, the 'audience' and the 'speaker' use the same event; therefore, using
		// the property type to differentiate them when the client receives the data from this emit event.
		this.emit('joined', speaker);

		// Emit the event 'start', indicating that the presentation has started, to all the connecting sockets
		// with the title and the speaker of the presentation.
		io.sockets.emit('start', {
			title: title,
			speaker: speaker.name
		});
		console.log('Presentation Started: ' + title + ' by ' + speaker.name);
	});

	// Emit the event 'welcome' after the socket connection has been established between the server and the client.
	socket.emit('welcome', {
		title: title,
		audience: audience,
		speaker: speaker.name
	});
	// Add the new socket into the sockets list.
	connections.push(socket);
	console.log('Connected: ' + connections.length + ' sockets connected.');
})

console.log("Polling server is running at localhost:3000");