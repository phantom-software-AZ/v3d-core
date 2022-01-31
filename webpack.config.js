const path = require( 'path' );
const Merge = require('webpack-merge');
const terser = require('terser-webpack-plugin');

const baseConfig = {
    mode: 'production',
    entry: {
        v3dcore: path.resolve(__dirname, 'src', 'index'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules')],
        extensions: ['.js', '.ts'],
        symlinks: false,
    },
    experiments: {
        topLevelAwait: true,
    },
    optimization: {
        minimize: true,
        minimizer: [new terser({
            extractComments: false,
        })]
    },
    target: ['web'],
};

const config = [
    // UMD
    Merge.merge(baseConfig, {
        output: {
            library: {
                name: 'v3d-core',
                type: 'umd',
            },
            filename: '[name].module.js',
            path: path.resolve(__dirname, 'dist'),
        },
        externals: [
            /^@babylonjs.*$/,
        ],
    }),
    // ES6
    Merge.merge(baseConfig, {
        output: {
            library: {
                // name: 'v3d-core',
                type: 'module',
            },
            filename: '[name].es6.js',
            path: path.resolve(__dirname, 'dist'),
            environment: { module: true },
        },
        experiments: {
            outputModule: true,
        },
        externalsType: 'module',
        externals: [
            /^@babylonjs.*$/,
        ],
    }),
    // browser global
    Merge.merge(baseConfig, {
        output: {
            library: {
                name: 'v3d-core',
                type: 'window',
            },
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
        },
        externals: [
            ({context, request}, callback) => {
                if (/^@babylonjs\/core.*$/.test(request)) {
                    return callback(null, 'var BABYLON');
                }
                // @see https://github.com/BabylonJS/Babylon.js/blob/master/Tools/Config/config.json#L415
                if (/^@babylonjs\/loaders\/glTF\/2\.0.*$/.test(request)) {
                    return callback(null, 'var LOADERS.GLTF2');
                }
                if (/^@babylonjs\/loaders.*$/.test(request)) {
                    return callback(null, 'var LOADERS');
                }
                callback();
            },
        ],
    }),
];

module.exports = config;
