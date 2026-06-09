/**
 * src/__mocks__/react-native-reanimated.js
 *
 * Minimal mock for react-native-reanimated so it can run inside the Jest/Node
 * environment without native bindings.
 */
const Reanimated = require('react-native-reanimated/mock');

// The 'default' export is a function in newer versions — silence the
// "not a function" error by wrapping it when needed.
if (typeof Reanimated.default === 'undefined') {
  Reanimated.default = Reanimated;
}

module.exports = Reanimated;
