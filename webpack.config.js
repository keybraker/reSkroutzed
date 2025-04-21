const { merge } = require("webpack-merge");

const commonConfig = require("./webpack/webpack.common.config");

const supportedBrowsersNames = ["chrome", "firefox"];
const getBrowserName = (env) => {
  const browserName = supportedBrowsersNames.find(
    (supportedBrowserName) => env[supportedBrowserName] === true
  );

  return browserName;
};

module.exports = (env, argv) => {
  const browserName = getBrowserName(env);
  if (!browserName) {
    const supportedBrowsersList = supportedBrowsersNames.join(", ");

    throw new Error(
      `Parameter env should be one of the following values: ${supportedBrowsersList}`
    );
  }

  const browserConfig = require(`./webpack/webpack.${browserName}.config`)(env, argv);

  // Add analyzer if requested
  if (env.analyze) {
    return require("./webpack/analyzer.webpack.config")(env, argv);
  }

  return merge(commonConfig, browserConfig);
};
