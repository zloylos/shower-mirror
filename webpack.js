var webpack = require('webpack');

module.exports = {
    entry: './plugin.js',
    output: {
        path: './',
        filename: 'shower-mirror.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {warnings: false},
            output: {comments: false}
        })
    ]
};
