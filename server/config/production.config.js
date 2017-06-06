'use strict';

module.exports = {

    port: process.env.PORT || 8080,
    debugEnabled: false,
    production: true,

    db: {
        url: process.env.MONGODB_URI || null,
        options: {}
    },

    logger: {
        transports: [
            {
                transport: 'MongoDB',
                db: process.env.MONGODB_URI || null,
                collection: 'logs',
                capped: true,
                cappedSize: 400000000
            }
        ]
    }
};
