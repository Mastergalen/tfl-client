const chai = require('chai');
const expect = chai.expect;

const TflApi = require('../index');

describe('TflApi', () => {
  const tfl = new TflApi(process.env.TFL_APP_ID, process.env.TFL_KEY);

  describe('.errors', () => {
    it('should contain all errors', () => {
      expect(tfl.errors).to.have.property('NotInUKError');
    });    
  });
});
