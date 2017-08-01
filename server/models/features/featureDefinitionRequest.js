'use strict';

const AppError = require('../appError');
const requestValidator = require('../utils/requestValidator');

/**
 * Array of supported systems
 */
const SUPPORTED_SYSTEMS = ['pos', 'pay', 'is', 'www', 'pig'];

class FeatureDefinitionRequest {

    constructor () {

        /**
         * @type {string}
         */
        this.merchantId = null;

        /**
         * @type {string}
         */
        this.tariffId = null;

        /**
         * @type {boolean}
         */
        this.byMerchant = null;

        /**
         * @type {boolean}
         */
        this.allEnabled = null;

        /**
         * @type {{
         *      system: string,
         *      version: string
         * }}
         */
        this.system = null;

        /**
         * @type {null}
         */
        this.environment = null;
    }

    /**
     * @param {FeatureDefinitionRequest} request
     * @returns {FeatureDefinitionRequest}
     */
    static clone (request) {
        return Object.assign(new FeatureDefinitionRequest(), request);
    }

    validate () {

        this.byMerchant = requestValidator.boolean(this.byMerchant, false);
        this.allEnabled = requestValidator.boolean(this.allEnabled, false);
        this.merchantId = requestValidator.objectId(this.merchantId, 'merchantId');
        this.tariffId = requestValidator.objectId(this.tariffId, 'tariffId');
        this.system = requestValidator.object(this.system);
        this.environment = requestValidator.string(this.environment, 'production', 'environment');

        if (this.system) {

            const _system = JSON.parse(JSON.stringify(this.system));
            this.system = {
                system: requestValidator.string(_system.system),
                version: requestValidator.version(_system.version, null)
            };

            if (this.system.system !== null) {
                this.system.system = this.system.system.toLowerCase();
            }

            requestValidator.propFilled(this.system, 'system');

            if (SUPPORTED_SYSTEMS.indexOf(this.system.system) === -1) {
                throw new AppError.badRequest('Unsupported system'); // eslint-disable-line
            }
        }
    }
}

module.exports = FeatureDefinitionRequest;
