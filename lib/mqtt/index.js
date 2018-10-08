const mqtt = require('mqtt');
const logger = require('../../lib/logging/logger-factory');

class MqttClient {
  constructor(options) {
    this.client = mqtt.connect(options.connection_string);
    this.logger = logger.getLogger('mqtt-client');

    this.client.on('message', (topic, message) => {
      // message is Buffer
      this.logger.info(message.toString());
      this.client.end();
    });

    this.client.on('connect', () => {
      this.client.subscribe('presence', (err) => {
        if (!err) {
          this.client.publish('presence', 'Hello mqtt');
        }
      });
    });
  }
}

module.exports = MqttClient;
