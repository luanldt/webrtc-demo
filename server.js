var http = require('http');
var fs = require('fs');

var server = http.createServer((function (req, res) {
	var staticSource;
	if (req.url == '/index.html') {
		staticSource = 'index.html';
	} else if (req.url == '/app.js') {
		staticSource = 'app.js';
	} else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end();
    return;
	}
	fs.readFile(staticSource, function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
	
}));

var socket = require('socket.io')(server);


server.listen(3000);


socket.on('connection', function(io) {
	io.on('message', (data) => {
		console.log('+ Has event `message` with data: ', data);
    socket.emit('message', data);
	});
});


console.log('=== STARTED SERVER ===');