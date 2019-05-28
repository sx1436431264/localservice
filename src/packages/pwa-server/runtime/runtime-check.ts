import {controllerExists} from '@core/runtime';

// Check for cmd+r reloads.
controllerExists().then(
  exists => {
    if (exists) location.reload();
  }
);
