// Copyright 2019, University of Colorado Boulder

/**
 * PhET Binder Index Page
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './index.less';

export default class IndexPage extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {};
  }

  render() {

    return (
      <div id='index-page'>
        <h1>Hello World</h1>
      </div>
    );
  }
}