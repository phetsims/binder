// Copyright 2018, University of Colorado Boulder

/**
 * Runs all sims to get runtime information. Return the data object based on the sims run in master.
 *
 * Currently the data structure returned is an object where keys are the sims, and the value is an object where the
 * key is the component name i.e. `{{repoName}}/{{componentName}}, and the value is a list of dataURL images.
 *
 *
 * This file relies heavily on phet-core's `InstanceRegistry.js` to communicate with sims during runtime. To get data
 * and pictures about a component in the sim, that component will need to be registered, see ComboBox.js as an example. . .
 * Something like: `
 * // support for binder documentation, stripped out in builds and only runs when ?binder is specified
 * assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

// modules
const buildLocal = require( __dirname + '/../../perennial/js/common/buildLocal' );
const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );

const reposDirectory = `${__dirname}/../..`;

// Helper function to get the sim list from perennial
const getActiveSims = function() {
  return fs.readFileSync( `${reposDirectory}/perennial/data/active-sims` ).toString().trim().split( '\n' ).map( sim => sim.trim() );
};

const getAccessibleSims = () => (
  fs.readFileSync( `${reposDirectory}/perennial/data/accessibility` ).toString().trim().split( '\n' ).map( sim => sim.trim() )
);

const baseURL = buildLocal.localhostURL; // localhostURL should include the port number if present

const processSimPage = async ( sim, page ) => {
  const url = `${baseURL}/${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad&binder`;
  await page.goto( url, { waitUntil: 'networkidle2' } );

  const data = await page.evaluate( ( sim ) => {
    window.addEventListener( 'message', function( event ) {
      if ( event.data ) {
        try {
          let messageData = JSON.parse( event.data );
          if ( messageData.type === 'load' ) {
            console.log( 'loaded', sim );

            if ( phet.phetCore.InstanceRegistry ) {
              return phet.phetCore.InstanceRegistry.map;
            }
            console.error( 'InstanceRegistry not defined. This normally means no components are in this sim.' );
            return undefined;
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
  } );
};

module.exports = async ( simList ) => {

  const browser = await puppeteer.launch();

  let data = {};

  // override to generate based on only sims provided
  let sims = simList ? simList.split( ',' ) : getSims();
  console.log( 'sims to load:', sims.join( ', ' ) );

  puppeteer.launch()
  .then( async browser => {
    let simPages = sims.map( async (sim) => {
      let data = browser.newPage().then( page => processSimPage( sim, page ) );
    } );

    Promise.all( simPages ).then( pages => {

    } );
  } );

/**
 * Start original
 */

  for ( let sim of sims ) {

    const page = await browser.newPage();

    await page.exposeFunction( 'updateComponentData', (simName, dataMap) => {
      for (let component in dataMap ) {

        if ( !data[ component ] ) {
          data[ component ] = {};
        }

        data[ component ][ simName ] = dataMap[ component ];
      }
    } );

    // log to our server from the browser
    page.on( 'console', msg => {
      if ( msg.type() === 'error' ) {
        console.error( `${sim} PAGE ERROR:`, msg.text() );
      }
      else {
        console.log( `${sim} PAGE LOG:`, msg.text() );
      }
    } );

    // navigate to the sim page
    const url = `${baseURL}/${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad&binder`;
    console.log( '\nloading: ' + sim );
    await page.goto( url );

    // Add a listener such that when the sim posts a message saying that it has loaded,
    // get the InstanceRegistry's mapping of components for this sim
    await page.evaluate( ( sim ) => {
      return new Promise( function( resolve, reject ) {
        window.addEventListener( 'message', function( event ) {
          if ( event.data ) {
            try {
              let messageData = JSON.parse( event.data );
              if ( messageData.type === 'load' ) {
                console.log( 'loaded', sim );

                if ( phet.phetCore.InstanceRegistry ) {
                  window.updateComponentData( sim, phet.phetCore.InstanceRegistry.map );
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
        setTimeout( function() {
          console.log( 'sim load timeout, moving on' );
          resolve( undefined );
        }, 20000 );
      } );
    }, sim );
    await page.close();
  }

  browser.close();

  // TODO: is this the best place for this?
  // write data to a file so that we don't have to run this so often for quick iteration.
  fs.writeFileSync( 'binderjson.json', JSON.stringify( data, null, 2 ) );

  // TODO: is it weird to return an object that is by sim THEN by component. createHTML should probably take a data struture based on component at the top level.
  return data;

};
