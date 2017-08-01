'use strict';

const db = require('../db');


const featureStorage = {

    _collection: null,

    FEATURES_DOCUMENT_ID: 'features',

    TARIFFS_DOCUMENT_ID: 'tariffs',

    async init () {

        this._collection = db.db.collection('features');

        await this._ensureDocumentsExists();
    },

    async _ensureDocumentsExists () {

        const featuresDocument = await this._collection.findOne({ _id: this.FEATURES_DOCUMENT_ID });
        if (!featuresDocument) {
            await this._collection.insertOne({ _id: this.FEATURES_DOCUMENT_ID });
        }

        const tariffsDocument = await this._collection.findOne({ _id: this.TARIFFS_DOCUMENT_ID });
        if (!tariffsDocument) {
            await this._collection.insertOne({ _id: this.TARIFFS_DOCUMENT_ID });
        }
    },

    /**
     * @returns {Promise}
     */
    updateFeatureDefinitions (document) {
        return this._collection.updateOne({ _id: this.FEATURES_DOCUMENT_ID }, document, { upsert: true });
    },

    /**
     * @returns {Promise}
     */
    updateTariffsDefinitions (document) {
        return this._collection.updateOne({ _id: this.TARIFFS_DOCUMENT_ID }, document, { upsert: true });
    },

    /**
     * @returns {Promise}
     */
    getFeatureDefinitions () {
        return this._collection.find({ _id: { $in: [this.FEATURES_DOCUMENT_ID, this.TARIFFS_DOCUMENT_ID] } })
            .toArray()
            .then((documents) => {

                const result = {
                    features: documents.find(document => document._id === this.FEATURES_DOCUMENT_ID) || {},
                    tariffs: documents.find(document => document._id === this.TARIFFS_DOCUMENT_ID) || {}
                };

                delete result.features._id;
                delete result.tariffs._id;
                return result;
            });
    }
};

module.exports = featureStorage;
