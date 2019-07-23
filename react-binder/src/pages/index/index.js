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
      currentPage: <h1></h1>,
      simsPage: <h1>sims page</h1>,
      componentsPage: <h1>components page</h1>
    };
  }

  loadPage( pageToLoad ) {
    this.setState( {
      currentPage: pageToLoad
    } );
  }

  render() {

    return (
      <div id='index-page'>
        <div id='side-nav'>
          <div className='title-container'>
            <img src='/img/phet.png' className='title-image' alt='PhET'/>
            <h1 className='title-text'>Binder</h1>
          </div>
          <div className='nav-buttons'>
            <button className='nav-button' onClick={() => this.loadPage( this.state.simsPage )}>
              SIMS BY COMPONENT
            </button>
            <button className='nav-button' onClick={() => this.loadPage( this.state.componentsPage )}>
              COMPONENTS BY SIM
            </button>
          </div>
        </div>
        <div id='sub-page'>
          {this.state.currentPage}
        </div>
      </div>
    );
  }
}