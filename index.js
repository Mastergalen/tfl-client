const config = require('./config/config');

const Bus = require('./src/bus');

class TflApi {
  constructor(app_id, secret) {
    let cfg = config.build(app_id, secret);

    this.bus = new Bus(cfg);
    this.errors = require('./src/errors');
  }
}

module.exports = TflApi;
