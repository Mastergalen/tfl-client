require('dotenv').config();
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');

const TflApi = require('../../index');
const NotInUKError = require('../../src/errors/NotInUKError');

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Bus', () => {
  let busStopId = '490014778Q'; // Manor Gardens N7
  const tfl = new TflApi(process.env.TFL_APP_ID, process.env.TFL_KEY);

  describe('#findBusStopByName()', () => {
    context('when bus stop is NaptanOnstreetBusCoachStopPair', () => {
      let stopName = 'Angel Station';
      it('should list all StopPoints', () => {
        return tfl.bus.findBusStopByName(stopName).then(res => {
          expect(res[0].naptanId).to.equal('490000007F');
        });
      });
    });

    context('when bus stop is NaptanOnstreetBusCoachStopCluster', () => {
      let stopName = 'Angel Station';
      it('should list all StopPoints', () => {
        return tfl.bus.findBusStopByName(stopName).then(res => {
          let match = _.isEqual(_(res).map('stopLetter').sortBy().value(), [ 'F', 'G', 'S', 'X', 'Y' ]);
          expect(match).to.be.true;
        });
      });
    });

    context('when the name is not a real bus stop', () => {
      let stopName = 'gibberish station';
      it('should return nil', () => {
        return tfl.bus.findBusStopByName(stopName).then(res => {
          expect(res).to.be.null;
        });
      });
    });
  });

  describe('#getAllArrivalTimes()', () => {
    it('should get the bus arrival times for Manor Gardens', () => {
      return tfl.bus.getAllArrivalTimes(busStopId).then(res => {
        expect(res[0]['$type']).to.equal('Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities');
      });
    });
  });

  describe('#getArrivalTimesByLine()', () => {
    it('should return a map of arrival times by line no', () => {
      return tfl.bus.getArrivalTimesByLine(busStopId).then(res => {
        expect(res).to.be.an.instanceof(Map);

        for (let line of res) {
          expect(line[0]).to.be.a('string');
          expect(line[1].timeToStation).to.be.a('number');
          expect(line[1].destination).to.be.a('string');
        }
      });
    });
  });

  describe('#getArrivalTimesForLine()', () => {
    it('should get the next bus for line 43 at Manor Gardens', () => {
      let line = '43';
      return tfl.bus.getArrivalTimesForLine(busStopId, line).then(res => {
        expect(res).to.be.an('array');
        expect(res).to.satisfy(nums => {
          return nums.every(num => {
            return Number.isInteger(num);
          });
        });
      });
    });

    it('should return null for a non-existent line', () => {
      let line = '123';

      return tfl.bus.getArrivalTimesForLine(busStopId, line).then(res => {
        expect(res).to.be.null;
      });
    });
  });

  describe('#findNearestBusStop()', () => {
    context('when in London', () => {
      let lat = '51.531550';
      let lon = '-0.104881';

      it('should find the nearest bus stop', () => {
        return tfl.bus.findNearestBusStops(lat, lon).then(res => {
          expect(res[0]['$type']).to.equal('Tfl.Api.Presentation.Entities.StopPoint, Tfl.Api.Presentation.Entities');
          expect(res[0]['naptanId']).to.exist;
          expect(res[0]['commonName']).to.exist;
        });
      }).timeout(5000);
    });

    context('when outside London', () => {
      let lat = '53.293137';
      let lon = '-4.417270';

      it('should return empty array', () => {
        return expect(tfl.bus.findNearestBusStops(lat, lon)).to.eventually.have.length(0);
      });
    });

    context('when outside UK', () => {
      // Somewhere in France
      let lat = '48.761828';
      let lon = '3.532962';

      it('should throw a NotInUKError', () => {
        return expect(tfl.bus.findNearestBusStops(lat, lon)).to.be
          .rejectedWith(NotInUKError);
      });
    });
  });
});
