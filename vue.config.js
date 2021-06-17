process.env.VUE_APP_VERSION = process.env.npm_package_version;

module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },
  transpileDependencies: ["quasar"],
  publicPath: process.env.VUE_APP_PUBLIC_PATH || "/",
};
