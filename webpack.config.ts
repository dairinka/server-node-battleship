import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
  entry: './src/server.ts',
  mode: 'production',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            noEmit: false,
            allowImportingTsExtensions: false,
          },
        },
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'bundle'),
  },
};
export default config;
