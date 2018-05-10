// Copyright 2018, University of Colorado Boulder

/**
 * Runs all sims to get runtime information, then runs createReportFromData to generate HTML.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
( function() {
  'use strict';

  const puppeteer = require( 'puppeteer' ); // eslint-ignore-line
  const fs = require( 'fs' );
  const createReportFromData = require( './createReportFromData' );

  // Helper function to get the sim list from perennial
  const getSims = function() {
    return fs.readFileSync( '../../perennial/data/active-sims' ).toString().trim().split( '\n' ).map( sim => sim.trim() );
  };

  // Command to echo through the sim, so that we know it launched.
  const echo = 'phet.binder.sim.loaded';

  const myArgs = process.argv.slice( 2 );
  const outputFile = myArgs[ 0 ];
  const commandLineSims = myArgs[ 1 ]; // Allow comma-separated list of sims
  if ( !outputFile ) {
    throw new Error( 'Usage: specify outputFile' );
  }
  console.log( 'streaming to ' + outputFile );

  ( async () => {
    const browser = await puppeteer.launch();

    let data = {};

    let sims = commandLineSims ? commandLineSims.split( ',' ) : getSims();
    console.log( sims.join( ', ' ) );

    async function loadSim( i ) {

      const sim = sims[ i ];
      const page = await browser.newPage();

      // log to our server from the browser
      page.on( 'console', async function( msg ) {

        if ( msg.text() === echo ) {
          const result = await page.evaluate( () => {
            if ( phet.phetCore.InstanceRegistry ) {
              return phet.phetCore.InstanceRegistry.map; // TODO: should this be Promise.resolve(...)?
            }
            else {
              console.log( 'map not found for sim: ' + sim );
              return {};
            }
          } );
          data[ sim ] = result;

          await page.close();
          if ( i + 1 < sims.length ) {

            const report = createReportFromData( data );
            fs.writeFileSync( outputFile, report );
            console.log( 'wrote report to: ' + outputFile );

            await loadSim( i + 1 );
          }
          else {
            browser.close();
            const reportString = createReportFromData( data );
            fs.writeFileSync( 'binderjson.json', JSON.stringify( data, null, 2 ) );
            fs.writeFileSync( outputFile, reportString );
            console.log( 'wrote report to: ' + outputFile );
          }
        }
        else {
          console.log( 'PAGE LOG:', msg.text() );
        }
      } );

      // navigate to the sim page
      const url = `http://localhost/${sim}/${sim}_en.html?brand=phet&ea&consoleLogOnLoad=${echo}&binder`;
      console.log( 'loading: ' + sim );
      await page.goto( url );
    }

    // start loading the first sim.
    await loadSim( 0 );
  } )();
} )();