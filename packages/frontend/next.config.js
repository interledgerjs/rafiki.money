const withCSS = require('@zeit/next-css')
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

module.exports = withCSS({
    publicRuntimeConfig: {
        REACT_APP_USERS_API_URL: process.env.REACT_APP_USERS_API_URL || 'http://localhost:3001/',
        OAUTH_URL: 'http://localhost:9000',
        FX_API_URL: 'https://min-api.cryptocompare.com'
    },
    webpack: (config, options) => {
      if (config.resolve.plugins) {
        config.resolve.plugins.push(new TsconfigPathsPlugin());
      } else {
        config.resolve.plugins = [new TsconfigPathsPlugin()];
      }
  
      return config;
    }
});
