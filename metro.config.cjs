const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...(config.transformer || {}),
  babelTransformerPath: path.resolve(__dirname, 'metro.transformer.cjs'),
};

module.exports = config;
