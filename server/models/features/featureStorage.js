'use strict';

const db = require('../db');


const featureStorage = {

    _collection: null,

    DOCUMENT_ID: 'features',

    async init () {

        this._collection = db.db.collection('features');

        await this._ensureDocumentExists();
    },

    async _ensureDocumentExists () {

        const document = await this._collection.findOne({ _id: this.DOCUMENT_ID });

        if (!document) {
            await this._collection.insertOne({ _id: this.DOCUMENT_ID });
        }
    },

    /**
     * @returns {Promise}
     */
    updateFeatureDefinitions (document) {
        return this._collection.updateOne({ _id: this.DOCUMENT_ID }, document, { upsert: true });
    },

    /**
     * @returns {Promise}
     */
    getFeatureDefinitions () {
        return this._collection.findOne({ _id: this.DOCUMENT_ID });
    }
};

module.exports = featureStorage;
