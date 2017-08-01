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
        featuresUrl: 'https://raw.githubusercontent.com/Storyous/features/master/features.json',
        tariffsUrl: 'https://raw.githubusercontent.com/Storyous/features/master/tariffs.json'
    }
};
