const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const RemarkHTML = import("remark-html");
const generate = require('generate-file-webpack-plugin');
let NETWORK = "";
function initCanisterEnv() {
    let localCanisters, prodCanisters;
    try {
        localCanisters = require(path.resolve(
            "../../.dfx",
            "local",
            "canister_ids.json"
        ));
    } catch (error) {
        console.log("No local canister_ids.json found. Continuing production");
    }
    try {
        prodCanisters = require(path.resolve("../../canister_ids.json"));
    } catch (error) {
        console.log("No production canister_ids.json found. Continuing with local");
    }

    const network =
        process.env.DFX_NETWORK ||
        (process.env.NODE_ENV === "production" ? "ic" : "local");
    const canisterConfig = network === "local" ? localCanisters : prodCanisters;
    const env = Object.entries(canisterConfig).reduce((prev, current) => {
        const [canisterName, canisterDetails] = current;
        console.log(canisterName, canisterDetails);
        prev[canisterName.toUpperCase() + "_CANISTER_ID"] =
            canisterDetails[network];
        return prev;
    }, {});
    NETWORK = network;
    return env;
}

const canisterEnvVariables = initCanisterEnv();

const isDevelopment = process.env.NODE_ENV !== "production";

const frontend_entry = path.join("src", "index.html");

module.exports = {
    target: "web",
    mode: isDevelopment ? "development" : "production",
    entry: {
        // The frontend.entrypoint points to the HTML file for this build, so we need
        // to replace the extension to `.js`.
        index: path.join(__dirname, frontend_entry).replace(/\.html$/, ".jsx"),
    },
    devtool: isDevelopment ? "source-map" : false,
    optimization: {
        minimize: !isDevelopment,
        minimizer: [new TerserPlugin()],
    },
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx"],
        fallback: {
            assert: require.resolve("assert/"),
            buffer: require.resolve("buffer/"),
            events: require.resolve("events/"),
            stream: require.resolve("stream-browserify/"),
            util: require.resolve("util/"),
        },
    },
    output: {
        filename: "index.js",
        path: path.join(__dirname, "../../dist"),
    },

    // Depending in the language or framework you are using for
    // front-end development, add module loaders to the default
    // webpack configuration. For example, if you are using React
    // modules and CSS as described in the "Adding a stylesheet"
    // tutorial, uncomment the following lines:
    module: {
        rules: [
            {test: /\.(ts|tsx|jsx)$/, loader: "ts-loader"},
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {
                test: /\.md$/,
                use: [
                    {
                        loader: "html-loader",
                    },
                    {
                        loader: "remark-loader",
                        options: {
                            remarkOptions: {
                                plugins: [RemarkHTML],
                            },
                        },
                    }
                ]
            }
        ]
    },
    plugins: [
        generate({
            file: path.join(__dirname, "assets", ".well-known", "ic-domains"),
            content: NETWORK === 'ic' ? 'icnonprofit.app' : 'dev.icnonprofit.app'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, frontend_entry),
            cache: false,
        }),
        new webpack.EnvironmentPlugin({
            DFX_NETWORK: NETWORK === "local" ? "local" : "ic",
            NODE_ENV: "development",
            ...canisterEnvVariables,
        }),
        new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: `src/.ic-assets.json*`,
                    to: ".ic-assets.json5",
                    noErrorOnMissing: true
                },
            ],
        }),
    ],
    // proxy /api to port 4943 during development.
    // if you edit dfx.json to define a project-specific local network, change the port to match.
    devServer: {
        historyApiFallback: true,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:4943",
                changeOrigin: true,
                pathRewrite: {
                    "^/api": "/api",
                },
            },
        },
        static: path.resolve(__dirname, "assets"),
        hot: true,
        watchFiles: [path.resolve(__dirname)],
        liveReload: true,
    },
};
