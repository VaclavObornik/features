
const mocha = require('mocha');
const api = require('../../apiTestUtil');
const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;
const before = require('mocha').before;
const featureStorage = require('../../../server/models/features/featureStorage');

const merchantId1 = '60dab243332f920e00b6cd16';
const merchantId2 = '58dab243332f920e00b6cd17';

const customTariffsDocument = {
    start: ['553a61b39bfb20160000000b', '56cec1a5df25010e00b0a6cf']
};

const customFeaturesDocument = {
    feature1: ['test', 'env:pre'],
    feature2: ['pos>=4.122', merchantId1],
    merchantSpecificBugFix: [`merchantId:${merchantId2}`],
    tariffFeature: ['tariff:start,profi']
};


describe('Features API', () => {

    api.before(mocha);

    before(function (done) {
        Promise.all([
            featureStorage.updateFeatureDefinitions(customFeaturesDocument),
            featureStorage.updateTariffsDefinitions(customTariffsDocument)
        ]).then(() => done(), done);
    });

    describe('GET method', function () {

        it('should return definitions when requested for `POS` system', () => {
            return api.request()
                .get('/')
                .query({ system: 'POS', version: '5.901', environment: 'production' })
                .expect(200)
                .then((res) => {
                    assert.deepEqual(res.body, {
                        feature1: false,
                        feature2: true,
                        merchantSpecificBugFix: false,
                        tariffFeature: false
                    });
                });
        });

        it('should return definitions when requested for `merchant` and `tariff`', () => {
            return api.request()
                .get('/')
                .query({ merchantId: '58dab243332f920e00b6cd17', tariffId: '553a61b39bfb20160000000b' })
                .expect(200)
                .then((res) => {
                    assert.deepEqual(res.body, {
                        feature1: false,
                        feature2: false,
                        merchantSpecificBugFix: true,
                        tariffFeature: true
                    });
                });
        });

        it('should return definitions when only `system` property is passed into request', () => {
            return api.request()
                .get('/')
                .query({ system: 'POS' })
                .then((res) => {
                    assert.deepEqual(res.body, {
                        feature1: false,
                        feature2: false,
                        merchantSpecificBugFix: false,
                        tariffFeature: false
                    });
                });
        });

        it('should return all definitions as false when no query specified', () => {
            return api.request()
                .get('/')
                .then((res) => {
                    assert.deepEqual(res.body, {
                        feature1: false,
                        feature2: false,
                        merchantSpecificBugFix: false,
                        tariffFeature: false
                    });
                });
        });

        it('should return 400 when non-existing system is passed into request', () => {
            return api.request()
                .get('/')
                .query({ system: 'BLABLABLABADTEST', version: '5.901' })
                .expect(400);
        });

        it('should return 400 when `version` property is specified, but not `system` name', () => {
            return api.request()
                .get('/')
                .query({ version: '5.901' })
                .expect(400);
        });
    });
});
