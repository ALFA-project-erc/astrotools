import.meta.env.VITE_VERSION = import.meta.env.npm_package_version;

module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },
  transpileDependencies: ["quasar"],
  publicPath: import.meta.env.VITE_PUBLIC_PATH || "/",
};
