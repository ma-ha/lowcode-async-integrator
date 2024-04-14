/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

let lowCodePod = require( '../adapter/index' ) 
// let lowCodeApp = require( 'lowcode-integration-adapter' ) // ... when using the npm package

lowCodePod.init(
  'My-First-Adapter',
  {
    POD_MODE : 'ADAPTER',
    POD_PORT : 8890,
    POD_URL_PATH : 'lci-adapter',
    POD_URL : 'http://localhost:8890/lci-adapter',
    MANAGER_URL : 'http://localhost:8889/pod-mgr',
    CLUSTER_KEY: 'secret'
  }
)