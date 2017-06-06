'use strict';

const cronious = require('cronious');
const db = require('../db');
const log = require('../log').module('features');
const FeatureFetchTask = require('./featureFetchTask');
const featureStorage = require('./featureStorage');
const config = require('../../config');
const requestValidator = require('../../models/utils/requestValidator');


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

    /**
     * @param {FeatureDefinitionRequest} request
     * @returns {boolean}
     */
    async getFeatureDefinitionsForSystemAndVersion (request) {

        const translatedDefinitions = {};
        const definitions = await featureStorage.getFeatureDefinitions();
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
        const testSystemVersion = this._factoryTestSystemVersionFunction();

        /**
         * Reducing function itself
         */
        return function (_value, _element) {

            const shouldTestSystemVersion = _value === false
                && request.system && new RegExp(`^(${request.system.system}).*$`, 'gm').test(_element);

            if (shouldTestSystemVersion) {
                _value = testSystemVersion(_value, _element, request.system);
            }

            const shouldTestMerchantId = _value === false && request.merchantId
                && new RegExp(requestValidator.OBJECT_ID_REGEX).test(_element);

            if (shouldTestMerchantId) {
                _value = _element === request.merchantId;
            }

            return _value;
        };
    },

    /**
     * @returns {function}
     * @private
     */
    _factoryTestSystemVersionFunction () {
        return function (_value, _element, system) {

            const stringToParse = _element.split(system.system)[1];

            if (stringToParse.length === 0) { return true; } // if no-version specified, return true

            const indexOfVersion = stringToParse.search(new RegExp('[0-9]', 'gm'));

            if (indexOfVersion === -1) { return false; }

            const markToMatch = stringToParse.substring(0, indexOfVersion);
            const versionToMatch = parseFloat(stringToParse.substring(indexOfVersion, stringToParse.length));

            if (versionToMatch === Number.NaN) { return false; }

            switch (markToMatch) {
                case '>=': return system.version >= versionToMatch;
                case '=': return system.version === versionToMatch;
                case '<=': return system.version <= versionToMatch;
                case '>': return system.version > versionToMatch;
                case '<': return system.version < versionToMatch;
                default: return false;
            }
        };
    }
};

module.exports = features;
