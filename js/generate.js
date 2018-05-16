// Copyright 2018, University of Colorado Boulder

/**
 * Main launch point for the documentation generation
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const fs = require( 'fs' );
const fsExtra = require( 'fs-extra' ); // eslint-disable-line
const getFromSimInMaster = require( './getFromSimInMaster' );
const createHTMLString = require( './createHTMLString' );

// constants
const OUTPUT_FILE = '../docs/index.html';

const myArgs = process.argv.slice( 2 );

const commandLineSims = myArgs[ 0 ]; // Allow comma-separated list of sims

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

  // Run all sims, get a list of pictures for a sim for a component.
  const componentDataBySim = await getFromSimInMaster( commandLineSims );

  const HTML = createHTMLString( componentDataBySim );

  fs.writeFileSync( 'binderjson.json', JSON.stringify( componentDataBySim, null, 2 ) );
  fs.writeFileSync( OUTPUT_FILE, HTML );
  console.log( `wrote final report to:  ${OUTPUT_FILE}` );
} )();