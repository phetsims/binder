// Copyright 2019, University of Colorado Boulder

/**
 * Displays a list of common components, each of which can be expanded to list the sims that the component uses.
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './common.css';

export default class SimsByComponent extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      // eslint-disable-next-line react/prop-types
      components: props.components
    };
  }

  createComponentList() {
    const components = this.state.components;
    const componentList = [];

    components.forEach( component => {
      const componentName = <h3>{component.name}</h3>;

      const sims = component.sims;
      const simList = [];

      sims.forEach( sim => {
        const simName = <p>{sim}</p>;
        simList.push( simName );
      } );

      componentList.push( componentName );
      componentList.push( simList );
    } );

    return componentList;
  }

  render() {
    return ( this.createComponentList() );
  }
}