# TfL API client

**Features**

* Search for bus stops by name
* Search for bus stops around a coordinate location in London
* Get live bus arrival times for a specific bus stop

This API client is not affiliated with Transport for London in any way.

## Usage

> You must [Register](https://api.tfl.gov.uk/) for a TfL API Key

```javascript
const TfL = require('tfl-client');

let tfl = new TfL(TFL_APP_ID, TFL_APP_SECRET);
```

Search for bus stops by name:
```javascript
tfl.bus.findBusStopByName(name).then(res => {
  console.log(res);
});
```

Search for bus stops within a 1km radius:

```javascript
// busfindNearestBusStops(lat, lon)
tfl.busfindNearestBusStops('51.531550', '-0.104881').then(res => {
  console.log(res);
});
```

With a bus stop ID from your searches you can then query for live bus arrival times:

```javascript
// getAllArrivalTimes(busStopId)
tfl.getAllArrivalTimes('490014778Q').then(res => {
  console.log(res);
});
```

For convenience, `getArrivalTimesByLine()` will group arrival times by line.

```javascript
// getArrivalTimesByLine(busStopId)
tfl.getArrivalTimesByLine('490014778Q').then(res => {
  console.log(res);
});
```

If you only care about the arrival times of a single line, you can use `getArrivalTimesForLine()`.
```javascript
// getArrivalTimesForLine(busStopId, lineId)
tfl.getArrivalTimesForLine('490014778Q', '43').then(res => {
  console.log(res);
});
```


## Tests

Use mocha to run tests.

```
yarn test
```
