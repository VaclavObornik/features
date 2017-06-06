'use strict';

module.exports = {

    port: process.env.PORT || 8080,
    debugEnabled: false,
    production: true,

    db: {
        url: process.env.DATABASE_SERVICE_NAME || null,
        options: {
            user: process.env.MONGODB_USER || null,
            password: process.env.MONGODB_PASSWORD || null
        }
    },

    logger: {
        transports: [
            {
                transport: 'MongoDB',
                db: process.env.DATABASE_SERVICE_NAME || null,
                collection: 'logs',
                username: process.env.MONGODB_USER || null,
                password: process.env.MONGODB_PASSWORD || null,
                capped: true,
                cappedSize: 400000000
            }
        ]
    }
};
