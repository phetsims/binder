// Copyright 2019, University of Colorado Boulder

/**
 * Displays a list of sims, each of which can be expanded to list the common components that the sim uses.
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './common.css';

export default class ComponentsBySim extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      // eslint-disable-next-line react/prop-types
      sims: props.sims
    };
  }

  createSimList() {
    const sims = this.state.sims;
    const simList = [];

    for ( const key in sims ) {
      const sim = sims[ key ];
      const simName = <h3>{sim.name}</h3>;

      const components = sim.components;
      const componentList = [];

      components.forEach( component => {
        const componentName = <p>{component}</p>;
        componentList.push( componentName );
      } );

      simList.push( simName );
      simList.push( componentList );
    }

    return simList;
  }

  render() {
    return ( this.createSimList() );
  }
}