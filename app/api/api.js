/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log        = require( '../helper/log' ).logger
const apiSec     = require( './api-sec' )
const bodyParser = require( 'body-parser' )

const db         = require( '../db' )
const adapters   = require( '../adapters' )

exports: module.exports = { 
  setupAPI  
}

// ============================================================================
// API:
// now we need to implement the ReST service for /products 
// this should also only be available for authenticated users
let gui = null

async function setupAPI( app, cfg ) {
  log.info( 'Starting API...' )

  adapters.init( cfg )

  let svc = app.getExpress()
  gui = app

  svc.use( bodyParser.urlencoded({  limit: "20mb", extended: false }) )
  svc.use( bodyParser.json({ limit: "20mb" }) )

  //---------------------------------------------------------------------------
  const apiAuthz = apiSec.apiAppAuthz( app )
  const clusterAuthz = apiSec.clusterAuthz( cfg )
  const guiAuthz = apiSec.guiAuthz( cfg   )
  
  svc.get(  '/pod/config', apiAuthz, getConfig )
  svc.post( '/pod/config', apiAuthz, setConfig )
  svc.post( '/pod/register', clusterAuthz, registerPod )

  svc.post( '/pod/start', apiAuthz, startWorker )
  svc.post( '/pod/stop',  apiAuthz, stopWorker )

  svc.get(  '/pod/stats', apiAuthz, getStats )

  svc.get(  '/adapter', guiAuthz, getAdapter )
  svc.post( '/adapter', guiAuthz, addAdapter )
  svc.get(  '/adapter/input/icons',  guiAuthz, getInputIcons )
  svc.get(  '/adapter/output/icons', guiAuthz, getOutputIcons )
  svc.post( '/adapter/input', apiAuthz, setAdapterInput )
  svc.post( '/adapter/output', apiAuthz, setAdapterOutput )
  svc.get(  '/adapter/:id/status/:action', guiAuthz, setAdapterStatus ) // get is simpler as link

  svc.get(  '/adapter/code', guiAuthz, getAdapterCode )
  svc.post( '/adapter/code', apiAuthz, saveAdapterCode )
  svc.get(  '/service/options', guiAuthz, getServiceOptions )

  // svc.delete('/adapter/entity/:scopeId/:entityId', apiAuthz, delCollection )
}

// ----------------------------------------------------------------------------

async function startWorker( req, res ) {
  log.info( 'startWorker...')
  // TODO implement
  res.send({status: 'OK'})
}


async function stopWorker( req, res ) {
  log.info( 'stopWorker...')
  // TODO implement
  res.send({status: 'OK'})
}

// ----------------------------------------------------------------------------

async function registerPod( req, res ) {
  log.info( 'registerPod...', req.body )
  if ( ! req.body.serviceId || ! req.body.workerId || ! req.body.callbackURL ) { 
    return res.status(400).send() 
  }

  let uid = await db.registerPod( 
    req.body.serviceId, 
    'ADAPTER', 
    req.body.callbackURL,
    req.body.workerId
  )

  let adapterMap = getAdapter( null, { ServiceId: req.body.serviceId } )

  let startAdapter = [] 
  for ( let adapterId in adapterMap ) {
    let adapter = adapterMap[ adapterId ]
    if ( adapter._status == 'Started' ) {
      let connDir = ( adapter.DataInputType ? 'in' : 'out' )
      let typeId  = ( adapter.DataInputType ? adapter.DataInputType : adapter.DataOutputType )
      startAdapter.push({
        id      : adapterId,
        connDir : connDir,
        plugin  : adapters.getPlugin( typeId, dir )
      })
    }
  }

  res.send({
    status: 'OK', 
    id: uid,
    startAdapter : startAdapter
  })
}

async function getServiceOptions( req, res ) {
  log.info( 'getServiceOptions...', req.body )
  let scvMap = await db.getServices()
  let svcIdArr = []
  for ( let svcId in scvMap ) {
    let svc = scvMap[ svcId ]
    if ( svc.Mode == 'ADAPTER' && ! svcIdArr.includes( svcId ) ) {
      svcIdArr.push( svcId )
    }
  }
  let options = []
  for ( let svcId of svcIdArr ) {
    options.push({
      id : svcId, 
      svcName : scvMap[ svcId ].ServiceId
    })
  }
  log.info( 'options', options )
  res.send( options )
}


// ----------------------------------------------------------------------------

async function setConfig( req, res ) {
  log.info( 'setConfig...')
  // TODO implement
  res.send({status: 'OK'})
}

async function getConfig( req, res ) {
  log.info( 'getConfig...')
  // TODO implement
  res.send({status: 'OK'})
}

// ----------------------------------------------------------------------------

async function getStats( req, res ) {
  log.info( 'getStats...')
  // TODO implement getStats
  res.send({status: 'OK'})
}

