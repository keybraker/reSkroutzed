const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.ts",
    popup: "./popup/popup.js"
  },
  output: {
    filename: "[name].js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: true,
      typescript: {
        memoryLimit: 4096, // Set to 4GB
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
    // Add module aliases for frequently used paths
    alias: {
      "@clients": __dirname + "/../src/clients",
      "@common": __dirname + "/../src/common",
      "@features": __dirname + "/../src/features",
      "@handlers": __dirname + "/../src/handlers",
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // Enable transpileOnly for faster builds
              transpileOnly: true,
              experimentalWatchApi: true,
            }
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              // CSS Loader version 7 doesn't support 'minimize' option
              // It's handled by CssMinimizerPlugin instead
              sourceMap: true,
            }
          }
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            passes: 2,
          },
          mangle: true,
          output: {
            comments: false,
          },
        },
        extractComments: false,
        parallel: true,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
            },
          ],
        },
      }),
    ],
    // Enhanced optimization settings
    usedExports: true,
    sideEffects: true,
    providedExports: true,
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
  // Limit parallelism based on CPU cores
  parallelism: 4,
}
