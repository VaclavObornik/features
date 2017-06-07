'use strict';

const router = require('koa-router')();

router.use('/', require('./api/features/features').routes());

module.exports = router;
