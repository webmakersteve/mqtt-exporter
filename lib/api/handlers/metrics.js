const metricRegistry = require('../../metrics');
// const logger = require('../../logging/logger-factory').getLogger('health');

// Get health handler
module.exports.getMetrics = function makeGetMetricsHandler() {
  return async (ctx) => {
    ctx.status = 200;
    ctx.type = 'text/plain';
    ctx.body = metricRegistry.metrics();
  };
};
