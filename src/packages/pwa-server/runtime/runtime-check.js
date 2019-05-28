import { controllerExists } from '@core/runtime';
// Check for cmd+r reloads.
controllerExists().then(function (exists) {
    if (exists)
        location.reload();
});
