
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}'
  ],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        warnOnly: true
      }
    }],
    '^.+\.(js|jsx)$': 'babel-jest',
    '\.(glsl|frag|vert)$': 'jest-transform-stub'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|react-dom|recharts|three|@react-three|postprocessing)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@shaders/(.*)$': '<rootDir>/src/shaders/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\.(glsl|frag|vert)$': '<rootDir>/tests/__mocks__/shaderMock.js'
  },
  moduleDirectories: ['node_modules', 'src', 'tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'glsl', 'frag', 'vert'],
}
