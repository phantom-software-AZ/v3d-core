// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
import * as path from 'path';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';
import { fileURLToPath } from 'url';
import {resolve} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src', 'index'),
    module: {
        rules: [
            {
                test: /\.(vert|frag)$/,
                type: 'asset/source',
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules')],
        extensions: ['.js', '.ts', '.vert', '.frag'],
        alias: {
            "babylon-vrm-loader": path.resolve(__dirname, "src/importer/babylon-vrm-loader"),
            "babylon-mtoon-material": path.resolve(__dirname, "src/shader/babylon-mtoon-material")
        },
    },
    experiments: {
        topLevelAwait: true,
    },
    optimization: {
        minimize: false,
    },
    target: ['web'],
};

const config = [
    // UMD
    merge(baseConfig, {
        output: {
            library: {
                name: 'v3d-core',
                type: 'umd',
            },
            filename: '[name].module.js',
            path: path.resolve(__dirname, 'dist'),
        },
        // externals: [
        //     /^@babylonjs.*$/,
        // ],
        optimization: {
            minimize: false,
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]@babylonjs[\\/]/,
                        name: 'babylonjs',
                        chunks: 'all',
                    },
                },
            },
        },
    }),
    // ES6
    merge(baseConfig, {
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
    merge(baseConfig, {
        output: {
            library: {
                name: 'v3d-core',
                type: 'window',
            },
            filename: '[name].js',
            path: resolve(__dirname, 'dist'),
        },
        externals: [
            function (context, request, callback) {
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

export default config;
