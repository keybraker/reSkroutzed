const { merge } = require("webpack-merge");

const commonConfig = require("./webpack/webpack.common.config");

module.exports = (env) => {
  const browser = env.chrome ? "chrome" : "firefox";

  const config = require(`./webpack/webpack.${browser}.config`);

  return merge(commonConfig, config);
};
