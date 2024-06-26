/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log    = require( './helper/log' ).logger
const axios  = require( 'axios' )

exports: module.exports = { 
  initDB,
  registerPod,
  getServices,
  getServiceById,
  addAdapter,
  getAdapter,
  saveAdapter,
  changeAdapterStatus
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
  WORKER_DB_URL = appURL + '/LCI-ServiceWorker'

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

async function registerPod( serviceId, mode, callbackURL, workerId ) {
  try {
    log.info( 'INIT POD', SVC_DB_URL )
    let needRegister = true
    let podList = await axios.get( SVC_DB_URL, HEADERS )
    for ( let uid in podList.data ) {  
      if ( podList.data[ uid ].ServiceId == serviceId ) {
        log.info( 'INIT Service: already registered', uid )
        needRegister = false
        break
      } 
    }
    if ( needRegister ) {
      let podRec = { 
        ServiceId : serviceId,
        Mode      : mode,
        ApiUrl    : callbackURL,
        State     : 'Initialized',
      }
  
      let result = await axios.post( SVC_DB_URL, podRec, HEADERS )
      log.info( 'REGISTER POD', result.data )
    }

    if ( mode == 'ADAPTER' ) {
      let workerRec = { 
        ServiceId : serviceId,
        WorkerId  : workerId,
        LastPing  : Date.now()
      }
      log.info( 'INIT POD workerRec', workerRec )
      let result2 = await axios.post( WORKER_DB_URL, workerRec, HEADERS )
      log.info( 'REGISTER WORKER', result2.data ) 
    }

  } catch ( exc ) {
    log.warn( 'INIT POD', exc.message )
    if ( mode == 'MANAGER' ) { process.exit() }
  }
}

// ----------------------------------------------------------------------------

async function addAdapter( serviceId, adapterName ) {
  try {
    let registerURL =  ADAPTER_DB_URL+'/state/null/Register'
    log.info( 'ADD ADAPTER', registerURL )
    let service = await axios.get( SVC_DB_URL +'/'+ serviceId, HEADERS )
    if ( ! service ) { return { error: 'Service not found'} }
    let adapterMap = await axios.get( ADAPTER_DB_URL, HEADERS )
    for ( let adapterId in adapterMap.data ) {
      let a = adapterMap.data[ adapterId ]
      if ( a.AdapterName == adapterName  && a.ServiceId == serviceId ) {
        return { error: 'Name must be unique per service!' }
      }
    }
    log.info( 'ADD ADAPTER service', service.data )
    let adapterRec = { 
        AdapterName  : adapterName,
        ServiceId    : serviceId,
        ServiceName  : service.data.ServiceId,
        StateSince   : getDateStr()
    }
    log.info( 'ADD ADAPTER adapterRec', adapterRec )
    let result = await axios.post( registerURL, adapterRec, HEADERS )
    log.info( 'ADD ADAPTER', result.data )
    return { status: 'OK', id: result.data.id }
  } catch ( exc ) {
    log.info( 'ADD ADAPTER', exc.message )
    return { error:  exc.message }
  }
}

async function changeAdapterStatus( id, state, action ) {
  try {
    let url =  ADAPTER_DB_URL+'/state/'+state+'/'+action
    log.info( 'changeAdapterStatus', url, )
    let result = await axios.post( url, { id: id, StateSince: getDateStr() }, HEADERS )
    log.info( 'changeAdapterStatus', result.data )
    return result.data      
  } catch ( exc ) {
    log.warn( 'changeAdapterStatus', exc.message )
    return { error: exc.message }
    
  }
}


function getDateStr() {
  let dt = new Date()
  let str = dt.toISOString()
  return str.substring( 0, 16 ).replace( 'T', ' ' )
}

// ----------------------------------------------------------------------------

async function getServices( ) {
  let svcList = await axios.get( SVC_DB_URL, HEADERS )
  return svcList.data
}

async function getServiceById( id ) {
  let svcList = await axios.get( SVC_DB_URL+'/'+id, HEADERS )
  return svcList.data
}

// ============================================================================

async function getAdapter( adapterId, filter ) {
  try {
    if ( adapterId ) {
      let adapterResult = await axios.get( ADAPTER_DB_URL+'/'+adapterId, HEADERS )
      return adapterResult.data

    } else {
      let adapterResult = await axios.get( ADAPTER_DB_URL, HEADERS )
      log.debug( 'adapterResult', adapterResult.data )
      if ( filter ) {
        log.debug( 'filter', filter )
        let result = {}
        for ( let id in adapterResult.data ) {
          log.debug( 'id', id, adapterResult.data[id] )

          let idOk = false
          for ( let fld in filter ) try {
            log.debug( 'filter fld', fld )
            if ( adapterResult.data[id][fld].toLowerCase().indexOf( filter[fld].toLowerCase() ) >= 0 ) {
              idOk = true
              break
            }
          } catch (exc) { log.warn( exc.message ) }
          if ( idOk ) {
            result[ id ] = adapterResult.data[ id ]
          }
        }
        return result
      } else {
        return adapterResult.data
      }
      
    }

  } catch ( exc ) {
    log.warn( 'INIT POD', exc.message )
    if ( podMode == 'MANAGER' ) { process.exit() }
  }
}

async function saveAdapter( adapter ) {
  let adapterResult = await axios.put( ADAPTER_DB_URL+'/'+adapter.id, adapter, HEADERS )
  log.debug( 'saveAdapter', adapterResult.data )
  return adapterResult
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
        "DataInputType": {
          "label": "Data Input",
          "type": "String",
          "noEdit": true,
          "noDelete": true,
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        },
        "DataOutputName": {
          "label": "Data Output Name",
          "type": "String",
          "noEdit": true,
          "noDelete": true,
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        },
        "DataInput": {
          "type": "JSON",
          "noEdit": true,
          "noDelete": true,
          "selectRef": "2095/lowcode-integrator/0.1.0/LCI-Resource",
          "label": "Data Input",
          "stateTransition": {
            "ConfigPending_Configure": true
          },
          "noTable": true
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
        "DataOutputType": {
          "label": "Data Output",
          "type": "String",
          "noEdit": true,
          "noDelete": true,
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        },
        "DataInputName": {
          "label": "Data Input Name",
          "type": "String",
          "noEdit": true,
          "noDelete": true,
          "stateTransition": {
            "ConfigPending_Configure": true
          }
        },
        "DataOutput": {
          "label": "Data Output",
          "type": "JSON",
          "noEdit": true,
          "noDelete": true,
          "selectRef": "2095/lowcode-integrator/0.1.0/LCI-Resource",
          "stateTransition": {
            "ConfigPending_Configure": true
          },
          "noTable": true
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