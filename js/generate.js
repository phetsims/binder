// Copyright 2018-2026, University of Colorado Boulder

/**
 * Main launch point for the documentation generation.
 *
 * Set TOTALITY_PATH environment variable to point to your totality checkout.
 * Defaults to ../totality (assuming binder is a sibling directory).
 *
 * Usage:
 *   TOTALITY_PATH=/path/to/totality node js/generate.js [sim1,sim2,...]
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

const createHTMLString = require( './createHTMLString' );
const fs = require( 'fs' );
const fsExtra = require( 'fs-extra' );
const path = require( 'path' );
const getFromSimInMain = require( './getFromSimInMain' );

// constants
const OUTPUT_FILE = path.join( __dirname, '..', 'docs', 'index.html' );

const myArgs = process.argv.slice( 2 );
const commandLineSims = myArgs[ 0 ]; // Allow comma-separated list of sims

// Resolve the totality path from environment or default to sibling directory
const totalityPath = path.resolve( process.env.TOTALITY_PATH || path.join( __dirname, '..', '..', 'totality' ) );

if ( !fs.existsSync( totalityPath ) ) {
  console.error( `Error: totality path not found: ${totalityPath}` );
  console.error( 'Set TOTALITY_PATH environment variable to your totality checkout.' );
  process.exit( 1 );
}

console.log( `Using totality at: ${totalityPath}` );
console.log( `Streaming to ${OUTPUT_FILE}` );

// Copy image files from totality repos
try {

  // TODO: this assumes we only need images from two repos, see https://github.com/phetsims/binder/issues/28
  fsExtra.copySync( path.join( totalityPath, 'sun/doc/images' ), path.join( __dirname, '..', 'docs/images/sun' ) );
  fsExtra.copySync( path.join( totalityPath, 'scenery-phet/images' ), path.join( __dirname, '..', 'docs/images/scenery-phet' ) );
}
catch( err ) {
  console.error( err );
  console.error( '\x1b[37m' ); // reset back to white text.
}

( async () => {

  // Run all sims via chipper dev-server, get component data and screenshots.
  const componentDataBySim = await getFromSimInMain( commandLineSims, totalityPath );

  const HTML = createHTMLString( componentDataBySim, totalityPath );

  fs.writeFileSync( OUTPUT_FILE, HTML );
  console.log( `Wrote final report to: ${OUTPUT_FILE}` );
} )();