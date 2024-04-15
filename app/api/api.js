/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log        = require( '../helper/log' ).logger
const apiSec     = require( './api-sec' )
const bodyParser = require( 'body-parser' )

const db = require( '../db' )

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
  svc.get(  '/adapter/input/icons',  guiAuthz, getInputIcons )
  svc.get(  '/adapter/output/icons', guiAuthz, getOutputIcons )

  svc.get(  '/adapter/code', guiAuthz, getAdapterCode )
  svc.post( '/adapter/code', apiAuthz, saveAdapterCode )

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
  if ( ! req.body.podId ) { return res.status(400).send('podId missing') }

  let uid = await db.registerPod( req.body.podId, 'ADAPTER', req.body.callbackURL )

  res.send({status: 'OK', id: uid })
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

async function getAdapter( req, res ) {
  log.info( 'getAdapter...' )
  let adapterMap = await db.getAdapter()
  let adapterArray = []
  for ( let uid in adapterMap ) {
    let dbRec = adapterMap[ uid ]
    let adapter = {
      id     : uid,
      State  : dbRec._state,
      Name   : dbRec.AdapterName,
      Input  : getResLnk( uid, dbRec.Input, 'Input' ),
      Code   : '<a href="index.html?layout=EditCode-nonav&id='+uid+'">Edit Code</a>',
      Output : getResLnk( uid, dbRec.Output, 'Output' ),
      Action : getActionLnk( uid, dbRec._state )
    }
    adapterArray.push( adapter )
  }
  log.debug( 'getAdapter', adapterArray )
  res.send( adapterArray )
}

function getResLnk( id, res, resType ) {
  if ( ! res ) {
    return  '<a href="index.html?layout=Select'+resType+'-nonav&id='+id+'">configure</a>'
  } else {
    return  '<a href="index.html?layout=Select'+resType+'-nonav&id='+id+'">'+res+'</a>'
    
  }
}


function getActionLnk( id, dbRec ) {
  let lnk = ''
  if ( ! dbRec.Output || ! dbRec.Input ) { return 'configuration required' }
  switch ( dbRec._state ) {
    case 'ConfigPending':
      lnk = '<a href="">Start</a>'
      break
    case 'Started':
      lnk = '<a href="">Stop</a>'
      break
    case 'Stopped':
      lnk = '<a href="">Started</a>'
      lnk += '<a href="">Reconfigure</a>'
      break
  
    default: break
  }
  return lnk
}

// ----------------------------------------------------------------------------
const IO_OPTS = [
  { id: 'RMQQ', label: 'RabbitMQ<br>Queue', icon: 'img/k8s-ww-conn.png' },
  { id: 'AzureEH', label: 'Azure<br>Event Hub', icon: 'img/k8s-ww-conn.png' },
  { id: 'AzureSB', label: 'Azure<br>Service Bus Queue', icon: 'img/k8s-ww-conn.png' },
  { id: 'HTTP', label: 'HTTP Endpoint', icon: 'img/k8s-ww-conn.png' },
]
const IN_OPTS = [
  { id: 'RMQS', label: 'RabbitMQ<br>Subscription', icon: 'img/k8s-ww-conn.png' },
]

async function getInputIcons( req, res ) {
  let adapterId = req.query.id
  let icons = []
  for ( let opt of IO_OPTS.concat( IN_OPTS ) ) {
    icons.push({ 
      id: opt.id, label: opt.label, img: opt.icon,
      layout : 'ConfigureIO-nonav&id=input,'+ opt.id +','+ adapterId
    })
  }
  icons.sort( ( a, b ) => { if ( a.label > b.label ) { return 1 } else { return -1} })
  res.send({ icons: icons, update: 300 })
}


const OUT_OPTS = [
  { id: 'RMQT', label: 'RabbitMQ<br>Topic', icon: 'img/k8s-ww-conn.png' },
  { id: 'LCDB', label: 'Low Code DB', icon: 'img/k8s-ww-conn.png' },
  { id: 'AzureBLOB', label: 'Azure<br>Storage BLOB', icon: 'img/k8s-ww-conn.png' },
  { id: 'InfluxDB', label: 'InfluxDB', icon: 'img/k8s-ww-conn.png' },
]

async function getOutputIcons( req, res ) {
  let adapterId = req.query.id
  let icons = []
  for ( let opt of IO_OPTS.concat( OUT_OPTS ) ) {
    icons.push({ 
      id: opt.id, label: opt.label, img: opt.icon,
      layout : 'ConfigureIO-nonav&id=output,'+ opt.id +','+ adapterId
    })
  }
  icons.sort( ( a, b ) => { if ( a.label > b.label ) { return 1 } else { return -1} })
  res.send({ icons: icons, update: 300 })
}

// ----------------------------------------------------------------------------
async function getAdapterCode( req, res ) {
}

async function saveAdapterCode( req, res ) {
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
