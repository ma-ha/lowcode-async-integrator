/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log       = require( '../helper/log' ).logger
const jwtParser = require( 'jsonwebtoken' )

exports: module.exports = { 
  init,
  adminAuthz,
  apiAppAuthz,
  initJWTcheck
}

let gui = null
let cfg = null

function init( configs ) {
  log.info( 'Starting API/sec...', cfg )
  cfg = configs
}


function adminAuthz( theGUI ) {
  if ( ! gui ) { gui = theGUI }
  let check = async (req, res, next) => {
    let accessOk = false
    let userId = await gui.getUserIdFromReq( req )

    if ( userId ) { 
      req.user = user
    } else {
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

function apiAppAuthz( theGUI ) {
  gui = theGUI
 
  let check = async (req, res, next) => {
    let appId = req.headers[ 'app-id' ]
    let appPw = req.headers[ 'app-secret' ]
    log.info( 'apiAppAuthz', appId, appPw )
   
    if ( ! appScopes ) {
      log.warn( 'call is not authorized', req.headers )
      return next( new UnauthorizedError(
        'Not authorized', 
        { message: 'Not authorized' }
      ))
    }
    return next();
  }
  return check
}
// ----------------------------------------------------------------------------
// Authorization Checker

function initJWTcheck() {
  // let clientID = cfg.CLIENT_ID
  // let audience = cfg.OIDC.AUDIENCE
  // let issuer   = cfg.OIDC.ISSUER

  let check = (req, res, next) => {
    log.debug( 'JWTcheck', req.headers.authorization )
    if ( req.query.layout && req.query.layout == 'pb-nonav' && req.query.id ) {
      return next() // then do URL-token autz for static boards
    } 
    if ( ! req.headers.authorization ) {
      log.info( 'JWTcheck', 'API call is not authorized: Authorization header not found' )
      return next( new UnauthorizedError(
        'No Authorization header found', 
        { message: 'Format is "Authorization: Bearer [token]"' }
      ))
    }
    // log.info( 'JWTcheck',req.headers )
    // parse JWT
    let parts = req.headers.authorization.split( ' ' )
    if ( parts.length == 2  &&  parts[0] == 'Bearer' ) {
      let bearer = parts[1]
      req.bearerToken = bearer
      log.debug( 'JWTcheck Bearer token: ', bearer )
      if (  req.headers['id-jwt'] ) {
        let openIdUser = jwtParser.decode( req.headers['id-jwt'], { complete: true }) || {}
        log.debug( 'JWTcheck ID token: ', openIdUser )
        //log.debug( 'expires', new Date( openIdUser.payload.exp *1000 ) )
        req.openIdUser = openIdUser
      }

    } else {
      log.info( 'JWTcheck', 'API call is not authorized: No Bearer token found' )
      return next( new UnauthorizedError(
        'No Bearer token found', 
        { message: 'Format is Authorization: Bearer [token]' }
      ))
    }
    // OK, check passed
    log.debug( 'JWTcheck', 'API call is authorized' )
    return next();
  }
  return check
}


function UnauthorizedError (code, error) {
  this.name    = "UnauthorizedError"
  this.message = error.message
  Error.call( this, error.message )
  Error.captureStackTrace( this, this.constructor )
  this.code   = code
  this.status = 401
  this.inner  = error
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

// ============================================================================
