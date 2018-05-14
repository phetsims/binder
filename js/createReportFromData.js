// Copyright 2018, University of Colorado Boulder

/**
 * Combine JSON and MD into an HTML report.
 * @author Sam Reid (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const fs = require( 'fs' );
const marked = require( 'marked' );

/**
 * @param {Object} data sims=>components=>dataURLs
 * @returns {string}
 */
const createReportFromData = function( data ) {

  const componentTypes = {};
  const sims = Object.keys( data );
  sims.forEach( sim => {
    const componentTypesForSim = Object.keys( data[ sim ] );
    componentTypesForSim.forEach( componentTypeForSim => {
      componentTypes[ componentTypeForSim ] = null; // Just enumerating keys
    } );
  } );

  const componentTypesArray = Object.keys( componentTypes );

  let header = `<html><head>
<style>
 body {
    background-color: #acd7ed;
  }
  img {
    margin: 6px;
  }
  table, th, td {
   border: 1px solid black;
}
</style>
</head>
<body>`;
  componentTypesArray.forEach( function( repoAndComponent ) {

    let repo = repoAndComponent.split( '/' )[ 0 ];
    let component = repoAndComponent.split( '/' )[ 1 ];

    const simsThatUseTheComponent = sims.filter( sim => {
      return data[ sim ][ repoAndComponent ];
    } );
    const numberOfSimsThatUseTheComponent = simsThatUseTheComponent.length;

    let markdown = '';
    try {
      const m = fs.readFileSync( `../../${repo}/docs/${component}.md` );
      markdown = marked( m.toString() );

      // Use subdirectory for images, so that different directories can have images of the same name
      // TODO: This may yield false positives, say if code examples have this same term.
      markdown = markdown.split( '<img src="images/' ).join( '<img src="images/' + repo + '/' );
    }
    catch( e ) {
      markdown = marked( '# TODO: *documentation*' );
    }

    // TODO: support subdirectories for the component.
    header = header + `<h1>${repoAndComponent}</h1>
<ul>
<li><a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a></li>
<li>Number of published sims with component:</li>
<li>Number of development sims with component: ${numberOfSimsThatUseTheComponent}</li>
</ul>` + markdown;
    const simReports = sims.map( sim => {
      const components = data[ sim ][ repoAndComponent ];
      if ( components ) {
        return '<section>' + sim + ':' + ( components.map( c => {
          return '<image src=' + c + '></image>';
        } ).join( ' ' ) ) + '</section>';
      }
      else {
        return '<section>' + sim + ':' + 'not used</section>';
      }
    } );
    header = header + simReports.join( '\n' );
  } );
  header = header + '</body></html>';

  return header;
};
/**
 * @param data sim => componentName => [dataURLs]
 * @returns {string}
 */
module.exports = createReportFromData;

// Shortcut to use stored JSON for quick iteration.
const myArgs = process.argv.slice( 2 );
if ( myArgs[ 0 ] && myArgs[ 0 ] === 'json' ) {
  const inputFile = myArgs[ 1 ];
  const report = createReportFromData( JSON.parse( fs.readFileSync( inputFile ) ) );
  console.log( report );
}
