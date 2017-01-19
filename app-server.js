var express = require('express');

var app = express();

app.use(express.static('./public'));
app.use(express.static('./node_modules/bootstrap/dist'));

var server = app.listen(3000);
var io = require('socket.io').listen(server);

// Add an event listener.
io.sockets.on('connection', function(socket) {
	console.log('Connected: ' + socket.id)
})

console.log("Polling server is running at localhost:3000");