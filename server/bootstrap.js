'use strict';

const config = require('./config');
const db = require('./models/db');
const log = require('./models/log').module('bootstrap');
const features = require('./models/features');


const promise = (async function () {

    try {

        /** Database connection establishing **/
        await db.connect(config.db.url, config.db.options);

        await features.init();

    } catch (e) {

        log.e('Application crashed during start-up process.', e);

        setTimeout(() => process.exit(1), 10); // terminate app when models could not be initialized properly
    }
}());

module.exports = promise;
