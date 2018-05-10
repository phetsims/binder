'use strict';

const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );

// Helper function to get the sim list from perennial
const getSims = function() {
  const simsFileText = fs.readFileSync( '../perennial/data/active-sims' ).toString();
  const sims = simsFileText.replace( new RegExp( '\r', 'g' ), '' ).split( '\n' );
  sims.splice( sims.indexOf( '' ) );
  return sims;
};

( async () => {
  const browser = await puppeteer.launch();

  let data = {};

  let sims = getSims();

  async function loadSim( i ) {

    const sim = sims[ i ];

    const page = await browser.newPage();

    // log to our server from the browser
    page.on( 'console', msg => console.log( 'PAGE LOG:', msg.text() ) );

    console.log( 'loading: ' + sim );

    // navigate to the sim page
    await page.goto( `http://localhost/${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad` );

    // This will not return until the first message has been sent
    // TODO in our sims, the first message is the loaded one, but we should parse the JSON and make sure that it is the laoded event.
    data[ sim ] = await page.evaluate( () => {
      return new Promise( function( resolve, reject ) {
        window.addEventListener( 'message', function() {

          // TODO: SR!!! resolve with whatever we want to be stored for this sim.
          resolve( 'from the browser: ' + document.title );
        } );
        // TODO: reject?
      } );
    } );

    console.log( data ); // current progress
    await page.close();
    if ( i + 1 < sims.length ) {
      await loadSim( i + 1 );
    }
  }

  // start loading the first sim.
  await loadSim( 0 );

  console.log( `data: `, JSON.stringify( data, null, 2 ) );
  await browser.close();
} )();