/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

// This example launches the Low-Code-App in standalone mode.
// ... see "app-embedded.js" how to use it embedded with in your app.

let lowCodePod = require( '../app/index' ) 
// let lowCodeApp = require( 'lowcode-data-app' ) // ... when using the npm package

lowCodePod.init({
  POD_MODE : 'MANAGER',
  POD_PORT : 8889,
  POD_URL_PATH : 'pod-mgr',
  POD_GUI_URL : 'http://localhost:8889/pod-mgr',
  LOWCODE_DB_API_URL  : 'http://localhost:8888/app/adapter',
  LOWCODE_DB_ROOTSCOPE  : 'chang_me',
  LOWCODE_DB_API_ID  : 'change_me',
  LOWCODE_DB_API_KEY : 'change_me'
})