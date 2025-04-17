const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipWebpackPlugin = require("zip-webpack-plugin");

const buildDir = path.resolve(__dirname, "../build/chrome_build");
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

module.exports = {
  output: {
    path: buildDir,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/popup/popup.js", to: "popup.js" },
        { from: "src/popup/popup.html", to: "popup/popup.html" },
        { from: "src/popup/popup.css", to: "popup/popup.css" },
        { from: "src/manifest_chrome.json", to: "manifest.json" },
        { from: "src/assets/icons/*.png", to: "assets/icons/[name][ext]" },
        { from: "src/css/*.css", to: "css/[name][ext]" },
      ],
    }),
    new ZipWebpackPlugin({
      path: path.resolve(__dirname, "../build/"),
      filename: "chrome_build.zip",
      cleanStaleWebpackAssets: true,
    }),
  ],
};
