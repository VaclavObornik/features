/**
 * Created by davidmenger on 27/05/15.
 */

'use strict';

const packageJson = require('../../package.json');
const defaultConfig = require('./default.config');

const configuration = {

    /* CONSTANTS */
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TESTING: 'testing',

    _initialized: false,

    /**
     * System environment
     */
    env: null,

    /**
     * Call me once after run
     */
    initialize () {
        if (!this._initialized) {
            this.env = process.env.NODE_ENV || this.DEVELOPMENT;

            this._merge(defaultConfig);

            try {
                const filename = this._getEnvSpecificConfigFile();
                const environmentSpecific = require(filename); // eslint-disable-line
                this._merge(environmentSpecific);
                this._setMongoLogs();
            } catch (e) {
                // log is required here only in case of exception (when config file is not loaded)
                const log = require('../models/log').module('config'); // eslint-disable-line
                log.e('Cant load configuration', e);
            }

            this._initialized = true;
        }
    },

    isProduction () {
        return this.production;
    },

    /**
     * Returns environment specific configuration file name
     *
     * @returns {string}
     * @private
     */
    _getEnvSpecificConfigFile () {
        return `./${this.env}.config.js`;
    },

    /**
     * Merge configuration files
     *
     * @param replaceWith
     * @param defaults
     * @private
     */
    _merge (replaceWith, defaults) {
        defaults = defaults || this;

        for (const k in replaceWith) {
            if (!Object.prototype.hasOwnProperty.call(replaceWith, k)) {
                continue;
            }
            if (typeof replaceWith[k] !== 'object' || replaceWith[k] === null
                || typeof defaults[k] !== 'object' || defaults[k] === null) {

                defaults[k] = replaceWith[k];
            } else {
                this._merge(replaceWith[k], defaults[k]);
            }
        }
    },

    _setMongoLogs () {
        if (this.logger && typeof this.logger.transports === 'object') {
            this.logger.transports.forEach((transport) => {
                if (transport.transport === 'MongoDB') {
                    transport.label = transport.label || {};
                    transport.label.app = transport.label.app || packageJson.name;
                    transport.label.v = transport.label.v || packageJson.version;
                    transport.label.env = transport.label.env || this.env;
                    transport.storeHost = transport.storeHost || true;
                }
            });
        }
    }
};

configuration.initialize();

module.exports = configuration;
