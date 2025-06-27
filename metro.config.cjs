// This file must use CommonJS syntax for Metro/Expo compatibility
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional asset extensions
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Workaround for vector icons font loading
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 