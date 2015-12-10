const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const io = require('socket.io').listen(app.listen(port, () => debug('listening %n', port)));
const debug = require('debug')('shower-mirror');

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


