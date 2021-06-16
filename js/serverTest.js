[object Promise]

'use strict';

const assert = require( 'assert' );
const buildLocal = require( '../../perennial/js/common/buildLocal' );
const http = require( 'http' );

const url = buildLocal.localTestingURL;

http.get( url, res => {
  assert( res.statusCode === 200, `ERROR: Bad response from ${url}` );
  console.log( 'SUCCESS:', 'Server properly configured.' );
} );