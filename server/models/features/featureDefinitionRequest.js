'use strict';

const AppError = require('../appError');
const requestValidator = require('../utils/requestValidator');


class FeatureDefinitionRequest {

    constructor () {

        /**
         * Array of supported systems
         */
        this.SUPPORTED_SYSTEMS = ['pos', 'pay'];

        /**
         * @type {string}
         */
        this.merchantId = null;

        /**
         * @type {{
         *      system: string,
         *      version: string
         * }}
         */
        this.system = null;
    }

    validate () {

        this.merchantId = requestValidator.objectId(this.merchantId, 'merchantId');
        this.system = requestValidator.object(this.system);

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

            if (this.SUPPORTED_SYSTEMS.indexOf(this.system.system) === -1) {
                throw new AppError.badRequest('Unsupported system'); // eslint-disable-line
            }
        }
    }
}

module.exports = FeatureDefinitionRequest;
