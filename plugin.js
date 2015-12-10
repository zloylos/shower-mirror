var io = require('socket.io-client');
var querystring = require('querystring');

shower.modules.define('shower-mirror', function (provide) {
    /**
     * @param {Shower} sh.
     */
    function Mirror(sh) {
        this._sh = sh;
        var containerData = sh.container.getElement().dataset;
        var server = containerData.server || 'http://localhost:3000';
        var key = querystring.parse(document.location.search.slice(1)).key;

        this._socket = io(server);
        this._socket.emit('join', key);

        this._setupListeners();
    }

    Mirror.prototype.destroy = function () {

    };

    Mirror.prototype._setupListeners = function () {
        var _this = this;

        this._sh.player.events.on('activate', function (event) {
            _this._socket.emit('go', event.get('index'));
        }, this);

        this._socket.on('go', this._onOwnerGo.bind(this));
    };

    Mirror.prototype._clearListeners = function () {

    };

    Mirror.prototype._onOwnerGo = function (data) {
        this._sh.player.go(data.index);
    };

    provide(Mirror);
});

shower.modules.require(['shower'], function (sh) {
    sh.plugins.add('shower-mirror');
});
