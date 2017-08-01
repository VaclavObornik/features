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
        this._featuresClinet = new FeatureApiClient(config.featureApi.featuresUrl);
        this._tariffsClinet = new FeatureApiClient(config.featureApi.tariffsUrl);
    }

    getNextTime () {
        const nextTime = new Date();
        nextTime.setSeconds(nextTime.getSeconds() + (this._timeout / 1000));
        return nextTime;
    }

    async run () {

        try {

            const features = await this._featuresClinet.fetchDefinitions();
            await featureStorage.updateFeatureDefinitions(features);

            const tariffs = await this._tariffsClinet.fetchDefinitions();
            await featureStorage.updateTariffsDefinitions(tariffs);

        } catch (error) {
            log.e(error.err, error);
        }
    }
}

module.exports = FeatureFetchTask;
