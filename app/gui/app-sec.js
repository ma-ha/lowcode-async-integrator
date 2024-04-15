/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const log     = require( '../helper/log' ).logger
const express = require( 'express' )

exports: module.exports = {
  init
}

let publicPages = [ 
  'main', 
  'gtc-en-nonav', 'gtc-de-nonav', 
  'privacy-en-nonav', 
  'imprint-en-nonav',
  'openid-login-nonav'
]

const DEV_PAGES = [
  'Customize',
  'Marketplace',
  'AppEntities-nonav',
  'AppEntityProperties-nonav',
  'UploadApp-nonav',
  'AppEntityStatus-nonav',
  'StateAdmin-nonav',
  'EditState-nonav'
]

// ----------------------------------------------------------------------------
function init( gui, allCfg ) {
  log.info( 'Init App security...' )
  let cfg = allCfg.OIDC
  
  // switch securiy on:
  gui.enableSec2({ 
    moduleJS: 'js/sec2ekosys.js',
    checkLoginInterval: '60000',
    loginRedirect:  cfg.LOGIN_REDIRECT,
    logoutRedirect: cfg.LOGOUT_REDIRECT,
    
    resetPasswordURL  : cfg.PWD_RESET_URL,
    changePasswordURL : cfg.CHANGE_PWD_URL,
    // registgerURL      : cfg.REGISTER_URL,
    
    authDomain : cfg.AUTH_DOMAIN,
    clientId   : cfg.CLIENT_ID,  // product ID
    audience   : cfg.AUDIENCE,
    loginURL   : cfg.LOGIN_URL,
    logoutURL  : cfg.LOGOUT_URL,
  })

  // serve sec code to browser
  gui.getExpress().use( '/js',  express.static( __dirname + '/serve-js' ) )

  // check authorization for GUI pages 
  gui.authorize = async ( user, page ) => {
    return true  
    log.debug( 'autz', user, page )
    if ( publicPages.indexOf( page ) >= 0  || page.indexOf( 'Docu' ) == 0 ) {
        // log.info( 'All users are authorized for page "'+page+'", also "'+user+'"' )
      return true;
    }
    if ( ! user ) {
      // log.info( 'User "'+user+'" is not authorized for page "'+page+'"' )
      return false
    }

    return true  
  }

}