'use strict';

const cronious = require('cronious');
const db = require('../db');
const log = require('../log').module('features');
const FeatureFetchTask = require('./featureFetchTask');
const featureStorage = require('./featureStorage');
const config = require('../../config');


const featuresService = {

    _taskRunner: null,

    async init () {

        await featureStorage.init();

        /** Establish cron task (only when env is not testing) **/
        if (config.env !== config.TESTING) {
            await this._initTaskRunner();
            await this._createCronTask();

            this._taskRunner.startTriggeringTasks();
        }
    },

    async _initTaskRunner () {

        const logError = function (message, error, data) { log.e(message, { error, data }); };
        const logInfo = function (message, data) { log.i(message, data); };

        this._taskRunner = new cronious.Runner({
            logError,
            logInfo,
            collection: db.db.collection('cronTasks'),
            checkInterval: 5 * 1000,
            newTasksDelay: 2 * 60 * 1000
        });

        await this._taskRunner.init();
    },

    async _createCronTask () {

        const task = new FeatureFetchTask(60 * 1000);

        await this._taskRunner.registerTask(task, 1);
    },

    /**
     * @param {FeatureDefinitionRequest} request
     * @returns {boolean}
     */
    async getFeatureDefinitionsForRequest (request) {

        const features = await this._getFeatureDefinitions();

        return this._getFeatureDefinitionsForRequest(request, features);
    },

    async _getFeatureDefinitions () {
        const { features, tariffs } = await featureStorage.getFeatureDefinitions();

        for (const prop in features) {
            if (!Object.prototype.hasOwnProperty.call(features, prop)) {
                continue;
            }

            features[prop] = features[prop].map((def) => {

                const tariffTags = def.match(/^tariff(:|=)(.+)/);

                if (tariffTags) {
                    const tariffIds = tariffTags[2].split(',')
                        .map(tariff => tariffs[tariff] || [])
                        .reduce((prev, array) => {
                            prev.push(...array);
                            return prev;
                        }, []);

                    return `tariffId:${tariffIds.join(',')}`;
                }

                return def;
            });
        }

        return features;
    },

    /**
     * @param {FeatureDefinitionRequest} request
     * @param {Object} features
     * @returns {boolean}
     */
    _getFeatureDefinitionsForRequest (request, features) {

        const translatedDefinitions = {};
        const someFunction = this._factorySomeFunction(request);

        for (const prop in features) {

            if (!Object.prototype.hasOwnProperty.call(features, prop)) {
                continue;
            }

            if (!Array.isArray(features[prop])) {
                translatedDefinitions[prop] = false;
                continue;
            }

            translatedDefinitions[prop] = features[prop].some(someFunction);
        }

        return translatedDefinitions;
    },

    /**
     * @param {FeatureDefinitionRequest} request
     * @returns {function}
     * @private
     */
    _factorySomeFunction (request) {

        /**
         * Test system version comparing function
         * @returns {boolean}
         */
        const testSystemVersion = request.system
            ? this._factoryTestSystemVersionFunction(request.system)
            : null;

        const testTariffId = request.tariffId
            ? this._factoryTestTariffIdFunction(request.tariffId)
            : null;

        const testMerchantId = request.merchantId
            ? this._factoryTestMerchantIdFunction(request.merchantId)
            : null;

        const testEnvironment = request.environment
            ? this._factoryTestEnvironmentFunction(request.environment)
            : null;

        /**
         * Reducing function itself
         */
        return function (value) {

            if (request.allEnabled) {
                return true;
            }

            if (testSystemVersion && testSystemVersion(value)) {
                return true;
            }

            if (testMerchantId && testMerchantId(value)) {
                return true;
            }

            if (testTariffId && testTariffId(value)) {
                return true;
            }

            if (testEnvironment && testEnvironment(value)) {
                return true;
            }

            return false;
        };
    },

    /**
     * @param {string} tariffId
     * @returns {function}
     */
    _factoryTestTariffIdFunction (tariffId) {
        const tariffMatcher = new RegExp(`^tariffId(:|=).*(${tariffId})`, 'i');
        return _element => tariffMatcher.test(_element);
    },

    /**
     * @param {string} merchantId
     * @returns {function}
     */
    _factoryTestMerchantIdFunction (merchantId) {
        const merchantMatcher = new RegExp(`^(merchantId|merchant)(:|=).*(${merchantId})`, 'i');
        return _element => _element === merchantId || merchantMatcher.test(_element);
    },

    /**
     * @param {string} environment
     * @returns {function}
     */
    _factoryTestEnvironmentFunction (environment) {
        const environmentMatcher = new RegExp(`^(environment|env)(:|=).*(${environment})`, 'i');
        return _element => _element === environment || environmentMatcher.test(_element);
    },

    /**
     * @param {string} system
     * @returns {function}
     */
    _factoryTestSystemVersionFunction (system) {

        const systemMatcher = new RegExp(`^${system.system}`, 'i');

        return function (_element) {

            if (!systemMatcher.test(_element)) {
                return false;
            }

            const stringToParse = _element.split(system.system)[1];

            if (stringToParse.length === 0) {
                // if no-version specified, return true
                return true;
            }

            const indexOfVersion = stringToParse.search(/[0-9]/g);

            if (indexOfVersion === -1) {
                return false;
            }

            const markToMatch = stringToParse.substring(0, indexOfVersion);
            const versionToMatch = parseFloat(stringToParse.substring(indexOfVersion, stringToParse.length));

            if (versionToMatch === Number.NaN) {
                return false;
            }

            switch (markToMatch) {
                case '>=':
                    return system.version >= versionToMatch;
                case '=':
                    return system.version === versionToMatch;
                case '<=':
                    return system.version <= versionToMatch;
                case '>':
                    return system.version > versionToMatch;
                case '<':
                    return system.version < versionToMatch;
                default:
                    return false;
            }
        };
    }
};

module.exports = featuresService;
