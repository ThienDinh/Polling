var express = require('express');

var app = express();

var connections = [];
var title = 'Untitled Presentation';

app.use(express.static('./public'));
app.use(express.static('./node_modules/bootstrap/dist'));

var server = app.listen(3000);
var io = require('socket.io').listen(server);

// Add an event listener.
io.sockets.on('connection', function(socket) {

	socket.once('disconnect', function(){
		// Notice that this function is defined even before the push statement.
		connections.splice(connections.indexOf(socket), 1);
		socket.disconnect();
		console.log('Disconnected: ' + connections.length + ' sockets remaining.');
	});

	// Emit event that can be handled by the client.
	socket.emit('welcome', {
		title: title
	});

	connections.push(socket);
	console.log('Connected: ' + connections.length + ' sockets connected.');
})

console.log("Polling server is running at localhost:3000");