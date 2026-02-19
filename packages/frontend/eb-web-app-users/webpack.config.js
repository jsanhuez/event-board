const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');
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
      port: 3002,
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
    new ModuleFederationPlugin({
      name: 'ebWebAppUsers',
      filename: 'remoteEntry.js',
      exposes: {
        './UsersApp': './src/UsersApp.tsx',
      },
      enableTypescriptFederation: false,
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
