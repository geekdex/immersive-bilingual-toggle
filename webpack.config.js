const path = require('path');

module.exports = {
  entry: './src/immersive-bilingual-simple.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'immersive-bilingual.min.js',
    library: 'ImmersiveBilingual',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  mode: 'production'
};