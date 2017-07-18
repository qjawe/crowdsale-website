const path = require('path');

const ENV = process.env.NODE_ENV || 'development';
const isProd = ENV === 'production';

module.exports = {
  cache: !isProd,
  devtool: isProd ? '#eval' : '#source-map',
  entry: {
    app: path.resolve(__dirname, 'src/main.jsx')
  },
  node: {
    fs: 'empty'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [
<<<<<<< HEAD
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
=======
      { test: /\.md$/, loader: 'babel-loader?{"presets":["es2015","react"]}!react-markdown-loader' },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader", query: { presets: ['es2015', 'react'] } }
>>>>>>> cbeb9d6cba8fcc9b701448d1013b2d1c56f2f8e6
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  }
};
