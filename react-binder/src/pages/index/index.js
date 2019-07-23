// Copyright 2019, University of Colorado Boulder

/**
 * PhET Binder Index Page
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './index.css';

export default class IndexPage extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      selectedButtonId: 'simsByComponent',
      selectedPage: <h1>sims page</h1>,
      simsByComponent: <h1>sims page</h1>,
      componentsBySim: <h1>components page</h1>
    };
  }

  selectClass( buttonId ) {
    return this.state.selectedButtonId === buttonId ? 'selected' : '';
  }

  selectPage( buttonId ) {
    this.setState( {
      selectedButtonId: buttonId,
      selectedPage: this.state[ buttonId ]
    } );
  }

  render() {

    const NavButton = props => {
      return <button className={`nav-button ${this.selectClass( props.id )}`}
                     onClick={() => this.selectPage( props.id )}>
        {props.label}
      </button>
    };

    return (
      <div id='index-page'>

        <div id='side-nav'>

          <div className='title-container'>
            <img src='/img/phet.png' className='title-image' alt='PhET'/>
            <h1 className='title-text'>Binder</h1>
          </div>

          <div className='nav-buttons'>
            <NavButton id='simsByComponent' label='SIMS BY COMPONENT'/>
            <NavButton id='componentsBySim' label='COMPONENTS BY SIM'/>
          </div>

        </div>

        <div id='selected-page'>
          {this.state.selectedPage}
        </div>

      </div>
    );
  }
}