/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log    = require( './helper/log' ).logger
const axios  = require( 'axios' )

exports: module.exports = { 
  initDB,
  registerPod
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

async function registerPod( podId, cfg ) {
  try {
    let appURL = cfg.LOWCODE_DB_API_URL +'/entity/'+ cfg.LOWCODE_DB_ROOTSCOPE + '/lowcode-integrator/0.1.0'
    let dtaUrl = appURL + '/LCI-Service'
    log.info( 'INIT POD', dtaUrl )

    let podList = await axios.get( dtaUrl, HEADERS )
    for ( let uid in podList.data ) {
      if (  podList.data[ uid ].PodId == podId ) {
        log.info( 'INIT POD: already registered', uid )
        return uid
      }
    }

    let podRec = { 
      PodId  : podId,
      Mode   : cfg.POD_MODE,
      ApiUrl : cfg.POD_URL,
      State  : 'Initialized'
    }

    let result = await axios.post( dtaUrl, podRec, HEADERS )
    log.info( 'REGISTER POD', result.data )
    return result.data.id

  } catch ( exc ) {
    log.warn( 'INIT POD', exc.message )
    process.exit()
  }
}

// ============================================================================

const APP = {
  "scopeId": null,
  "title": "LowCode Async Integrator",
  "enabled": true,
  "require": {},
  "entity": {
    "LCI-Service": {
      "title": "Integrator Service",
      "scope": "inherit",
      "maintainer": [
        "appUser"
      ],
      "properties": {
        "id": {
          "type": "UUID"
        },
        "Mode": {
          "type": "String"
        },
        "PodId": {
          "type": "String"
        },
        "ApiUrl": {
          "type": "String"
        },
        "State": {
          "type": "String"
        }
      },
      "noDelete": true,
      "noEdit": true
    },
    "LCI-Adapter": {
      "title": "Adapter",
      "scope": "inherit",
      "maintainer": [
        "appUser"
      ],
      "properties": {
        "id": {
          "type": "UUID",
          "noDelete": true,
          "noEdit": true
        },
        "AdapterName": {
          "label": "Adapter Name",
          "type": "String",
          "noEdit": true,
          "noDelete": true
        },
        "PodId": {
          "label": "Pod Id",
          "type": "String",
          "noEdit": true,
          "noDelete": true
        },
        "DataInput": {
          "type": "SelectRef",
          "noEdit": true,
          "noDelete": true,
          "selectRef": "2095/lowcode-integrator/0.1.0/LCI-Resource",
          "label": "Data Input"
        },
        "Code": {
          "label": "Code",
          "type": "Text",
          "noEdit": true,
          "noDelete": true,
          "lines": 3
        },
        "DataOutput": {
          "label": "Data Output",
          "type": "SelectRef",
          "noEdit": true,
          "noDelete": true,
          "selectRef": "2095/lowcode-integrator/0.1.0/LCI-Resource"
        }
      },
      "noDelete": true,
      "noEdit": true
    },
    "LCI-Resource": {
      "title": "Resource",
      "scope": "inherit",
      "maintainer": [
        "appUser"
      ],
      "properties": {
        "id": {
          "type": "UUID",
          "noDelete": true,
          "noEdit": true
        },
        "ResourceType": {
          "label": "Resource Type",
          "type": "Select",
          "noEdit": true,
          "noDelete": true,
          "options": [
            "RMQ-Queue",
            "HTTP-API-Endpoint",
            "AzureEventHub",
            "Kafka"
          ],
          "colWidth": "S"
        },
        "Credentials": {
          "label": "Credentials",
          "type": "JSON",
          "colWidth": "L",
          "noEdit": true,
          "noDelete": true
        },
        "Meta": {
          "label": "Meta",
          "type": "JSON",
          "colWidth": "L",
          "noEdit": true,
          "noDelete": true
        },
        "URI": {
          "label": "URI",
          "type": "String",
          "colWidth": "L",
          "noEdit": true,
          "noDelete": true
        }
      },
      "noDelete": true,
      "noEdit": true
    }
  },
  "startPage": [
    "LCI-Service",
    "LCI-Adapter",
    "LCI-Resource"
  ],
  "role": [
    "appUser"
  ],
  "scope": {
  }
}