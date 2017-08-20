require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');
const URLSearchParams = require('url-search-params');
const _ = require('lodash');

const NotInUKError = require('./errors/NotInUKError');
const busFilters = {
  stopTypes: 'NaptanPublicBusCoachTram',
  modes: 'bus'
};

const stopPointEntityType = 'Tfl.Api.Presentation.Entities.StopPoint, Tfl.Api.Presentation.Entities';

class Bus {
  constructor(config) {
    this.config = config;
  }

  findBusStopByName(name) {
    let endpoint = `/StopPoint/Search/${encodeURIComponent(name)}`;

    return this.fetchJson(endpoint, busFilters).then(res => {
      if (res.total === 0) {
        return null;
      }

      return this.fetchJson(`/StopPoint/${res.matches[0].id}`);
    }).then(res => {
      if (res === null) return null;

      let stopPoints = _.filter(res.children, el => {
        return el['$type'] === stopPointEntityType && _.isEqual(el.modes, ['bus']);
      });

      let clusterStop = _.find(stopPoints, {stopType: 'NaptanOnstreetBusCoachStopCluster'});
      if (clusterStop) {
        return clusterStop.children;
      }

      return stopPoints;
    });
  }

  findNearestBusStops(lat, lon) {
    let params = Object.assign({}, busFilters, {lat, lon, radius: 1000});
    let endpoint = `/StopPoint`;

    return this.fetchJson(endpoint, params).then(res => {
      if (res.httpStatusCode === 400) {
        throw new NotInUKError();
      }

      return res.stopPoints;
    });
  }

  getAllArrivalTimes(busStopId) {
    return this.fetchJson('/StopPoint/' + busStopId + '/arrivals').then(res => {
      return _.sortBy(res, ['timeToStation']);
    });
  }

  getArrivalTimesByLine(busStopId) {
    return this.getAllArrivalTimes(busStopId).then(arrivalTimes => {
      let buses = new Map();
      for (let bus of arrivalTimes) {
        if (buses.has(bus.lineId)) continue;

        buses.set(bus.lineId, {
          timeToStation: Math.floor(bus.timeToStation / 60.0),
          destination: bus.destinationName
        });
      }

      return buses;
    });
  }

  getArrivalTimesForLine(busStopId, lineId) {
    return this.getAllArrivalTimes(busStopId).then(arrivalTimes => {
      let times = _(arrivalTimes).filter(t => {
        return t.lineId === lineId.toString();
      }).slice(0, 3)
      .map(bus => {
        return Math.floor(bus.timeToStation / 60.0);
      }).value();

      return times.length === 0 ? null : times;
    });
  }

  fetchJson(url, params) {
    const authParams = {
      app_id: this.config.auth.app_id,
      app_key: this.config.auth.secret
    }

    let queryString = new URLSearchParams(Object.assign({}, authParams, params)).toString();
    let query = this.config.baseUrl + url + '?' + queryString;
    try {
      return fetch(query).then(res => {
        return res.json();
      });
    } catch (e) {
      console.error(`Error fetching ${url}`);
      console.error(e);
    }
  }
}

module.exports = Bus;
