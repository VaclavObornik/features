'use strict';

const Koa = require('koa2');
const koaBody = require('koa-body');
const koaCors = require('koa2-cors');
const compress = require('koa-compress');
const logger = require('koa-logger');

const config = require('./config');
const errorHandler = require('./errorHandler');
const controllers = require('./controllers');


/**
 * START-UP PROCESS
 * */

const app = new Koa();


if (config.env === config.DEVELOPMENT) {
    app.use(logger());
}

/** basic middlewares **/
app.use(koaCors());
app.use(compress());
app.use(koaBody());

/** error handler **/
app.use(errorHandler.getErrorHandler());

/** routes **/
app.use(controllers.routes());

/** initialize modules **/
require('./bootstrap').then(() => {
    app.listen(config.port, () => {
        process.stdout.write(`Feature flagging app runs on port ${config.port}.\n\n`);
    });
});

module.exports = app;
