# TfL API client

**Only supports some basic bus API calls right now**

This API client is not affiliated with Transport for London in any way.

## Usage

```javascript
const TfL = require('tfl-client');

let tfl = new TfL(TFL_APP_ID, TFL_APP_SECRET);

tfl.bus.findBusStopByName(name).then(res => {
  console.log(res);
});
```

