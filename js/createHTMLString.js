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
 * @param {Object} data - see `getFromSimInMaster` for more details.
 * @returns {string} - the HTML
 */
const createHTMLString = function( data ) {

  let HTML = `<!DOCTYPE html>
<html>
<head>
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

  for ( const [repoAndComponent, componentSims] of Object.entries( data ) ) {

    const [repo, component] = repoAndComponent.split( '/' );

    const numberOfSimsThatUseTheComponent = Object.keys( componentSims ).length;

    // get the markdown file
    const markdownHTML = getMarkdownFileAsHTML( repo, component );


    // TODO: support subdirectories for the component.
    HTML = HTML + `<h1 id="${component.toLowerCase()}">${repoAndComponent}</h1>
<ul>
<li><a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a></li>
<li>Number of published sims with component:</li>
<li>Number of development sims with component: ${numberOfSimsThatUseTheComponent}</li>
</ul>` + markdownHTML;

    const simReports = [];

    for ( const [ sim, simComponentUrlList ] of Object.entries( componentSims ) ) {
      
      simReports.push( `<section>
  <h3>${sim}</h3>
  ${ simComponentUrlList.map( url => `<image src="${url}" ></image>` ) }
  </section>` );
    }

    HTML = HTML + simReports.join( '\n' ) + '<hr/>';

  }
  
  HTML = HTML + '</body></html>';

  return HTML;
};


/**
 * @param data sim => componentName => [dataURLs]
 * @returns {string}
 */
module.exports = createHTMLString;

// Shortcut to use stored JSON for quick iteration. See getFromSimInMaster for writing of this data file.
const myArgs = process.argv.slice( 2 );
if ( myArgs[ 0 ] && myArgs[ 0 ] === 'json' ) {
  const inputFile = myArgs[ 1 ];
  const report = createHTMLString( JSON.parse( fs.readFileSync( inputFile ) ) );
  console.log( report );

}
