'use strict';

const router = require('koa-router')();

router.use('/features', require('./features/features').routes());

module.exports = router;
