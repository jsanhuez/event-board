// using webpack's built-in ModuleFederationPlugin instead of enhanced
const { container: { ModuleFederationPlugin } } = require('webpack');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.tsx',
    devtool: isDevelopment ? 'inline-source-map' : 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
      publicPath: 'auto',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    devServer: {
      port: 3000,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_GATEWAY_URL': JSON.stringify(process.env.REACT_APP_API_GATEWAY_URL),
      }),
      // load .env files into webpack build
      // new (require('dotenv-webpack'))({
      //   path: path.resolve(__dirname, '.env'),
      //   safe: true, // load '.env.example' to verify the '.env' variables are all set
      //   systemvars: true, // also load system environment variables
      //   silent: true, // hide warnings
      // }),
      new ModuleFederationPlugin({
        name: 'ebWebApp',
        filename: 'remoteEntry.js',
        remotes: {
          '@ebWebAppEvents': 'ebWebAppEvents@http://localhost:3001/remoteEntry.js',
          '@ebWebAppUsers': 'ebWebAppUsers@http://localhost:3002/remoteEntry.js',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
            eager: true,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
            eager: true,
          },
          '@mui/material': {
            singleton: true,
            requiredVersion: false,
            eager: true,
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico',
      }),
    ],
  };
};
