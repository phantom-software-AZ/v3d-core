import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const test_folder = 'test'

const config = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, 'src', 'index-test'),
    output: {
        library: {
            name: 'v3d-core',
            type: 'umd',
        },
        filename: '[name].test.js',
        path: path.resolve(__dirname, test_folder),
    },
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
        extensions: ['.js', '.ts', '.vert', '.frag'],
        alias: {
            "babylon-vrm-loader": path.resolve(__dirname, "src/importer/babylon-vrm-loader"),
            "babylon-mtoon-material": path.resolve(__dirname, "src/shader/babylon-mtoon-material")
        },
        symlinks: false,
    },
    experiments: {
        topLevelAwait: true,
    },
    target: ['web'],
    devServer: {
        allowedHosts: 'localhost',
        static: {
            directory: path.resolve(__dirname, test_folder),
        },
        compress: true,
        port: 8080,
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                babylonjs: {
                    test: /[\\/]node_modules[\\/]@babylonjs[\\/]/,
                    name: 'babylonjs',
                    chunks: 'all',
                    },
            },
        },
    },
};

export default config;
