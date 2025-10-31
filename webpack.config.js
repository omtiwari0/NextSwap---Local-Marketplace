// Custom Expo Webpack config to ensure problematic dependencies are transpiled
import path from 'path'
import createExpoWebpackConfigAsync from '@expo/webpack-config'

export default async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)

  // Ensure import.meta is transformed in specific node_modules if present
  const workletsPath = path.resolve(__dirname, 'node_modules/react-native-worklets')

  config.module.rules.push({
    test: /\.m?js$/,
    include: [workletsPath],
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
        plugins: ['transform-import-meta'],
      },
    },
  })

  return config
}
