const withCSS = require('@zeit/next-css');

module.exports = withCSS({
    publicRuntimeConfig: {
        REACT_APP_USERS_API_URL: process.env.REACT_APP_USERS_API_URL || 'http://localhost:3001/',
        OAUTH_URL: 'http://localhost:9000'
    }
});
