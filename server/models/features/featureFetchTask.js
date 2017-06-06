'use strict';

const cronious = require('cronious');
const log = require('../log').module('FeatureFetchTask');
const FeatureApiClient = require('./featureApiClient');
const config = require('../../config');
const featureStorage = require('./featureStorage');


class FeatureFetchTask extends cronious.Task {

    constructor (timeout = (60 * 1000)) {

        super('FeatureFetchTask');

        this._timeout = timeout;
        this._client = new FeatureApiClient(config.featureApi);
    }

    getNextTime () {
        const nextTime = new Date();
        nextTime.setSeconds(nextTime.getSeconds() + (this._timeout / 1000));
        return nextTime;
    }

    async run () {

        try {

            const definitions = await this._client.fetchFeatureDefinitions();

            await featureStorage.updateFeatureDefinitions(definitions);

        } catch (error) {
            log.e(error.err, error);
        }
    }
}

module.exports = FeatureFetchTask;
