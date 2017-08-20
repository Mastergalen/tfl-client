const deepFreeze = require('deep-freeze');

function build(app_id, secret) {
  return {
    baseUrl: 'https://api.tfl.gov.uk',
    auth: {
      app_id: app_id,
      secret: secret
    }    
  }
}

module.exports = deepFreeze({
  build
});
