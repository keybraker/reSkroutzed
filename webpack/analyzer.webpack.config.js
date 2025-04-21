const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = (env) => {
    const isAnalyzing = !!env.analyze;

    const baseConfig = require("./webpack.config.js")(env);

    if (!isAnalyzing) {
        return baseConfig;
    }

    return merge(baseConfig, {
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: "server",
                analyzerPort: 8888,
                openAnalyzer: true,
            }),
        ],
    });
};