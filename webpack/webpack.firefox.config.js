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
    // Firefox-specific optimizations
    target: "web",
    optimization: {
      moduleIds: 'deterministic',
      // Firefox-specific settings
      chunkIds: 'deterministic',
      // Firefox usually has better memory management, so we can be more aggressive with optimizations
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

  // Only create the zip file if not in watch mode
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
