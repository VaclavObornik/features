'use strict';

module.exports = {

    port: 3388,
    debugEnabled: true,
    production: false,

    db: {
        url: 'mongodb://127.0.0.1:27017/featureFlaggingTesting',
        options: {}
    },

    logger: {
        transports: [
            {
                transport: 'MongoDB',
                db: 'mongodb://127.0.0.1:27017/featureFlaggingTesting',
                collection: 'logs',
                capped: true,
                cappedSize: 400000000
            }
        ]
    }
};
