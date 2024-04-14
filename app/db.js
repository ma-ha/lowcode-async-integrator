/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log    = require( './helper/log' ).logger
const axios  = require( 'axios' )

exports: module.exports = { 
  initDB
}

let HEADERS = null

async function initDB( cfg ) {
  HEADERS = { headers: { 
    'app-id'     : cfg.LOWCODE_DB_API_ID,
    'app-secret' : cfg.LOWCODE_DB_API_KEY
  }}
  
  await prepareDbApp( cfg )
}

// ============================================================================

async function prepareDbApp( cfg ) {
  try {
    let appURL = cfg.LOWCODE_DB_API_URL +'/app/'+ cfg.LOWCODE_DB_ROOTSCOPE + '/lowcode-integrator/0.1.0'

    log.info( 'INIT DB APP', appURL )
    let creApp = true
    try {
      let appExists = await axios.get( appURL, HEADERS )
      log.debug( 'INIT DB APP: GET',  appExists.status, appExists.statusText  )
      creApp = false
    } catch ( exc ) { log.info( 'INIT DB APP: already exists') }
    
    if ( creApp) { 
      log.info( 'INIT DB APP: POST', appURL )
      APP.scopeId =  cfg.LOWCODE_DB_ROOTSCOPE
      let result = await axios.post( appURL, APP, HEADERS )
      log.info( 'INIT DB create app', result.status, result.statusText )
    } 

  } catch ( exc ) {
    log.warn( 'INIT DB', exc.message )
    process.exit()
  }
}

// ============================================================================

const APP = {
  "scopeId": null,
  "title": "LowCode Async Integrator",
  "enabled": true,
  "require": {
  },
  "entity": {
    "LcIntegratorService": {
      "title": "Integrator Service",
      "scope": "inherit",
      "maintainer": [
      ],
      "properties": {
        "id": {
          "type": "UUID"
        },
        "Role": {
          "type": "String"
        },
        "ApiUrl": {
          "type": "String"
        }
      },
      "noEdit": true
    }
  },
  "startPage": "LcIntegratorService",
  "role": [
    "appUser"
  ],
  "scope": {
  }
}