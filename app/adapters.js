const log     = require( './helper/log' ).logger

exports: module.exports = {
  getInIcons,
  getOutIcons,
  getFormCfg
}

// --------------------------------------------------------------------------

const IO_OPTS = {
  RMQQ: { label: 'RabbitMQ<br>Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Queue", label: "Queue Name", type: "text" },
    ]
  },
  AzureEH: { label: 'Azure<br>Event Hub', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "aze_ConnStr", label: "Event Hub Connection String", type: "text" },
    ] 
  },
  AzureSB: { label: 'Azure<br>Service Bus Queue', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azsb_ConnStr", label: "Service Bus Connection String", type: "text" },
      { id: "azsb_Queue",   label: "Service Bus Queue", type: "text" },
    ] 
  },
  HTTP: { label: 'HTTP Endpoint', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "http_BaseURL",   label: "Base URL", type: "text" },
      { id: "http_HeaderKey", label: 'Header authorization "key"', type: "text" }
    ] 
  }
}

const IN_OPTS = {
  RMQS: { label: 'RabbitMQ<br>Subscription', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Topic", label: "AMQP Topic", type: "text" },
    ] 
  },
}

const OUT_OPTS = {
  RMQT: { label: 'RabbitMQ<br>Topic', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "rmq_URL",   label: "AMQP URL", type: "text" },
      { id: "rmq_Topic", label: "AMQP Topic", type: "text" },
    ] 
  },
  LCDB: { label: 'Low Code DB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "lcDB_ScopeId",  label: "Scope ID", type: "text" },
      { id: "lcDB_AppId",    label: "App ID", type: "text" },
      { id: "lcDB_AppVer",   label: "App Version", type: "text" },
      { id: "lcDB_EntityId", label: "Entity ID", type: "text" },
    ] 
  },
  AzureBLOB: { label: 'Azure<br>Storage BLOB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "azb_ConnStr",  label: "Storage Connection String", type: "text" }
    ] 
  },
  InfluxDB: { label: 'InfluxDB', icon: 'img/k8s-ww-conn.png',
    formFields : [
      { id: "influxURL",  label: "InfluxDB URL", type: "text" },
    ] 
  },
}

// --------------------------------------------------------------------------

function getFormCfg( adapterId ) {
  log.info( 'getFormCfg', adapterId)
  function genFromCfg( adapterCfg ) {
    log.info( 'genFromCfg', adapterCfg )
    return {
      label      : adapterCfg.label.replace('<br>',' '),
      formFields : adapterCfg.formFields
    } 
  }
  if ( IO_OPTS[ adapterId ]  ) { return genFromCfg( IO_OPTS[ adapterId ] ) }
  if ( IN_OPTS[ adapterId ]  ) { return genFromCfg( IN_OPTS[ adapterId ] ) }
  if ( OUT_OPTS[ adapterId ] ) { return genFromCfg( OUT_OPTS[ adapterId ] ) }
  return null
}

// --------------------------------------------------------------------------

function getInIcons( adapterId ) {
  return getIcons( adapterId, IO_OPTS, IN_OPTS )
}


function getOutIcons( adapterId ) {
  return  getIcons( adapterId, IO_OPTS, OUT_OPTS )
}


function getIcons( adapterId, opMap1, optMap2 ) {
  let icons = []
  for ( let optId in opMap1 ) {
    let opt = opMap1[ optId ]
    icons.push({ 
      id     : optId, 
      label  : opt.label, 
      img    : opt.icon,
      layout : 'ConfigureIO-nonav&id=input,'+ optId +','+ adapterId
    })
  }
  for ( let optId in optMap2 ) {
    let opt = optMap2[ optId ]
    icons.push({ 
      id     : optId, 
      label  : opt.label, 
      img    : opt.icon,
      layout : 'ConfigureIO-nonav&id=input,'+ optId +','+ adapterId
    })
  }
  icons.sort( ( a, b ) => { if ( a.label > b.label ) { return 1 } else { return -1} })
  return icons
}

