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
const matter = require( 'gray-matter' );
const path = require( 'path' );

// const apiUrl = '';
const simsDirectory = path.normalize(__dirname + '/../..');

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

  // get list of files in all doc/ directories, excluding binder (can be async)
  // let repos = [];

  // let documentPaths = repos.reduce( ( acc, repo ) => {
  //   let paths = [];
  //   fs.readFile( ``, ( err, data ) => {} )
  // }, [] );
  // let documentPaths = repos.map( getDocPaths );
  // use front matter object to fetch the appropriate data from arg

  for ( const [repoAndComponent, componentSims] of Object.entries( data ) ) {

    const [repo, component] = repoAndComponent.split( '/' );

    const numberOfSimsThatUseTheComponent = Object.keys( componentSims ).length;

    // get the markdown file
    const markdownHTML = getMarkdownFileAsHTML( repo, component );

    const componentContext = {
      repo: repo,
      component: component,
      sims: componentSims,
      simCount: numberOfSimsThatUseTheComponent,
      markdown: new handlebars.SafeString( markdownHTML )
    };

    componentsHTML += singleComponentTemplate( componentContext );
  }

  return baseTemplate( { content: componentsHTML, components: Object.keys( data ) } );
};

// handlebars helper functions

handlebars.registerHelper( 'componentLink', ( repo, component ) => {
  return new handlebars.SafeString(
    `<a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a>`
  );
} );

// returns an object with the 'data' and 'content' keys
function processFile( err, fileData ) {
  if ( err ) {
    throw err
  };

  // get the front matter object
  let mdObject = matter( fileData );

  // process the md -> html within content key
  mdObject.content = marked( mdObject.content );
}

function getFullDocPaths( repo ) {
  let docDir = path.join( simsDirectory, repo, 'doc' );
  return getFilePathsFromDir( docDir, [] );
}

function getFilePathsFromDir( dir, filelist = [] ) {
  console.log(!dir.includes( 'templates' ));
  if ( !dir.includes('templates') ) {
    console.log( dir );
    fs.readdirSync( dir ).forEach( file => {
      filelist = fs.statSync( path.join( dir, file ) ).isDirectory()
        ? getFilePathsFromDir( path.join( dir, file ), filelist )
        : filelist.concat( path.join( dir, file ) );
    } );
  }
  return filelist;
}

function isMarkdown( filename ) {
  return filename.trim().toLowerCase().split('.').indexOf('md') >= 0;
}

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
