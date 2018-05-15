// Copyright 2018, University of Colorado Boulder

/**
 * Combine JSON and MD into an HTML report.
 * @author Sam Reid (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const fs = require( 'fs' );
const getMarkdownFileAsHTML = require( './getMarkdownFileAsHTML' );

/**
 * The data object has levels like sims=>components=>dataURLs
 * So each simKey is another object
 * @param {Object} data
 * @returns {string}
 */
const createHTML = function( data ) {

  const componentTypes = {};
  const sims = Object.keys( data );
  sims.forEach( sim => {
    const componentTypesForSim = Object.keys( data[ sim ] );
    componentTypesForSim.forEach( componentTypeForSim => {
      componentTypes[ componentTypeForSim ] = null; // Just enumerating keys
    } );
  } );


  const componentTypesArray = Object.keys( componentTypes );

  let HTML = `<html><head>
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

    // get the markdown file
    const markdownHTML = getMarkdownFileAsHTML( repo, component );


    // TODO: support subdirectories for the component.
    HTML = HTML + `<h1 id="${component.toLowerCase()}">${repoAndComponent}</h1>
<ul>
<li><a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a></li>
<li>Number of published sims with component:</li>
<li>Number of development sims with component: ${numberOfSimsThatUseTheComponent}</li>
</ul>` + markdownHTML;

    //
    const simReports = sims.map( sim => {
      const components = data[ sim ][ repoAndComponent ];
      if ( components ) {
        return '<section>' + sim + ':' + ( components.map( c => {
          return '<image src=' + c + '></image>';
        } ).join( ' ' ) ) + '</section>';
      }
      else {
        // return '<section>' + sim + ':' + 'not used</section>';
        return '';
      }
    } );
    HTML = HTML + simReports.join( '\n' ) + '<hr/>';
  } );
  HTML = HTML + '</body></html>';

  return HTML;
};


/**
 * @param data sim => componentName => [dataURLs]
 * @returns {string}
 */
module.exports = createHTML;

// Shortcut to use stored JSON for quick iteration.
const myArgs = process.argv.slice( 2 );
if ( myArgs[ 0 ] && myArgs[ 0 ] === 'json' ) {
  const inputFile = myArgs[ 1 ];
  const report = createHTML( JSON.parse( fs.readFileSync( inputFile ) ) );
  console.log( report );
}
