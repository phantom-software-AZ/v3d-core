import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const {dirname, resolve} = require('path');
const {merge} = require('webpack-merge');
const {fileURLToPath} = require('url');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: resolve(__dirname, 'src', 'test', 'index'),
    output: {
        library: {
            name: 'v3d-core',
            type: 'umd',
        },
        filename: '[name].js',
        path: resolve(__dirname, 'test'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        modules: [resolve(__dirname, 'node_modules')],
        extensions: ['.js', '.ts'],
    },
    devServer: {
        contentBase: resolve(__dirname, 'test'),
        port: 8080,
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    target: ['web'],
};
