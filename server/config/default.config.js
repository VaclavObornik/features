'use strict';

module.exports = {

    port: 3003,
    debugEnabled: true,
    production: false,

    db: {
        url: null,
        options: {}
    },

    logger: {
        transports: []
    },

    featureApi: {
        url: 'https://raw.githubusercontent.com/Storyous/features/master/features.json'
    }
};
