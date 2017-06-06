'use strict';

const router = require('koa-router')();
const FeatureDefinitionRequest = require('../../../models/features/featureDefinitionRequest');
const features = require('../../../models/features');

router.get('*', async (ctx) => {

    const request = new FeatureDefinitionRequest();

    if (ctx.query.system || ctx.query.version) {
        request.system = {
            system: ctx.query.system,
            version: ctx.query.version
        };
    }

    request.merchantId = ctx.query.merchantId;

    request.validate();

    ctx.body = await features.getFeatureDefinitionsForSystemAndVersion(request);
});

module.exports = router;
