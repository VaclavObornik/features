'use strict';

const router = require('koa-router')();

router.use('/api', require('./api').routes());

module.exports = router;
