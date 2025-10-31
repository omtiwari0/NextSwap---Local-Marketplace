let upstreamTransformer;
try {
  upstreamTransformer = require('@react-native/metro-babel-transformer');
} catch (e) {
  upstreamTransformer = require('metro-react-native-babel-transformer');
}

module.exports = {
  transform({ src, filename, options }) {
    return upstreamTransformer.transform({ src, filename, options });
  },
};
