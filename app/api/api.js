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
  
  svc.get(  '/pod/config', apiAuthz, getConfig )
  svc.post( '/pod/config', apiAuthz, setConfig )
  svc.post( '/pod/register', clusterAuthz, registerPod )

  svc.post( '/pod/start', apiAuthz, startWorker )
  svc.post( '/pod/stop',  apiAuthz, stopWorker )

  svc.get(  '/pod/stats', apiAuthz, getStats )

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
