const client = require('prom-client');

const { collectDefaultMetrics } = client;
const { Registry } = client;
const register = new Registry();

collectDefaultMetrics({ timeout: 5000, prefix: 'water_monitor_', register });

module.exports = {
  register,
  client,
};
