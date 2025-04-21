const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipWebpackPlugin = require("zip-webpack-plugin");

const buildDir = path.resolve(__dirname, "../build/firefox_build");
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

module.exports = (env = {}, argv = {}) => {
  const isWatchMode = argv.watch === true;

  const config = {
    output: {
      path: buildDir,
    },
    target: "web",
    optimization: {
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      removeAvailableModules: true,
      removeEmptyChunks: true,
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: "popup/popup.js", to: "popup.js" },
          { from: "popup/popup.html", to: "popup/popup.html" },
          { from: "popup/popup.css", to: "popup/popup.css" },
          { from: "manifests/manifest_firefox.json", to: "manifest.json" },
          { from: "icons/*.png", to: "icons/[name][ext]" },
          { from: "src/css/*.css", to: "css/[name][ext]" },
        ],
      }),
    ],
  };

  if (!isWatchMode) {
    config.plugins.push(
      new ZipWebpackPlugin({
        path: path.resolve(__dirname, "../build/"),
        filename: "firefox_build.zip",
        cleanStaleWebpackAssets: true,
      })
    );
  }

  return config;
}
