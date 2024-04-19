
const log        = require( './helper/log' ).logger
const bodyParser = require( 'body-parser' )
const express = require('express')

exports: module.exports = { 
  setupAPI  
}

// ============================================================================
// API:
// now we need to implement the ReST service for /products 
// this should also only be available for authenticated users
let svc = null
let router = null

let cfg = null
async function setupAPI( config ) {
  log.info( 'Starting API...' )
  cfg = config

  svc = express()
  router = express.Router()
  svc.use( cfg.POD_URL_PATH, router )
  
  router.use( bodyParser.urlencoded({  limit: "20mb", extended: false }) )
  router.use( bodyParser.json({ limit: "20mb" }) )

  //---------------------------------------------------------------------------
  const clusterAuthz = clusterAuthzFn( cfg )
  
  router.get(  '/adapter/config/:dir/:id', clusterAuthz, getConfig )
  router.post( '/adapter/config/:dir/:id', clusterAuthz, setConfig )

  router.post( '/adapter/start/:dir/:id', clusterAuthz, startWorker )
  router.post( '/adapter/stop/:dir/:id',  clusterAuthz, stopWorker )

  router.get(  '/adapter/stats', clusterAuthz, getStats )

  // svc.delete('/adapter/entity/:scopeId/:entityId', apiAuthz, delCollection )
  svc.listen( cfg.pPOD_PORT )
}

//---------------------------------------------------------------------------

function clusterAuthzFn( cfg ) {
  let check = async (req, res, next) => {
    if ( req.headers.cluster_key != cfg.CLUSTER_KEY ) { 
      log.warn( 'call is not authorized', req.headers )
      return next( new UnauthorizedError(
        'Not authorized', 
        { message: 'Not authorized' }
      ))
    }
    return next()
  }
  return check
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

async function setConfig( req, res ) {
  log.info( 'setConfig...', req.params, req.body )
  // TODO implement
  res.send({status: 'OK'})
}

async function getConfig( req, res ) {
  log.info( 'getConfig...', req.params, req.query )
  // TODO implement
  res.send({status: 'OK'})
}

// ----------------------------------------------------------------------------

async function getStats( req, res ) {
  log.info( 'getStats...')
  // TODO implement getStats
  res.send({status: 'OK'})
}
