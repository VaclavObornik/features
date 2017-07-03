'use strict';

const cronious = require('cronious');
const db = require('../db');
const log = require('../log').module('features');
const FeatureFetchTask = require('./featureFetchTask');
const featureStorage = require('./featureStorage');
const config = require('../../config');
const mongodb = require('mongodb');
const FeatureDefinitionRequest = require('./featureDefinitionRequest');


const features = {

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

    _getFeatureDefinitionsByMerchants (definitions, request) {

        const merchantIds = Object.keys(definitions).reduce((_merchantIds, definiton) => {
            _merchantIds.push(...definitions[definiton].filter((value) =>
                mongodb.ObjectId.isValid(value) && !_merchantIds.includes(value)
            ));
            return _merchantIds;
        }, []);

        const merchantRequests = [

            Object.assign(FeatureDefinitionRequest.clone(request), { byMerchant: false, merchantId: null }),

            ...merchantIds.map(merchantId => Object.assign(
                FeatureDefinitionRequest.clone(request),
                { byMerchant: false, merchantId }
            ))
        ];

        return merchantRequests.reduce((result, merchantRequest) => {
            result[merchantRequest.merchantId] = this._getFeatureDefinitionsForRequest(
                merchantRequest,
                definitions
            );
            return result;
        }, {});
    },

    /**
     * @param {FeatureDefinitionRequest} request
     * @returns {boolean}
     */
    async getFeatureDefinitionsForRequest (request) {

        const definitions = await featureStorage.getFeatureDefinitions();

        if (request.byMerchant) {
            return this._getFeatureDefinitionsByMerchants(definitions, request);
        }

        return this._getFeatureDefinitionsForRequest(request, definitions);
    },

    /**
     * @param {FeatureDefinitionRequest} request
     * @param {Object} definitions
     * @returns {boolean}
     */
    _getFeatureDefinitionsForRequest (request, definitions) {

        const translatedDefinitions = {};
        const reducingFunction = this._factoryReducingFunction(request);

        for (const prop in definitions) {

            if (!Object.prototype.hasOwnProperty.call(definitions, prop)) { continue; }

            if (!Array.isArray(definitions[prop])) {
                translatedDefinitions[prop] = false;
                continue;
            }

            translatedDefinitions[prop] = definitions[prop].reduce(reducingFunction, false);
        }

        return translatedDefinitions;
    },

    /**
     * @param {FeatureDefinitionRequest} request
     * @returns {function}
     * @private
     */
    _factoryReducingFunction (request) {

        /**
         * Test system version comparing function
         * @returns {boolean}
         */
        const testSystemVersion = request.system
            ? this._factoryTestSystemVersionFunction(request.system)
            : null;

        /**
         * Reducing function itself
         */
        return function (_value, _element) {

            if (testSystemVersion) {
                _value = _value || testSystemVersion(_element);
            }

            if (request.merchantId) {
                _value = _value || _element === request.merchantId;
            }

            if (request.environment) {
                _value = _value || _element === request.environment;
            }

            return _value;
        };
    },

    /**
     * @returns {function}
     * @private
     */
    _factoryTestSystemVersionFunction (system) {

        const systemMatcher = new RegExp(`^${system.system}`, 'gm');

        return function (_element) {

            if (!systemMatcher.test(_element)) {
                return false;
            }

            const stringToParse = _element.split(system.system)[1];

            if (stringToParse.length === 0) {
                // if no-version specified, return true
                return true;
            }

            const indexOfVersion = stringToParse.search(new RegExp('[0-9]', 'gm'));

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

module.exports = features;
