'use strict';

const AppError = require('../appError');
const parseVersion = require('./parseVersion');

const requestValidator = {

    OBJECT_ID_REGEX: /^[a-f0-9]{24}$/i,
    EMAIL_REGEX: /^[^@\s]+@[^@\s]+\.[a-z]{2,10}$/i,
    USERNAME_REGEX: /^[a-z0-9_]+$/i,

    /**
     *
     * @param {*} value
     * @param {string} fieldName
     * @returns {string}
     */
    objectId (value, fieldName) {
        if (typeof value === 'string') {
            if (!value.match(requestValidator.OBJECT_ID_REGEX)) {
                throw AppError.badRequest(`A \`${value}\` at \`${fieldName}\` is not a ObjectId`);
            }
        } else if (value) {
            throw AppError.badRequest(`Bad \`${fieldName}\``);
        } else {
            value = null;
        }

        return value;
    },

    /**
     *
     * @param {*} value
     * @param {*|null} [defaultValue]
     * @param {string} [fieldName]
     * @param {{
     *   maxLength?: number
     *   minLength?: number
     *   trim?: boolean
     *   regexp?: RegExp
     * }} [options]
     * @returns {string|null}
     */
    string (value, defaultValue, fieldName, options) {

        if (typeof value === 'number') {
            value = value.toString();
        }

        if (typeof value === 'string') {
            value = requestValidator._validateStringRestrictions(value, fieldName, options);

            if (value) { // empty strings will not pass
                return value;
            }
        }

        if (typeof defaultValue === 'undefined') {
            defaultValue = null;
        }

        return defaultValue;
    },

    /**
     * @param {*} value
     * @param {string} [fieldName]
     * @param {{
     *   maxLength?: number
     *   minLength?: number
     *   trim?: boolean
     *   regexp?: RegExp
     * }} [options]
     */
    _validateStringRestrictions (value, fieldName, options) {

        options = options || {};

        if (options.trim) {
            value = value.trim();
        }

        if (options.maxLength && value.length > options.maxLength) {
            throw AppError.badRequest(
                `Field \`${fieldName}\` can not be longer than ${options.maxLength} characters.`
            );
        }

        if (typeof options.minLength === 'number' && value.length < options.minLength) {
            throw AppError.badRequest(
                `Field \`${fieldName}\` can not be shorter than ${options.minLength} characters.`
            );
        }

        if (options.regexp && !value.match(options.regexp)) {
            throw AppError.badRequest(
                `Field \`${fieldName}\` should match to ${options.regexp.toString()} regular expression.`
            );
        }

        return value;
    },

    /**
     *
     * @param value
     * @param defaultValue
     * @returns {*}
     */
    version (value, defaultValue) {
        if (typeof value === 'number') {
            return value;
        } else if (typeof value === 'string' && value.length > 0) {
            return parseVersion(value);
        }

        if (typeof defaultValue === 'undefined') {
            defaultValue = 0;
        }

        return defaultValue;
    },

    /**
     *
     * @param {*} value
     * @param {*|null} [defaultValue]
     * @returns {string|null}
     */
    object (value, defaultValue) {


        if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
            return value;

        }

        if (typeof defaultValue === 'undefined') {
            defaultValue = null;
        }

        return defaultValue;
    },

    /**
     * Throws error, when the field is null
     *
     * @param {object} obj
     * @param {string} property
     * @param {string} [ofObject]
     */
    propFilled (obj, property, ofObject) {

        if (obj[property] === null) {

            if (ofObject) {
                ofObject = `of ${ofObject}`;
            }

            throw AppError.badRequest(`Field \`${property}\` ${(ofObject || '')} should be filled`);
        }
    },


    /**
     *
     * @param {*} value
     * @param {Array} array
     * @param {string} fieldName
     * @param {*|null} [defaultValue]
     * @returns {*|null}
     */
    _enum (value, array, fieldName, defaultValue) {
        let found = null;

        if (value === null || typeof value === 'undefined') {

            if (typeof defaultValue === 'undefined') {
                defaultValue = null;
            }

        } else {
            found = array.indexOf(value);
        }

        if (found === null) {
            return defaultValue;

        } else if (found >= 0) {
            return array[found];
        }

        throw AppError.badRequest(`Field '${fieldName}' is not matching any required value`);
    },

    /**
     *
     * @param {*} value
     * @param {Array} array
     * @param {boolean} strict
     * @param {string} fieldName
     * @param {*|null} [defaultValue]
     * @returns {*|null}
     */
    stringEnum (value, array, strict, fieldName, defaultValue) {

        if (!strict) {
            array = array.map((elem) => {
                if (elem !== null) {
                    elem = elem.toLowerCase();
                }
                return elem;
            });

            if (typeof value === 'string') {
                value = value.toLowerCase();
            }
        }

        return this._enum(value, array, fieldName, defaultValue);
    }
};

module.exports = requestValidator;
