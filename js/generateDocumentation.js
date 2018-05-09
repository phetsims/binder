// const puppeteer = require( 'puppeteer' );
//
// ( async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//
//   // TODO: get the list of sims
//
//   // TODO: add a query parameter that directs it to include the screen captures
//   await page.goto( 'http://localhost/acid-base-solutions/acid-base-solutions_en.html?brand=phet&ea&postMessageOnLoad' );
//
//   // Get the "viewport" of the page, as reported by the page.
//   const dimensions = await page.evaluate( () => {
//     return {
//       width: document.documentElement.clientWidth,
//       height: document.documentElement.clientHeight,
//       deviceScaleFactor: window.devicePixelRatio,
//       phet: phet
//     };
//   } );
//
//   console.log( 'Dimensions:', dimensions );
//
//   await browser.close();
// } )();

'use strict';

const puppeteer = require( 'puppeteer' );

( async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Define a window.onCustomEvent function on the page.
  // await page.exposeFunction('onCustomEvent', e => {
  //   console.log(`${e.type} fired`, e.detail || '');
  // });

  await page.evaluateOnNewDocument( function() {
    console.log( 'hello 1' );
    window.addEventListener( 'message', function( a ) {
      console.log( 'hello from a' );
    } );
  } );

  await page.goto( 'http://localhost/acid-base-solutions/acid-base-solutions_en.html?brand=phet&ea&postMessageOnLoad', { waitUntil: 'networkidle2' } );

  // await browser.close();
} )();