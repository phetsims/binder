// Copyright 2018, University of Colorado Boulder

/**
 * Runs all sims to get runtime information, then runs createReportFromData to generate HTML.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

// modules
const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const getFromSimInMasterHTML = require( './getFromSimInMasterHTML' );

// Helper function to get the sim list from perennial
const getSims = function() {
  return fs.readFileSync( '../../perennial/data/active-sims' ).toString().trim().split( '\n' ).map( sim => sim.trim() );
};

module.exports = async ( commandLineSims ) => {
  const browser = await puppeteer.launch();

  let data = {};

  // override to generate based on only sims provided
  let sims = commandLineSims ? commandLineSims.split( ',' ) : getSims();
  console.log( 'sims to load:', sims.join( ', ' ) );

  for ( let sim of sims ) {

    const page = await browser.newPage();

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
    const url = `http://localhost/${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad&binder`;
    console.log( '\nloading: ' + sim );
    await page.goto( url );

    // Add a listener such that when the sim posts a message saying that it has loaded,
    // get the InstanceRegistry's mapping of components for this sim
    data[ sim ] = await page.evaluate( ( sim ) => {
      return new Promise( function( resolve, reject ) {
        window.addEventListener( 'message', function( event ) {
          if ( event.data ) {
            try {
              let messageData = JSON.parse( event.data );
              if ( messageData.type === 'load' ) {
                console.log( 'loaded', sim );

                if ( phet.phetCore.InstanceRegistry ) {
                  resolve( phet.phetCore.InstanceRegistry.map );
                }
                else {
                  console.error( 'InstanceRegistry not defined. This normally means no components are in this sim.' );
                  resolve( {} );
                }
              }
            }
            catch( e ) {
              // message isn't what we wanted it to be, so ignore it
            }
          }
          else {
            console.log( 'no data on message event' );
          }
        } );
        setTimeout( function() {
          console.log( 'sim load timeout, moving on' );
          resolve( {} );
        }, 20000 );
      } );
    }, sim );
    await page.close();
  }

  browser.close();

  fs.writeFileSync( 'binderjson.json', JSON.stringify( data, null, 2 ) );
  return getFromSimInMasterHTML( data );

};