// ----------------------------------------------------------------------------

async function addAdapter( req, res ) {
  log.info( 'addAdapter...' )
  let addResult = await db.addAdapter( req.body.ServiceId, req.body.Name )
  if ( addResult.error ) {
    res.send( 'ERROR: '+addResult.error  )
  } else {
    res.send( 'Created '+ addResult.id )
  }
}

// ----------------------------------------------------------------------------

async function getAdapter( req, res ) {
  try {
    log.debug( 'getAdapter...' )
    let filter = null
    if ( req.query.dataFilter ) {
      if ( req.query.dataFilter.ServiceName && req.query.dataFilter.ServiceName != '' ) {
        if ( ! filter ) { filter = {} }
        filter.ServiceName = req.query.dataFilter.ServiceName 
      }
      if ( req.query.dataFilter.DataInputType && req.query.dataFilter.DataInputType != '' ) {
        if ( ! filter ) { filter = {} }
        filter.DataInputType = req.query.dataFilter.DataInputType 
      }
      if ( req.query.dataFilter.DataInputType && req.query.dataFilter.DataOutputType != '' ) {
        if ( ! filter ) { filter = {} }
        filter.DataOutputType = req.query.dataFilter.DataOutputType 
      }
    }
    let adapterMap = await db.getAdapter( null, filter )
    let adapterArray = []

    for ( let uid in adapterMap ) {
      let dbRec = adapterMap[ uid ]
      let codeLbl = (  dbRec._state == 'ConfigPending' ? 'Edit' : 'Show' )
      let adapter = {
        id     : uid,
        State  : dbRec._state,
        Since  : dbRec.StateSince,
        Service: dbRec.ServiceName,
        Name   : dbRec.AdapterName,
        Input  : getResLnk( uid, dbRec, 'Input' ),
        Code   : '<a href="index.html?layout=EditCode-nonav&id='+uid+'">'+codeLbl+'</a>',
        Output : getResLnk( uid, dbRec, 'Output' ),
        Action : getActionLnk( dbRec ),
        Log    : dbRec.Log
      }
      adapterArray.push( adapter )
    }
    log.debug( 'getAdapter', adapterArray )
    res.send( adapterArray )
  } catch ( exc ) { log.warn( 'getAdapter', exc.message ) }
}

function getResLnk( id, rec, resDir ) {
  let resName = rec[ 'Data'+resDir+'Name' ]
  let resType = rec[ 'Data'+resDir+'Type' ]
  if ( ! resName ) {
    return  '<a href="index.html?layout=Select'+resDir+'-nonav&id='+id+'">configure</a>'
  } else {
    return  resType+': <a href="index.html?layout=ConfigureIO-nonav&id='+resDir+','+resType+','+id+'">'+resName+'</a>'
    
  }
}


function extractFilter( filterQuery ){
  let filter = null
  if ( filterQuery ) {
    for (  let fp in filterQuery ) { try {
      let query = filterQuery[ fp ].replaceAll( '%20', ' ' ).trim()
      if ( query != '' ) {
        if ( ! filter ) { filter = {} }
        filter[ fp ] = query
      }
    } catch ( exc ) { log.warn( 'extractFilter', exc ) }}
  }
  return filter
}

// ----------------------------------------------------------------------------

function getActionLnk( dbRec ) {
  let lnk = ''
  log.debug( 'getActionLnk', dbRec.AdapterName, dbRec.DataInputType , dbRec.DataInputType )
  if ( ! dbRec.DataInputType  ) { return 'configuration required' }
  if ( ! dbRec.DataOutputType ) { return 'configuration required' }
  switch ( dbRec._state ) {
    case 'ConfigPending':
      lnk = '<a href="adapter/'+dbRec.id+'/status/Start">Start</a>'
      break
    case 'Started':
      lnk = '<a href="adapter/'+dbRec.id+'/status/Stop">Stop</a>'
      break
    case 'Stopped':
      lnk =  '<a href="adapter/'+dbRec.id+'/status/Restart">Start</a>'
      lnk += ' <a href="adapter/'+dbRec.id+'/status/Reconfigure">Reconfigure</a>'
      break
  
    default: break
  }
  return lnk
}


