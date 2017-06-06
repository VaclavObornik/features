'use strict';

/**
 *
 * @param {string} version
 * @returns {number}
 */
const parseVersion = function (version) {
    let value = version;
    // replace all non-number and non-dots and non-comma characters
    value = value.replace(/[^0-9\.,]/g, '');    // eslint-disable-line
    value = value.replace(/,/g, '.');           // all comma to dots

    let i = 0;
    value = value.replace(/\./g, () => (i++ === 0 ? '.' : ''));

    return parseFloat(value);
};

module.exports = parseVersion;
