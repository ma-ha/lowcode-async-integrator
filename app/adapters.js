const log     = require( './helper/log' ).logger

exports: module.exports = {
  getInIcons,
  getOutIcons,
  getFormCfg,
  getInSign,
  getOutSign,
}

// --------------------------------------------------------------------------

const IO_OPTS = {
  "RabbitMQ Queue": { label: 'RabbitMQ<br>Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Queue", label: "Queue Name", type: "text" },
    ],
    inSignature : 'message, messageId',
    outSignature : 'await sendToQueue( message, correlationId )'
  },
  "Azure EH": { label: 'Azure<br>Event Hub', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "aze_ConnStr", label: "Event Hub Connection String", type: "text" },
    ],
    inSignature : 'event',
    outSignature : 'await sendEvent( event )'
  },
  "Azure SB": { label: 'Azure<br>Service Bus Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azsb_ConnStr", label: "Service Bus Connection String", type: "text" },
      { id: "azsb_Queue",   label: "Service Bus Queue", type: "text" },
    ],
    inSignature : 'message, messageId',
    outSignature : 'await sendToQueue( message, correlationId )'
  },
  "HTTP": { label: 'HTTP Endpoint', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "http_BaseURL",   label: "Base URL", type: "text" },
      { id: "http_HeaderKey", label: 'Header authorization "key"', type: "text" }
    ],
    inSignature : 'header, param, query, body',
    outSignature : 'await sendHttp( method, path, query, body )'
  }
}

const IN_OPTS = {
  "RabbitMQ Subscribtion": { label: 'RabbitMQ<br>Subscription', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Topic", label: "AMQP Topic", type: "text" },
    ],
    inSignature : '',
  },
}

const OUT_OPTS = {
  "RabbitMQ Topic": { label: 'RabbitMQ<br>Topic', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Topic", label: "AMQP Topic", type: "text" },
    ],
    outSignature : 'await sendToTopic( message )'
  },
  "LowCode DB": { label: 'Low Code DB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "lcDB_ScopeId",  label: "Scope ID", type: "text" },
      { id: "lcDB_AppId",    label: "App ID", type: "text" },
      { id: "lcDB_AppVer",   label: "App Version", type: "text" },
      { id: "lcDB_EntityId", label: "Entity ID", type: "text" },
    ],
    outSignature : 'await storeDB( recId, data )'
  },
  "Azure BLOB": { label: 'Azure<br>Storage BLOB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azb_ConnStr",  label: "Storage Connection String", type: "text" }
    ],
    outSignature : 'await storeBLOB( container, data )'
  },
  "InfluxDB": { label: 'InfluxDB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "influxURL",  label: "InfluxDB URL", type: "text" },
    ],
    outSignature : 'await storeTimeSeriesData( timestamp, key, value )'
  },
  "HTTP OAuth": { label: 'HTTP Endpoint with OAuth', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "http_BaseURL",  label: "Base URL", type: "text" },
      { id: "http_OAuthId",  label: "Auth ID",  type: "text" },
      { id: "http_OAuthKey", label: "Auth Key", type: "text" }
    ],
    outSignature : 'await sendHttp( method, path, query, body )'
  }
}

// --------------------------------------------------------------------------

function getInSign( typeId ) {
  if ( IO_OPTS[ typeId ] ) { return IO_OPTS[ typeId ].inSignature }
  if ( IN_OPTS[ typeId ] ) { return IO_OPTS[ typeId ].inSignature }
  return ''
}

function getOutSign( typeId ) {
  if ( IO_OPTS[ typeId ]  ) { return IO_OPTS[ typeId ].outSignature }
  if ( OUT_OPTS[ typeId ] ) { return IO_OPTS[ typeId ].outSignature }
  return ''
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
      let cFld = JSON.parse( JSON.stringify( fld ))
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
  return getIcons( adapterId, 'Input', IO_OPTS, IN_OPTS )
}


function getOutIcons( adapterId ) {
  return  getIcons( adapterId, 'Output', IO_OPTS, OUT_OPTS )
}


function getIcons( adapterId, direct, opMap1, optMap2 ) {
  let icons = []
  for ( let optId in opMap1 ) {
    let opt = opMap1[ optId ]
    icons.push({ 
      id     : optId, 
      label  : opt.label, 
      img    : opt.icon,
      layout : 'ConfigureIO-nonav&id='+direct+','+ optId +','+ adapterId
    })
  }
  for ( let optId in optMap2 ) {
    let opt = optMap2[ optId ]
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