async function setAdapterStatus( req, res ) {
  try {
     let adapter = await db.getAdapter( req.params.id )
    let service = await db.getServiceById( adapter.ServiceId )
    let action = req.params.action
    let statusLog = null
    let ok = true
    if ( action == 'Start' ) {
      let result = await adapters.startAdapter( service.ApiUrl, adapter.id )
      log.info( 'setAdapterStatus', result )
      if ( result.status == 'OK' ) {
        statusLog = 'Started '+getDateStr()
      } else {
        statusLog = 'Start FAILED '+getDateStr()
        ok = false
      }
    } else if ( action == 'Stop' ) {
      let result = await adapters.stopAdapter( service.ApiUrl, adapter.id )
      log.info( 'setAdapterStatus', result )
      if (  result.status == 'OK' ) {
        statusLog = 'Stopped '+getDateStr()
      } else {
        statusLog = 'Stop FAILED '+getDateStr()
        ok = false
      }
    } 
    if ( statusLog ) { 
      await db.saveAdapter({ id: adapter.id, Log: statusLog })
    }
    if ( ok ) {
      await db.changeAdapterStatus( adapter.id, adapter._state, action )
    }``
  } catch ( exc ) { log.error( 'setAdapterStatus', exc ) }
  res.redirect( '../../../index.html?layout=Adapter' )
}

function getDateStr() {
  let dt = new Date()
  let str = dt.toISOString()
  return str.substring( 0, 16 ).replace( 'T', ' ' )
}

// ----------------------------------------------------------------------------


async function getInputIcons( req, res ) {
  let adapterId = req.query.id
  let icons = adapters.getInIcons( adapterId ) 
  res.send({ icons: icons, update: 300 })
}


async function getOutputIcons( req, res ) {
  let adapterId = req.query.id
  let icons = adapters.getOutIcons( adapterId ) 
  res.send({ icons: icons, update: 300 })
}


async function setAdapterInput( req, res ) {
  if ( ! req.body.id || ! req.body.adapterType || ! req.body.adapterName ) {
    return res.status(400).send('Parameter missing')
  }
  let adapter = await db.getAdapter(  req.body.id )
  if ( ! adapter ) { return res.status(400).send('Adapter not found') }
  if ( ! adapter._state == 'ConfigPending' ) { 
    return res.status(400).send('Adapter config not allowe in state: '+adapter._state  ) 
  }

  adapter.DataInputType = req.body.adapterType
  adapter.DataInputName = req.body.adapterName
  adapter.DataInput = {}
  for ( let p in req.body ) {
    if ( p == 'id' || p == 'adapterName' || p == 'adapterType' ) { continue }
    adapter.DataInput[ p ] = req.body[ p ]
  }
  await db.saveAdapter( adapter )
  res.send('OK')
}


async function setAdapterOutput( req, res ) {
  if ( ! req.body.id || ! req.body.adapterType || ! req.body.adapterName ) {
    return res.status(400).send('Parameter missing')
  }
  let adapter = await db.getAdapter(  req.body.id )
  if ( ! adapter ) { return res.status(400).send('Adapter not found') }
  if ( ! adapter._state == 'ConfigPending' ) { 
    return res.status(400).send('Adapter config not allowe in state: '+adapter._state  ) 
  }
  
  adapter.DataOutputType = req.body.adapterType
  adapter.DataOutputName = req.body.adapterName
  adapter.DataOutput = {}
  for ( let p in req.body ) {
    if ( p == 'id' || p == 'adapterName' || p == 'adapterType' ) { continue }
    adapter.DataOutput[ p ] = req.body[ p ]
  }
  await db.saveAdapter( adapter )
  res.send('OK')
}

// ----------------------------------------------------------------------------
async function getAdapterCode( req, res ) {
  // TODO
}
// ----------------------------------------------------------------------------

async function saveAdapterCode( req, res ) {
  log.info( 'saveAdapterCode', req.body )
  if ( ! req.body.id || ! req.body.code ) {
    return res.status(400).send('Parameter missing')
  }
  let adapter = await db.getAdapter(  req.body.id )
  if ( ! adapter ) { return res.status(400).send('Adapter not found') }
  adapter.Code = req.body.code
  await db.saveAdapter( adapter )
  res.send( 'OK' )
}

// ----------------------------------------------------------------------------

// async function delCollection( req, res )  {
//   log.info( 'Del Collection', req.params.scopeId, req.params.entityId )
//   // TODO
//   res.send({ status: 'OK'})
// }


// function extractFilter( filterQuery ){
//   let filter = null
//   if ( filterQuery ) {
//     for (  let fp in filterQuery ) { try {
//       let query = filterQuery[ fp ].replaceAll( '%20', ' ' ).trim()
//       if ( query != '' ) {
//         if ( ! filter ) { filter = {} }
//         filter[ fp ] = query
//       }
//     } catch ( exc ) { log.warn( 'extractFilter', exc ) }}
//   }
//   return filter
// }

// ----------------------------------------------------------------------------

function sendErr( res, err ) {
  log.warn( err )
  res.status( 400 ).send( )
}

function getRootScope( scopeId ) {
  if ( scopeId.indexOf('/') > -0 ) {
    let scopeArr = scopeId.split('/')
    return scopeArr[0]
  }
  return scopeId
}
