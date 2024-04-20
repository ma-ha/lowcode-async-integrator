const log    = require( './helper/log' ).logger
const axios  = require( 'axios' )

exports: module.exports = {
  init,
  stopAdapter,
  startAdapter,
  getInIcons,
  getOutIcons,
  getFormCfg,
  getInSign,
  getOutSign,
  getPlugin
}


let HEADERS = null

async function init( cfg ) {
  HEADERS = { headers: { 
    'cluster_key' : cfg.CLUSTER_KEY
  }}
}

async function stopAdapter( serviceURL, adapterId ) {
  try {
    let url = serviceURL+'/adapter/stop/'+adapterId
    log.info( 'stopAdapter', url, )
    let result = await axios.post( url, { id: adapterId }, HEADERS )
    log.info( 'stopAdapter', result.data )
    return result.data      
  } catch ( exc ) {
    log.warn( 'stopAdapter', exc.message )
    return { error: exc.message }
  }
}

async function startAdapter( serviceURL, adapterId ) {
  try {
    let url = serviceURL+'/adapter/stop/'+adapterId
    log.info( 'startAdapter', url, )
    let result = await axios.post( url, { id: adapterId }, HEADERS )
    log.info( 'startAdapter', result.data )
    return result.data      
  } catch ( exc ) {
    log.warn( 'startAdapter', exc.message )
    return { error: exc.message }
  }
}

// --------------------------------------------------------------------------

const IO_OPTS = {}

const IN_OPTS = {
  "RabbitMQ Queue": { label: 'RabbitMQ<br>Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Queue", label: "Queue Name", type: "text" },
    ],
    signature : 'message, messageId',
    plugin : "rmq-queue"
  },
  "Azure EH": { label: 'Azure<br>Event Hub', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "aze_ConnStr", label: "Event Hub Connection String", type: "text" },
      { id: "aze_EventFilter", label: "Event Filter", type: "text" },
    ],
    signature : 'event',
    plugin : "azure-eh"
  },
  "Azure SB": { label: 'Azure<br>Service Bus Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azsb_ConnStr", label: "Service Bus Connection String", type: "text" },
      { id: "azsb_Queue",   label: "Service Bus Queue", type: "text" },
    ],
    signature : 'message, messageId',
    plugin : "azure-sb"
  },
  "HTTP": { label: 'HTTP Endpoint', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "http_BaseURL",   label: "Base URL", type: "text" },
      { id: "http_HeaderKey", label: 'Header authorization "key"', type: "text" }
    ],
    signature : 'header, param, query, body',
    plugin : "http"
  },
  "RabbitMQ Subscription": { label: 'RabbitMQ<br>Subscription', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Topic", label: "AMQP Topic", type: "text" },
    ],
    signature : 'message, messageId',
    plugin : "rmq-sub"
  },
}


