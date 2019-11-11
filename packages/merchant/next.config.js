const withCSS = require('@zeit/next-css');

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config',
  );
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize;
        }
      });
    }
  });
}

module.exports = withCSS({
  webpack(config) {
    HACK_removeMinimizeOptionFromCssLoaders(config);
    return config;
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    CALLBACK_URL: process.env.CALLBACK_URL || 'http://localhost:3000/callback',
    PAYMENT_HANDLER_CALLBACK_URL: process.env.PAYMENT_HANDLER_CALLBACK_URL || '',
    CLIENT_ID: process.env.CLIENT_ID || 'rafiki.shop',
    HYDRA_ADMIN_URL: process.env.HYDRA_ADMIN_URL || '',
    TOKEN_URL: process.env.TOKEN_URL || 'https://auth.rafiki.money/oauth2/token',
  }
});
