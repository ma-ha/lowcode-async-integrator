/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

// This example launches the Low-Code-App in standalone mode.
// ... see "app-embedded.js" how to use it embedded with in your app.

let lowCodePod = require( './index' ) 
// let lowCodeApp = require( 'lowcode-data-app' ) // ... when using the npm package

lowCodePod.init({
  POD_ROLE : 'MANAGER',
  PORT     : 8889,
  GUI_URL  : 'http://localhost:8888/app/',
  URL_PATH : '/pod-mgr'
})