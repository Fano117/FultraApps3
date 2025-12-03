module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@screens': './src/screens',
          '@components': './src/shared/components',
          '@services': './src/shared/services',
          '@store': './src/shared/store',
          '@models': './src/shared/models',
          '@hooks': './src/shared/hooks',
          '@utils': './src/shared/utils',
          '@navigation': './src/navigation',
          '@design-system': './src/design-system',
        },
      },
    ],
  ],
};
