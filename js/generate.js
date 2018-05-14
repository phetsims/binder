// Copyright 2018, University of Colorado Boulder

/**
 * Runs all sims to get runtime information, then runs createReportFromData to generate HTML.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const fs = require( 'fs' );
const fsExtra = require( 'fs-extra' );
const getFromSimInMaster = require( './getFromSimInMaster' );

// constants
const OUTPUT_FILE = '../docs/index.html';

const myArgs = process.argv.slice( 2 );

const commandLineSims = myArgs[ 0 ]; // Allow comma-separated list of sims
if ( !OUTPUT_FILE ) {
  throw new Error( 'Usage: specify outputFile' );
}
console.log( 'streaming to ' + OUTPUT_FILE );

// Copy image files
try {

  // TODO: this assumes we only need image from two repos
  fsExtra.copySync( '../../sun/docs/images', '../docs/images/sun' );
  fsExtra.copySync( '../../scenery-phet/docs/images', '../docs/images/scenery-phet' );
}
catch( err ) {
  console.error( err );
  console.error( '\x1b[37m' ); // reset back to white text.
}

( async () => {

  const reportString = await getFromSimInMaster( commandLineSims );
  fs.writeFileSync( OUTPUT_FILE, reportString );
  console.log( `wrote final report to:  ${OUTPUT_FILE}` );

})();