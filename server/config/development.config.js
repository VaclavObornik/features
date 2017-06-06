'use strict';

module.exports = {

    port: 3003,
    debugEnabled: true,
    production: false,

    db: {
        url: 'mongodb://127.0.0.1:27017/featureFlagging',
        options: {}
    },

    logger: {
        transports: [
            {
                transport: 'MongoDB',
                db: 'mongodb://127.0.0.1:27017/featureFlagging',
                collection: 'logs',
                capped: true,
                cappedSize: 400000000
            }
        ]
    }
};
