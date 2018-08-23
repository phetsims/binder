# binder
Generates and publishes documentation for PhET simulation components.

See [https://phetsims.github.io/binder/](https://phetsims.github.io/binder/) for public up to date documentation and style guide on PhET sim
components.

## configuration

During the generation outlined below, we make use of a local server running the sims. If it's not running or not present in your `build-local.json` configuration file, it will fail. It references the following keys:

```js
{
  "localhostURL": "https://someUrl..."  // REQUIRED with asserts
}
```
Port numbers should be included in the URL string.

## generation
To generate the component images and pull the appropriate :

    `npm run build`

To generate docs with only specific simulation examples, add them as an argument, comma separated:

    `npm run build -- ohms-law,wave-on-a-string`

The generated docs load sim to gather runtime information. To bypass this step and use stored data from sim loads:

    `npm run build-json`

NOTE: This will only log out the html string, not write it to the output file. The above snippet will copy the output
into a file of your choosing.


For more information see https://github.com/phetsims/binder/ or contact @mbarlow12.