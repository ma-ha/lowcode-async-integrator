/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log    = require( './helper/log' ).logger
const axios  = require( 'axios' )

exports: module.exports = { 
  initDB,
  registerPod
}

let HEADERS = null
let SVC_DB_URL = ''
let ADAPTER_DB_URL = ''

async function initDB( cfg ) {
  HEADERS = { headers: { 
    'app-id'     : cfg.LOWCODE_DB_API_ID,
    'app-secret' : cfg.LOWCODE_DB_API_KEY
  }}
  let appURL = cfg.LOWCODE_DB_API_URL +'/entity/'+ cfg.LOWCODE_DB_ROOTSCOPE + '/lowcode-integrator/0.1.0'
  SVC_DB_URL = appURL + '/LCI-Service'
  ADAPTER_DB_URL = appURL + '/LCI-Adapter'

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

      result = await axios.post( 
        cfg.LOWCODE_DB_API_URL +'/state/'+ cfg.LOWCODE_DB_ROOTSCOPE + '/LCI-Adapter-Status', 
        ADAPTER_STATE_MODEL, 
        HEADERS 
        )
      log.info( 'INIT DB create adapter state model', result.status, result.statusText )

    } 

  } catch ( exc ) {
    log.warn( 'INIT DB', exc.message )
    process.exit()
  }
}

// ============================================================================

async function registerPod( podId, podMode, podURL ) {
  try {
    log.info( 'INIT POD', SVC_DB_URL )
    let podList = await axios.get( SVC_DB_URL, HEADERS )
    for ( let uid in podList.data ) {
      if (  podList.data[ uid ].PodId == podId ) {
        log.info( 'INIT POD: already registered', uid )
        return uid
      }
    }

    let podRec = { 
      PodId  : podId,
      Mode   : podMode,
      ApiUrl : podURL,
      State  : 'Initialized'
    }

    let result = await axios.post( SVC_DB_URL, podRec, HEADERS )
    log.info( 'REGISTER POD', result.data )

    if ( podMode == 'ADAPTER' ) {
      let registerURL =  ADAPTER_DB_URL+'/state/null/Register'
      log.info( 'REGISTER ADAPTER', registerURL )
      let adapterRec = { 
        AdapterName  : podId,
        PodId : podId
      }
      let result2 = await axios.post( registerURL, adapterRec, HEADERS )
      log.info( 'REGISTER ADAPTER', result2.data )
    }
    return result.data.id

  } catch ( exc ) {
    log.warn( 'INIT POD', exc.message )
    if ( podMode == 'MANAGER' ) { process.exit() }
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
          "noDelete": true,
          "stateTransition": {
            "null_Register": true
          }
        },
        "PodId": {
          "label": "Pod Id",
          "type": "String",
          "noEdit": true,
          "noDelete": true,
          "stateTransition": {
            "null_Register": true
          }
        },
        "DataInput": {
          "type": "SelectRef",
          "noEdit": true,
          "noDelete": true,
          "selectRef": "2095/lowcode-integrator/0.1.0/LCI-Resource",
          "label": "Data Input",
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        },
        "Code": {
          "label": "Code",
          "type": "Text",
          "noEdit": true,
          "noDelete": true,
          "lines": 3,
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        },
        "DataOutput": {
          "label": "Data Output",
          "type": "SelectRef",
          "noEdit": true,
          "noDelete": true,
          "selectRef": "2095/lowcode-integrator/0.1.0/LCI-Resource",
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        }
      },
      "noDelete": true,
      "noEdit": true,
      "stateModel": "LCI-Adapter-Status",
      "stateTransition": {}
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

const ADAPTER_STATE_MODEL =  {
  "id": "2095/LCI-Adapter-Status",
  "scopeId": "2095",
  "state": {
    "null": {
      "actions": {
        "Register": {
          "to": "ConfigPending",
          "label": "Register",
          "apiManaged": true
        }
      }
    },
    "ConfigPending": {
      "actions": {
        "Start": {
          "to": "Started",
          "label": "Start",
          "apiManaged": true
        },
        "Configure": {
          "to": "ConfigPending",
          "label": "Configure",
          "apiManaged": true,
          "line": [
            {
              "x": 500,
              "y": 100
            },
            {
              "x": 500,
              "y": 150
            },
            {
              "x": 400,
              "y": 150
            }
          ],
          "labelPos": {
            "x": 420,
            "y": 150
          }
        }
      },
      "label": "Config Pending",
      "x": 400,
      "y": 100
    },
    "Started": {
      "actions": {
        "Stop": {
          "to": "Stopped",
          "label": "Stop",
          "apiManaged": true
        }
      },
      "x": 700,
      "y": 100,
      "label": "Started"
    },
    "Stopped": {
      "actions": {
        "Restart": {
          "to": "Started",
          "label": "Restart",
          "line": [
            {
              "x": 1000,
              "y": 150
            },
            {
              "x": 700,
              "y": 150
            }
          ],
          "apiManaged": true,
          "labelPos": {
            "x": 870,
            "y": 150
          }
        },
        "Reconfigure": {
          "to": "ConfigPending",
          "label": "Reconfigure",
          "line": [
            {
              "x": 1000,
              "y": 200
            },
            {
              "x": 400,
              "y": 200
            }
          ],
          "labelPos": {
            "x": 870,
            "y": 200
          },
          "apiManaged": true
        }
      },
      "x": 1000,
      "y": 100,
      "label": "Stopped"
    }
  }
}