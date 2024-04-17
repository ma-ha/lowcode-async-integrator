/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log       = require( './helper/log' ).logger
const pjson     = require( './package.json' )

log.info( `Starting ${pjson.name} v${pjson.version} NODE_ENV=${process.env.NODE_ENV}` )

const path      = require( 'path' )
const db        = require( './db' )
const appGUI    = require( './gui/gui' )
const appSec    = require( './gui/app-sec' )
const appAPI    = require( './api/api' )
const apiSec    = require( './api/api-sec' )

exports: module.exports = {
  init
}

let id = '?'
const WORKER_ID = require('os').hostname() +'-'+ process.pid

async function init( podId, podConfig ) {
  let cfg = checkConfig( podConfig )
  cfg.ID = podId

  await db.initDB( cfg )
  cfg.POD_UID = await db.registerPod( cfg.ID, cfg.POD_MODE, cfg.POD_URL, WORKER_ID )

  apiSec.init( cfg )
  let app = appGUI.init( cfg )

  await appGUI.initPages()

  appSec.init( app, cfg )
  await appAPI.setupAPI( app, cfg )

  return app
}

// ============================================================================
// helper to check config params

function checkConfig( cfg ) {
  if ( ! cfg ) {  cfg = {} } 

  checkCfgParam( cfg, 'POD_MODE', 'MANAGER' )
  checkCfgParam( cfg, 'LOWCODE_DB_API_URL', 'http://localhost:8888/app/adapter/' )
  checkCfgParam( cfg, 'LOWCODE_DB_API_ID', 'change-me' )
  checkCfgParam( cfg, 'LOWCODE_DB_API_KEY', 'change-me' )

  checkCfgParam( cfg, 'CONFIG_DIR', '../pod-cfg/' )
  
  checkCfgParam( cfg, 'POD_URL_PATH', '/' )
  checkCfgParam( cfg, 'POD_PORT', 8889 )
  checkCfgParam( cfg, 'POD_URL','http://localhost:' + cfg.POD_PORT + cfg.POD_URL_PATH )

  checkCfgParam( cfg, 'CLUSTER_KEY', 'secret' )

  checkOidcParams( cfg )

  log.debug( 'CONFIG', cfg )
  return cfg
}

// ----------------------------------------------------------------------------
function checkCfgParam( cfg, paramName, defaultVal ) {
  // if ( config[ paramName ] ) {
  //   cfg[ paramName ] = config[ paramName ]
  //   log.debug( 'Low Code App Init: ',paramName, defaultVal ) 
  // } else 
  if ( ! cfg[ paramName ]  || ! typeof cfg[ paramName ] === 'string' ) { 
    log.warn( 'Low Code App Init: Use default '+paramName+'="'+defaultVal+'"' ) 
    cfg[ paramName ] = defaultVal
  }  
}

function checkOidcParams( cfg ) {
  if ( ! cfg.OIDC ) {
    cfg.OIDC = {
      OPENID_SEC_KEY: '_______change_me_______',
      CLIENT_ID: 'a0000a0000a0000a0000a000',
      ISSUER: 'https://localhost/',
      JWKS_URI: 'https://localhost/.well-known/jwks.json',
      AUDIENCE: 'http://localhost:8888/',
      AUTH_DOMAIN: 'localhost',
      AUTH_SCOPE: 'read:all',
      LOGIN_URL:  'oidc/authorize',
      LOGOUT_URL: 'oidc/logout',
      CHANGE_PWD_URL: 'index.html?layout=change-password-nonav',
      REGISTER_URL: 'http://localhost:8888/index.html?layout=product-nonav&id=5d380c06abc348168ba62ec6',
      PWD_RESET_URL: 'http://localhost:8888/index.html?layout=main',
  
      LOGIN_REDIRECT: 'http://localhost:8888/app/index.html',
      LOGOUT_REDIRECT: 'http://localhost:8888/app/index.html',
      userSessionExpireMin : 60
    }
  }
}
