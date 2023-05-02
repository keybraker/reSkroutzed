const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipWebpackPlugin = require("zip-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/background.ts",
  output: {
    filename: "background.js",
    path: path.resolve(__dirname, "../build/firefox_build"),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/popup/popup.js", to: "popup.js" },
        { from: "src/popup/popup.html", to: "popup/popup.html" },
        { from: "src/popup/popup.css", to: "popup/popup.css" },
        { from: "src/manifest_firefox.json", to: "manifest.json" },
        { from: "src/assets/icons/*.png", to: "assets/icons/[name][ext]" },
        { from: "src/css/*.css", to: "css/[name][ext]" },
      ],
    }),
    new ZipWebpackPlugin({
      path: path.resolve(__dirname, "../build/"),
      filename: "firefox_build.zip",
      cleanStaleWebpackAssets: true,
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