const OUT_OPTS = {
  "RabbitMQ Queue": { label: 'RabbitMQ<br>Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Queue", label: "Queue Name", type: "text" },
    ],
    signature : 'await sendToQueue( message, correlationId )',
    plugin : "rmq-queue"
  },
  "Azure EH": { label: 'Azure<br>Event Hub', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "aze_ConnStr", label: "Event Hub Connection String", type: "text" }
    ],
    signature : 'await sendEvent( event )',
    plugin : "azure-eh"
  },
  "Azure SB": { label: 'Azure<br>Service Bus Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azsb_ConnStr", label: "Service Bus Connection String", type: "text" },
      { id: "azsb_Queue",   label: "Service Bus Queue", type: "text" },
    ],
    signature : 'await sendToQueue( message, correlationId )',
    plugin : "azure-sb"
  },
  "HTTP": { label: 'HTTP Endpoint', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "http_BaseURL",   label: "Base URL", type: "text" },
      { id: "http_HeaderKey", label: 'Header authorization "key"', type: "text" }
    ],
    signature : 'await sendHttp( method, path, query, body )',
    plugin : "http"
  },
  "RabbitMQ Topic": { label: 'RabbitMQ<br>Topic', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Topic", label: "AMQP Topic", type: "text" },
    ],
    signature : 'await sendToTopic( message )',
    plugin : "rmq-topic"
  },
  "LowCode DB": { label: 'Low Code DB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "lcDB_ScopeId",  label: "Scope ID", type: "text" },
      { id: "lcDB_AppId",    label: "App ID", type: "text" },
      { id: "lcDB_AppVer",   label: "App Version", type: "text" },
      { id: "lcDB_EntityId", label: "Entity ID", type: "text" },
    ],
    signature : 'await storeDB( recId, data )',
    plugin : "lowcode-db"
  },
  "Azure BLOB": { label: 'Azure<br>Storage BLOB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azb_ConnStr",  label: "Storage Connection String", type: "text" }
    ],
    signature : 'await storeBLOB( container, data )',
    plugin : "azure-blob"
  },
  "InfluxDB": { label: 'InfluxDB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "influxURL",  label: "InfluxDB URL", type: "text" },
    ],
    signature : 'await storeTimeSeriesData( timestamp, key, value )',
    plugin : "influxdb"
  },
  "HTTP OAuth": { label: 'HTTP Endpoint with OAuth', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "http_BaseURL",  label: "Base URL", type: "text" },
      { id: "http_OAuthId",  label: "Auth ID",  type: "text" },
      { id: "http_OAuthKey", label: "Auth Key", type: "text" }
    ],
    signature : 'await sendHttp( method, path, query, body )',
    plugin : "http-oauth"
  }
}

// --------------------------------------------------------------------------

function getInSign( typeId ) {
  if ( IN_OPTS[ typeId ] ) { return IN_OPTS[ typeId ].signature }
  return ''
}

function getOutSign( typeId ) {
  if ( OUT_OPTS[ typeId ] ) { return OUT_OPTS[ typeId ].signature }
  return ''
}


function getPlugin( typeId, dir ) {
  if ( dir == 'in' ) {
    return IN_OPTS[ typeId ].plugin
  } else {
    return OUT_OPTS[ typeId ].plugin
  }
}
// --------------------------------------------------------------------------

function getFormCfg( adapterId, dbAdapter ) {
  log.info( 'getFormCfg', adapterId)

  function genFromCfg( adapterCfg ) {
    log.info( 'genFromCfg', adapterCfg )
    let cfg = {
      label      : adapterCfg.label.replace('<br>',' '),
      formFields : []
    } 
    for ( let fld of adapterCfg.formFields ) {
      let cFld = JSON.parse( JSON.stringify(  fld ))
      if ( dbAdapter[ fld.id ] ) {
        cFld.defaultVal = dbAdapter[ fld.id ]
      }
      cfg.formFields.push( cFld )
    }
    return cfg
  }

  if ( IO_OPTS[ adapterId ]  ) { return genFromCfg( IO_OPTS[ adapterId ] ) }
  if ( IN_OPTS[ adapterId ]  ) { return genFromCfg( IN_OPTS[ adapterId ] ) }
  if ( OUT_OPTS[ adapterId ] ) { return genFromCfg( OUT_OPTS[ adapterId ] ) }
  return null
}

// --------------------------------------------------------------------------

function getInIcons( adapterId ) {
  return getIcons( adapterId, 'Input', IN_OPTS )
}


function getOutIcons( adapterId ) {
  return  getIcons( adapterId, 'Output', OUT_OPTS )
}


function getIcons( adapterId, direct, optMap ) {
  let icons = []
  for ( let optId in optMap ) {
    let opt = optMap[ optId ]
    icons.push({ 
      id     : optId, 
      label  : opt.label, 
      img    : opt.icon,
      layout : 'ConfigureIO-nonav&id='+direct+','+ optId +','+ adapterId
    })
  }
  icons.sort( ( a, b ) => { if ( a.label > b.label ) { return 1 } else { return -1} })
  return icons
}

