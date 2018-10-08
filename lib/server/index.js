const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const logger = require('../logging/logger-factory').getLogger('server');
const healthHandler = require('../api/handlers/health').getHealth;
const errorHandlers = require('../api/handlers/errors');
const configHandlers = require('../api/handlers/admin/config');
const metricsHandler = require('../api/handlers/metrics');

module.exports.createServer = function createServer(globalConfig, svcs) {
  const app = new Koa();
  const config = globalConfig.http;

  const services = {
    ...svcs,
    logger,
  };

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    logger.trace(`${ctx.method} ${ctx.url} - took ${ms}ms`);
  });

  app.use(async (ctx, next) => {
    ctx.services = services;
    await next();
  });

  app.use(errorHandlers.internalError());
  app.use(errorHandlers.notFound());

  const router = new Router();

  // Generic Routes. Not app specific
  router.get('/health', healthHandler());
  router.get('/metrics', metricsHandler.getMetrics());

  // Global middleware
  router.use(['/api'], bodyParser());

  const authenticatedRouter = new Router({
    prefix: '/api',
  });
  authenticatedRouter.use(bodyParser());

  // All routes below this require authentication
  const adminRouter = new Router({
    prefix: '/api/admin',
  });
  adminRouter.use(bodyParser());

  adminRouter.get('/config', configHandlers.getConfig(globalConfig));

  app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(authenticatedRouter.routes())
    .use(authenticatedRouter.allowedMethods())
    .use(adminRouter.routes())
    .use(adminRouter.allowedMethods());

  const oldListen = app.listen.bind(app);

  app.listen = function listen() {
    return oldListen(config.port);
  };

  return app;
};
