var querystring = require('querystring');
var NEXT_PLUGIN_NAME = 'shower-next';

shower.modules.define('shower-mirror', ['shower'], function (provide, globalShower) {
    /**
     * @param {Shower} sh.
     */
    function Mirror(sh) {
        this._sh = sh;
        var containerData = sh.container.getElement().dataset;
        var key = querystring.parse(document.location.search.slice(1)).key;
        var server = containerData.server;

        this._socket = io(server);
        this._socket.emit('join', key);

        this._setupListeners();
    }

    Mirror.prototype = {
        destroy: function () {
            this._clearListeners();
        },

        _setupListeners: function () {
            this._sh.player.events.on('activate', this._onSlideActivate, this);

            this._socket
                .on('go', this._onOwnerGo.bind(this))
                .on('next', this._onOwnerNext.bind(this))
                .on('prev', this._onOwnerPrev.bind(this));

            var nextPlugin = globalShower.plugins.get(NEXT_PLUGIN_NAME, this._sh);
            if (nextPlugin) {
                this._setupNextPlugin(nextPlugin);
            } else {
                this._pluginsListeners = globalShower.plugins.events.group()
                    .on('add', function (e) {
                        if (e.get('name') === NEXT_PLUGIN_NAME) {
                            this._setupNextPlugin();
                            this._pluginsListeners.offAll();
                        }
                    }, this);
            }
        },

        _clearListeners: function () {
            this._sh.player.events.off('activate', this._onSlideActivate, this);
            if (this._nextPluginListeners) {
                this._nextPluginListeners.offAll();
            }
        },

        _setupNextPlugin: function (plugin) {
            if (!plugin) {
                plugin = globalShower.plugins.get(NEXT_PLUGIN_NAME, this._sh);
            }
            this._nextPlugin = plugin;
            this._nextPluginListeners = plugin.events.group()
                .on('next', this._onNext, this)
                .on('prev', this._onPrev, this);
        },

        _onSlideActivate: function (event) {
            this._socket.emit('go', event.get('index'));
        },

        _onNext: function () {
            this._socket.emit('next');
        },

        _onPrev: function () {
            this._socket.emit('prev');
        },

        _onOwnerGo: function (data) {
            this._sh.player.go(data.index);
        },

        _onOwnerPrev: function () {
            if (this._nextPlugin) {
                this._nextPlugin.prev();
            }
        },

        _onOwnerNext: function () {
            if (this._nextPlugin) {
                this._nextPlugin.next();
            }
        }
    };

    provide(Mirror);
});

shower.modules.require(['shower'], function (sh) {
    sh.plugins.add('shower-mirror');
});
