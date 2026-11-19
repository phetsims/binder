// Copyright 2026, University of Colorado Boulder

/**
 * Finds where each repo is in a totality checkout. Totality groups its repos two levels below projects/, such as
 * projects/simstack/sims/friction and projects/scenerystack/src/sun.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

const fs = require( 'fs' );
const path = require( 'path' );

// Lists the names of the directories directly inside a directory.
const getSubdirectories = directory => fs.readdirSync( directory, { withFileTypes: true } )
  .filter( entry => entry.isDirectory() && !entry.name.startsWith( '.' ) && entry.name !== 'node_modules' )
  .map( entry => entry.name );

/**
 * @param {string} totalityPath - the root of the totality checkout
 * @returns {Object.<string,string>} - where each repo is, relative to the totality checkout, keyed by its name
 */
module.exports = totalityPath => {
  const projectsPath = path.join( totalityPath, 'projects' );
  const repoLocations = {};
  getSubdirectories( projectsPath ).forEach( project => {
    getSubdirectories( path.join( projectsPath, project ) ).forEach( group => {
      getSubdirectories( path.join( projectsPath, project, group ) ).forEach( repo => {
        repoLocations[ repo ] = `projects/${project}/${group}/${repo}`;
      } );
    } );
  } );
  return repoLocations;
};
