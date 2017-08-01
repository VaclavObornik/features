'use strict';

const nodeFetch = require('node-fetch');


class FeatureApiClient {

    constructor (url) {
        this._url = url;
        this._fetchedVersion = 0;
    }

    /**
     * @returns {Promise}
     */
    fetchDefinitions () {
        return nodeFetch(`${this._url}?a=${this._fetchedVersion++}`)
            .then(res => res.json());
    }
}

module.exports = FeatureApiClient;
