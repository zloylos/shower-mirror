const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const debug = require('debug')('shower-mirror');
const port = process.env.PORT || 3000;

server.listen(port, () => debug('Server listening at port %n', port));

var usersCount = 0;
io.on('connection', (socket) => {
    debug('new connection');

    socket.on('join', (key) => {
        debug(key, process.env.KEY);
        socket.isOwner = (key === process.env.KEY);
        debug('connected', socket.isOwner);
        socket.broadcast.emit('user joined', {
            count: ++usersCount
        });
    });

    socket.on('go', (toSlide) => {
        if (socket.isOwner) {
            debug('go', toSlide);
            socket.broadcast.emit('go', {
                index: toSlide
            });
        }
    });

    socket.on('disconect', () => {
        if (!usersCount) {return;}
        socket.broadcast.emit('user disconect', {
            count: --usersCount
        });
    });
});


