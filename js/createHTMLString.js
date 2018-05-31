// Copyright 2018, University of Colorado Boulder

/**
 * Combine JSON and MD into an HTML report.
 * @author Sam Reid (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const fs = require( 'fs' );
const getMarkdownFileAsHTML = require( './getMarkdownFileAsHTML' );
const handlebars = require( 'handlebars' );

/**
 * The data object has levels like sims=>components=>dataURLs
 * So each simKey is another object
 * @param {Object} data - see `getFromSimInMaster` for more details.
 * @returns {string} - the HTML
 */
const createHTMLString = function( data ) {

  let baseTemplate = handlebars.compile( fs.readFileSync( __dirname + '/../templates/base.html', 'utf8' ) ); // formerly HTML
  let singleComponentTemplate = handlebars.compile( fs.readFileSync( __dirname + '/../templates/singleComponent.html', 'utf8' ) );
  let componentsHTML = '';

  for ( const [repoAndComponent, componentSims] of Object.entries( data ) ) {

    const [repo, component] = repoAndComponent.split( '/' );

    const numberOfSimsThatUseTheComponent = Object.keys( componentSims ).length;

    // get the markdown file
    const markdownHTML = getMarkdownFileAsHTML( repo, component );

    const componentContext = {
      repoAndComponent: repoAndComponent,
      sims: componentSims,
      simCount: numberOfSimsThatUseTheComponent,
      markdown: new handlebars.SafeString( markdownHTML )
    };

    componentsHTML += singleComponentTemplate( componentContext );
  }

  return baseTemplate( { content: componentsHTML, components: Object.keys( data ) } );
};

// handlebars helper functions

handlebars.registerHelper( 'componentLink', ( repoAndComponent ) => {
  let [ repo, component ] = repoAndComponent.slice( '/' );
  return new handlebars.SafeString( 
    `<a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a>`
  );
} );


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
