const path = require('path');

module.exports = {
  entry: './src/immersive-bilingual.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'immersive-bilingual.min.js',
    library: 'ImmersiveBilingual',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};