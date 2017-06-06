'use strict';

const MongoClient = require('mongodb').MongoClient;
const Q = require('q');


class Mongo {

    constructor () {
        this.db = null;
        this._url = null;
        this._options = null;
    }

    /**
     *
     * @param {string} url
     * @param {object} [options] Mongo configuration
     */
    async connect (url = '', options = {}) {

        if (this.db !== null) {
            return this.db;
        }

        options.promiseLibrary = Q.Promise;

        try {

            this.db = await MongoClient.connect(url, options);

            process.stdout.write('Connected into database. \n');

        } catch (error) {
            throw error;
        }

        return this.db;
    }
}

module.exports = Mongo;
