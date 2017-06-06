'use strict';

const Q = require('q');
const request = require('supertest-as-promised')(Q.Promise);
const http = require('http');
const app = require('../server');

const apiTestUtil = {

    _initialized: false,

    _app: null,

    _mocha: null,

    before (mocha) {
        this._initialize(mocha);
    },

    /**
     *
     * @returns {*|exports}
     */
    getApp () {
        if (this._app === null) {
            this._app = http.createServer(app.callback());
        }

        return this._app;
    },

    request () {
        if (!this._initialized) {
            throw new Error('Mocha should be initialized!');
        }
        return request.agent(this.getApp());
    },

    _initialize (mocha) {
        if (this._initialized) {
            return;
        }
        this._mocha = mocha;
        this._initialized = true;
    }
};

module.exports = apiTestUtil;
