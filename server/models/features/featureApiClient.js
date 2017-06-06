'use strict';

const nodeFetch = require('node-fetch');


class FeatureApiClient {

    constructor (options = {}) {
        this._options = options;
        this._fetchedVersion = 0;
    }

    /**
     * @returns {Promise}
     */
    fetchFeatureDefinitions () {
        return nodeFetch(`${this._options.url}?a=${this._fetchedVersion++}`)
            .then(res => res.json());
    }
}

module.exports = FeatureApiClient;
