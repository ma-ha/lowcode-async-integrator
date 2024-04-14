
const log        = require( './helper/log' ).logger
const bodyParser = require( 'body-parser' )

exports: module.exports = { 
  setupAPI  
}

// ============================================================================
// API:
// now we need to implement the ReST service for /products 
// this should also only be available for authenticated users
let gui = null

async function setupAPI( cfg ) {
  log.info( 'Starting API...' )

  let svc = app.getExpress()
  gui = app

  svc.use( bodyParser.urlencoded({  limit: "20mb", extended: false }) )
  svc.use( bodyParser.json({ limit: "20mb" }) )

  //---------------------------------------------------------------------------
  const clusterAuthz = clusterAuthzFn( cfg )
  
  svc.get(  '/pod/config', clusterAuthz, getConfig )
  svc.post( '/pod/config', clusterAuthz, setConfig )

  svc.post( '/pod/start', clusterAuthz, startWorker )
  svc.post( '/pod/stop',  clusterAuthz, stopWorker )

  svc.get(  '/pod/stats', clusterAuthz, getStats )

  // svc.delete('/adapter/entity/:scopeId/:entityId', apiAuthz, delCollection )
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
