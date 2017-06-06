
const mocha = require('mocha');
const api = require('../../apiTestUtil');
const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;
const before = require('mocha').before;
const featureStorage = require('../../../server/models/features/featureStorage');

const customDocument = {
    feature1: ['test', 'pre', 'production'],
    feature2: ['pos>=4.122'],
    merchantSpecificBugFix: ['58dab243332f920e00b6cd17']
};


describe('Features API', () => {

    api.before(mocha);

    before(function (done) {
        featureStorage.updateFeatureDefinitions(customDocument)
            .then(() => done());
    });

    describe('GET method', function () {

        it('should return definitions when requested for `POS` system', () => {
            return api.request()
                .get('/api/features')
                .query({ system: 'POS', version: '5.901' })
                .expect(200)
                .then((res) => {
                    assert(!res.body.error, 'Response should have not contain any error');
                    assert(res.body.feature1 === false, 'Feature should be false');
                    assert(res.body.feature2 === true, 'Feature should be true');
                    assert(res.body.merchantSpecificBugFix === false, 'Feature should be false');
                });
        });

        it('should return definitions when requested for `merchant`', () => {
            return api.request()
                .get('/api/features')
                .query({ merchantId: '58dab243332f920e00b6cd17' })
                .expect(200)
                .then((res) => {
                    assert(!res.body.error, 'Response should have not contain any error');
                    assert(res.body.feature1 === false, 'Feature should be false');
                    assert(res.body.feature2 === false, 'Feature should be false');
                    assert(res.body.merchantSpecificBugFix === true, 'Feature should be true');
                });
        });

        it('should return definitions when only `system` property is passed into request', () => {
            return api.request()
                .get('/features')
                .query({ system: 'POS' })
                .then(function (res) {

                    assert(!res.body.error, 'Response should have not contain any error');

                    for (const prop in res.body) {
                        if (!Object.prototype.hasOwnProperty.call(res.body, prop)) { continue; }
                        assert(typeof res.body[prop] === 'boolean', 'All definition properties should be just booleans');
                    }
                });
        });

        it('should return all definitions as false when no query specified', () => {
            return api.request()
                .get('/features')
                .then(function (res) {

                    assert(!res.body.error, 'Response should have not contain any error');

                    for (const prop in res.body) {
                        if (!Object.prototype.hasOwnProperty.call(res.body, prop)) { continue; }
                        assert(typeof res.body[prop] === 'boolean', 'All definition properties should be just booleans');
                        assert(res.body[prop] === false, 'Every feature should be false');
                    }
                });
        });

        it('should return 400 when non-existing system is passed into request', () => {
            return api.request()
                .get('/api/features')
                .query({ system: 'BLABLABLABADTEST', version: '5.901' })
                .expect(400);
        });

        it('should return 400 when `version` property is specified, but not `system` name', () => {
            return api.request()
                .get('/api/features')
                .query({ version: '5.901' })
                .expect(400);
        });
    });
});
