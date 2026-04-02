// Copyright 2018-2026, University of Colorado Boulder

/**
 * Runs all sims to get runtime information. Return the data object based on the sims run in main.
 *
 * Currently the data structure returned is an object where keys are the sims, and the value is an object where the
 * key is the component name i.e. `{{repoName}}/{{componentName}}, and the value is a list of dataURL images.
 *
 * It also collects registered Hotkeys in every repository described by scenery/HotkeyData.
 *
 * This file relies heavily on phet-core's `InstanceRegistry.js` to communicate with sims during runtime. To get data
 * and pictures about a component in the sim, that component will need to be registered, see ComboBox.js as an example.
 * Something like: `
 * // support for binder documentation, stripped out in builds and only runs when ?binder is specified
 * assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
 *
 * Modernized to run sims via chipper's dev-server from a totality monorepo checkout, specified by the TOTALITY_PATH
 * environment variable. The dev-server handles on-the-fly esbuild transpilation/bundling.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* global window phet */

// modules
const { spawn } = require( 'child_process' );
const http = require( 'http' );
const _ = require( 'lodash' );
const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'path' );
const { chromium } = require( 'playwright' );

const DEBUG = false;
const DEV_SERVER_PORT = 48126;

// Helper function to get the sim list from totality's perennial-alias
const getSims = function( totalityPath ) {
  return fs.readFileSync( path.join( totalityPath, 'perennial-alias/data/active-sims' ) )
    .toString().trim().split( '\n' ).map( sim => sim.trim() );
};

/**
 * Start chipper's dev-server from the totality checkout. Returns a promise that resolves with the child process
 * once the server is listening.
 */
function startDevServer( totalityPath ) {
  const chipperDir = path.join( totalityPath, 'chipper' );

  console.log( `Starting chipper dev-server from ${chipperDir} on port ${DEV_SERVER_PORT}...` );

  const server = spawn( 'npx', [ 'grunt', 'dev-server', `--port=${DEV_SERVER_PORT}` ], {
    cwd: chipperDir,
    stdio: [ 'ignore', 'pipe', 'pipe' ]
  } );

  if ( DEBUG ) {
    server.stdout.on( 'data', data => console.log( `[dev-server stdout] ${data.toString().trim()}` ) );
    server.stderr.on( 'data', data => console.log( `[dev-server stderr] ${data.toString().trim()}` ) );
  }

  server.on( 'error', err => {
    console.error( `Failed to start dev-server: ${err.message}` );
  } );

  // Poll until the server responds to HTTP requests
  return new Promise( ( resolve, reject ) => {
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds max

    const poll = () => {
      attempts++;
      const req = http.get( `http://localhost:${DEV_SERVER_PORT}/`, res => {
        console.log( `Dev-server ready at http://localhost:${DEV_SERVER_PORT}/ (after ${attempts * 500}ms)` );
        res.resume(); // drain the response
        resolve( server );
      } );
      req.on( 'error', () => {
        if ( attempts >= maxAttempts ) {
          reject( new Error( 'Dev-server failed to start within 30 seconds' ) );
        }
        else {
          setTimeout( poll, 500 );
        }
      } );
      req.end();
    };
    setTimeout( poll, 500 );
  } );
}

module.exports = async ( commandLineSims, totalityPath ) => {

  const devServer = await startDevServer( totalityPath );

  try {

    const baseURL = `http://localhost:${DEV_SERVER_PORT}/`;
    const browser = await chromium.launch();

    const dataByComponent = {};
    const dataBySim = {};
    const hotkeysBySim = {};

    // override to generate based on only sims provided
    const sims = commandLineSims ? commandLineSims.split( ',' ) : getSims( totalityPath );
    console.log( 'sims to load:', sims.join( ', ' ) );

    for ( const sim of sims ) {

      const page = await browser.newPage();

      await page.exposeFunction( 'updateComponentData', ( simName, dataMap, hotkeys ) => {
        assert( !dataBySim[ sim ], 'sim already exists?' );

        dataBySim[ sim ] = {};
        const simObject = dataBySim[ sim ];
        simObject.name = sim;
        simObject.components = [];

        assert( !hotkeysBySim[ sim ], 'sim already exists?' );
        hotkeysBySim[ sim ] = hotkeys;

        for ( const component in dataMap ) {
          if ( dataMap.hasOwnProperty( component ) ) {

            if ( !dataByComponent[ component ] ) {
              dataByComponent[ component ] = {};
            }

            dataByComponent[ component ][ simName ] = dataMap[ component ];

            // fill in simulation based data
            simObject.components.push( component );
            simObject.components = _.uniq( simObject.components );
          }
        }
      } );

      // log to our server from the browser
      page.on( 'console', msg => {
        if ( msg.type() === 'error' ) {
          console.error( `${sim} PAGE ERROR:`, msg.text() );
        }
        else {
          DEBUG && console.log( `${sim} PAGE LOG:`, msg.text() );
        }
      } );

      page.on( 'crash', () => {
        console.error( `${sim} PAGE CRASH` );
      } );
      page.on( 'pageerror', error => {
        console.error( `${sim} PAGE ERROR:`, error.message );
      } );

      // navigate to the sim page
      const url = `${baseURL}${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad&binder`;
      console.log( `\nloading: ${sim}` );
      console.log( url );
      await page.goto( url );

      // Add a listener such that when the sim posts a message saying that it has loaded,
      // get the InstanceRegistry's mapping of components for this sim
      await page.evaluate( sim => {
        return new Promise( ( resolve, reject ) => {

          window.addEventListener( 'message', event => {
            if ( event.data ) {
              try {
                const messageData = JSON.parse( event.data );
                if ( messageData.type === 'load' ) {
                  console.log( 'loaded', sim );

                  if ( phet.phetCore.InstanceRegistry ) {
                    window.updateComponentData( sim, phet.phetCore.InstanceRegistry.componentMap, phet.phetCore.InstanceRegistry.hotkeys );
                    resolve();
                  }
                  else {
                    console.error( 'InstanceRegistry not defined. This normally means no components are in this sim.' );
                    resolve( undefined );
                  }
                }
              }
              catch( e ) {

                // message isn't what we wanted it to be, so ignore it
                console.log( 'CAUGHT ERROR:', e.message );
              }
            }
            else {
              console.log( 'no data on message event' );
            }
          } );

          setTimeout( () => {
            console.error( `load timeout for ${sim}, moving on` );
            resolve( undefined );
          }, 20000 );
        } );
      }, sim );
      await page.close();
    }

    await browser.close();

    const outputObject = {
      components: dataByComponent,
      sims: dataBySim,
      hotkeys: hotkeysBySim
    };

    // Write data to a file so that we don't have to run this so often for quick iteration.
    fs.writeFileSync( `${__dirname}/../binderjson.json`, JSON.stringify( outputObject, null, 2 ) );

    return outputObject;
  }
  finally {
    devServer.kill();
    console.log( 'Dev-server stopped.' );
  }
};
