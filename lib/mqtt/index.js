const mqtt = require('mqtt');
const logger = require('../logging/logger-factory');
const { client, register } = require('../metrics');

class MqttClient {
  handleMetric(metricMessage) {
    // metric message should be JSON
    let parsed;
    try {
      parsed = JSON.parse(metricMessage.toString());
    } catch (e) {
      this.logger.warn(e, `Could not process JSON: ${metricMessage.toString()}`);
      return;
    }

    const { device, key, value } = parsed;

    if (!this.gauges[key]) {
      this.logger.warn(`Could not find gauge by key: ${key}`);
      return;
    }

    const gauge = this.gauges[key];

    gauge.set({ device }, value);
  }

  constructor(options) {
    this.client = mqtt.connect(process.env.MQTT_CONNECTION_STRING || options.connection_string);
    this.logger = logger.getLogger('mqtt-client');

    this.gauges = {
      moisture_levels: new client.Gauge({
        name: 'water_monitor_moisture_levels',
        help: 'reported moisture levels',
        labelNames: ['device', 'plant'],
        registers: [register],
      }),
    };

    this.client.on('message', (topic, message) => {
      switch (topic) {
        case 'watermonitor/metric':
          this.handleMetric(message);
          break;
        case 'watermonitor/presence':
          break;
        default:
          // message is Buffer
          this.logger.warn(`Got invalid topic (${topic}). message = "${message.toString()}"`);
      }
    });

    this.client.on('connect', () => {
      this.client.subscribe('watermonitor/metric', (err) => {
        if (err) {
          throw err;
        }

        setInterval(() => {
          this.client.publish('watermonitor/metric', JSON.stringify({
            key: 'moisture_levels',
            device: 'sensor1',
            value: Math.random() * 10000,
          }));
        }, 1000);
      });
    });
  }

  shutdown() {
    this.client.end();
  }
}

module.exports = MqttClient;
