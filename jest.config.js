module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|zustand)"
  ],
  moduleNameMapper: {
    // Resolve the reanimated mock for components that import it
    "^react-native-reanimated$": "<rootDir>/src/__mocks__/react-native-reanimated.js",
    // Block firebase ESM from leaking into tests — all firebase is mocked in jest.setup.js
    "^firebase/(.*)$": "<rootDir>/src/__mocks__/firebase.js",
    "^@firebase/(.*)$": "<rootDir>/src/__mocks__/firebase.js"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts"
  ]
};
