module.exports = {
  moduleFileExtensions: ["js", "ts", "jsx", "tsx"],
  moduleDirectories: ["node_modules", "src", "test"],
  moduleNameMapper: {
    "src/(.*)$": "<rootDir>/src/$1",
    "^react$": require.resolve("react"),
    "^react-dom$": require.resolve("react-dom"),
  },
  transform: {
    "\\.tsx?$": "ts-jest",
    "\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  collectCoverage: false,
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.test.tsx"],
};
