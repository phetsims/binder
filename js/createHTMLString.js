// Copyright 2018, University of Colorado Boulder

/**
 * Combine JSON and MD into an HTML report.
 * @author Sam Reid (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const fs = require( 'fs' );
// const getMarkdownFileAsHTML = require( './getMarkdownFileAsHTML' );
const handlebars = require( 'handlebars' );
const marked = require( 'marked' );
const matter = require( 'gray-matter' ); // eslint-disable-line
const path = require( 'path' );

// const apiUrl = '';
const simsDirectory = path.normalize(__dirname + '/../..');

// returns an object with the 'data' and 'content' keys
function processFile( filePath ) {

  // get the front matter object
  let mdObject = matter.read( filePath );
  let pathArray = filePath.split( path.sep );
  let docIdx = pathArray.indexOf( 'doc' );
  let repo = pathArray[ docIdx - 1 ];
  mdObject.content  = marked( mdObject.content ).split( '<img src="images/' ).join( '<img src="images/' + repo + '/' );
  mdObject.repo = repo;
  return mdObject;
}

function getFullDocPaths( repo ) {
  let docDir = path.join( simsDirectory, repo, 'doc' );
  return getFilePathsFromDir( docDir, [] );
}

function getFilePathsFromDir( dir, filelist = [] ) {
  if ( !( dir.includes( 'templates' ) || dir.includes( 'images' ) ) ) {
    fs.readdirSync( dir ).forEach( file => {
      filelist = fs.statSync( path.join( dir, file ) ).isDirectory()
        ? getFilePathsFromDir( path.join( dir, file ), filelist )
        : filelist.concat( path.join( dir, file ) );
    } );
  }
  return filelist;
}

// function isMarkdown( filename ) {
//   return filename.trim().toLowerCase().split('.').indexOf('md') >= 0;
// }

function flatten( arr ) {
  return [].concat( ...arr );
}

function getHandlebarsTemplate ( filename ) {
  const fullPath = path.normalize( __dirname + '/../templates/' + filename );
  return handlebars.compile( fs.readFileSync( fullPath, 'utf8' ) );
}

/**
 * The data object has levels like sims=>components=>dataURLs
 * So each simKey is another object
 * @param {Object} data - see `getFromSimInMaster` for more details.
 * @returns {string} - the HTML
 */
const createHTMLString = function( data ) {

  let baseTemplate = getHandlebarsTemplate( 'base.html' );
  let parentComponentTemplate = getHandlebarsTemplate( 'parentComponent.html' );
  let singleComponentTemplate = getHandlebarsTemplate( 'singleComponent.html' );
  let contentHTML = '';

  // get list of files in all doc/ directories, excluding binder (can be async)
  let repos = new Set( Object.keys( data ).map( item => item.split( '/' )[0] ) );
  let documentPaths = flatten( [ ...repos ].map( getFullDocPaths ) );

  let mdData = {};
  for ( let docPath of documentPaths ) {
    let name = path.basename( docPath, '.md' );
    mdData[ name ] = processFile( docPath );
  }

  let parentComponents = Object.values( mdData ).filter( component => component.data.parent );
  parentComponents.sort( (a,b) => a.data.order - b.data.order );

  // loop over each parent component
  for ( let parent of parentComponents ) {
      let componentsHTML = '';

      for ( const component of parent.data.components ) {
        const key = `${parent.repo}/${component}`;
        const sims = data[ key ];
        const simCount = sims ? Object.keys( sims ).length : 0;
        let markdown = mdData[ component ] ? mdData[ component ].content : `<p>No markdown content for ${component} yet.</p>`;
        markdown = new handlebars.SafeString( markdown );
        const componentContext = {
          component,
          sims,
          simCount,
          markdown,
          repo: parent.repo
        };

        componentsHTML += singleComponentTemplate( componentContext );
      }

      contentHTML += parentComponentTemplate( {
        content: new handlebars.SafeString( parent.content ),
        title: parent.data.title,
        id: parent.data.category,
        componentsHTML: new handlebars.SafeString( componentsHTML )
      } );
  }

  return baseTemplate( { content: contentHTML, parents: parentComponents.map( p => {
    var retObj = p.data;
    retObj.repo = p.repo;
    return retObj;
  } ) } );
};

// handlebars helper functions

handlebars.registerHelper( 'componentLink', ( repo, component ) => {
  return new handlebars.SafeString(
    `<a href="https://github.com/phetsims/${repo}/blob/master/js/${component}.js">Source Code and Options</a>`
  );
} );

handlebars.registerHelper( 'navList', (components, repo) => {
  let itemsHTML = components.map( c => `<li><a href="#${repo}-${c}">${c}</a></li>` ).join('\n');
  return '<ul class="nav bd-sidenav">' + itemsHTML + '</ul>';
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
