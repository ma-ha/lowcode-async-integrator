/* LOWCODE-ASYNC-INTEGRATOR / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */

const gui     = require( 'easy-web-app' )
const express = require( 'express' )
const log     = require( '../helper/log' ).logger
const pjson   = require( '../package.json' )
// const weblog  = require( './weblog' ) 

const content = require( './api-content' ) 

exports: module.exports = {
  init,
  initPages
}


const PRD_NAME = 'LowCode Async Integrator App'
let cfg = {}

function init( appConfig ) {
  cfg = appConfig
  log.info( 'Starting GUI...' )

  // api.initAPI( gui.getExpress() )

  if ( cfg.CSS_PATH ) {
    gui.getExpress().use( '/css-custom', express.static( cfg.CSS_PATH  ) )
  } else {
    gui.getExpress().use( '/css-custom', express.static( __dirname + '/css' ) )
  }
  gui.getExpress().use( '/ext-module', express.static( __dirname + '/ext-module' ) )

  if ( cfg.IMG_PATH ) {
    gui.getExpress().use( '/img', express.static( cfg.IMG_PATH  ) )
  } else {
    gui.getExpress().use( '/img', express.static( __dirname + '/img' ) )
  }

  content.init( gui.getExpress(), cfg )

  return gui
}


async function initPages( ) {
  /** Initialize the framework and the default page */
  log.info( 'INIT PAGES', cfg.POD_PORT, cfg.POD_URL_PATH )
  gui.init( PRD_NAME, cfg.POD_PORT, cfg.POD_URL_PATH )
  gui.pages['main'].title    = 'LowCode'
  gui.pages['main'].navLabel = "What's it"
  gui.pages['main'].setPageWidth( '90%' )

  gui.dynamicHeader( genPageHeader )
  gui.dynamicNav( genDynNav )
   
  // ..........................................................................
  /** Add an empty view to the default page. */
  gui.addView({ 
    id:'welcome', name:'',
    height:'auto', 
    resourceURL: 'content/welcome',
    decor: 'none'
  }) 

  // ..........................................................................

   gui.dynamicTitle( async ( title, req, page ) => {  return ( cfg.TITLE ? cfg.TITLE : 'Low Code Async Integrator' ) } )

  // ..........................................................................

  addHtmlPage( gui, 'gtc-en', 'GTC', 'GTC' )
  addHtmlPage( gui, 'gtc-de', 'GTC', 'GTC' )
  addHtmlPage( gui, 'privacy-en', 'Privacy Policy', 'PRV' )
  addHtmlPage( gui, 'imprint-en', 'Imprint', 'IMP' )
  

  gui.pages['main'].footer.copyrightText = PRD_NAME + ' v'+pjson.version + ' &#169; ma-ha, 2023  ' 
    + '<a href="https://github.com/ma-ha/lowcode-async-integrator" target="_blank">GitHub</a> / '
    + '<a href="https://www.npmjs.com/package/lowcode-async-integrator" target="_blank">NPM</a>'
  gui.pages['main'].addFooterLink( 'Imprint',  getHtmlURL( 'imprint-en' )  )
  gui.pages['main'].addFooterLink( 'Privacy Policy',  getHtmlURL( 'privacy-en' ) ) 
  gui.pages['main'].addFooterLink( 'General Terms and Conditions',  getHtmlURL( 'gtc-en' ) )
 
  // --------------------------------------------------------------------------

  // appGUI.init()
  let appEntityPage = gui.addPage( 'Adapter' ) 
  appEntityPage.title = "Adapter"
  appEntityPage.setPageWidth( "90%")

  appEntityPage.addView({  id: 'Adapter',
    rowId: 'Adapter', title: 'Adapter',  height: '760px', 
    type : 'pong-table', resourceURL: 'adapter',
    moduleConfig : {
      dataURL: "",
      rowId: "id",
      cols: [
        { id: "State",   label: "State", width: "10%", cellType: "text" },
        { id: "Name",    label: "Name",  width: "10%", cellType: "text" },
        { id: "Input",   label: "Input", width: "10%", cellType: "text" },
        { id: "Code",    label: "Code",  width: "10%", cellType: "text" },
        { id: "Output",  label: "Output",width: "10%", cellType: "text" },
        { id: "Action",  label: "Action", width: "10%", cellType: "text" }
      ],
      pollDataSec: "15",
    }
  })


  let codeEditPage = gui.addPage( 'EditCode-nonav' ) 
  codeEditPage.title = "Adapter Code"
  codeEditPage.setPageWidth( "90%")  
  codeEditPage.addView({
    id: 'AdapterCodeEdit', rowId: 'AdapterCodeEdit',
    title : 'Adapter Code', decor: "decor", height: '760px', 
    type  : 'pong-form', resourceURL : 'adapter/code',
    moduleConfig : {
      label:'Adapter Code',
      description: "Edit Adapter Code",
      id: 'AdapterCodeEditForm',
      fieldGroups:[{ columns: [{ formFields: [     
        { id: "id",   label: "Id", type: "text", readonly: true },
        { id: "code", label: "JS Code", type: "text", rows: 10 }
      ] }] }],
      actions : [ 
        { id: "AdapterCodeSaveBtn", actionName: "Save", 
          actionURL: 'code', target: "_parent" }
      ]
    }
  })


  let selInputPage = gui.addPage( 'SelectInput-nonav' ) 
  selInputPage.title = "Adapter Input"
  selInputPage.setPageWidth( "90%")
  selInputPage.addView({ 
    id:'SelectInputIcons', 
    title: "Select Adapter Output Option",
    type:'pong-icons', 
    resourceURL:'adapter/input/icons', 
    height:'760px' 
  })


  let selOutputPage = gui.addPage( 'SelectOutput-nonav' ) 
  selOutputPage.title = "Adapter Output"
  selOutputPage.setPageWidth( "90%")  
  selOutputPage.addView({ 
    id:'SelectInputIcons', 
    title: "Select Adapter Input Option",
    type:'pong-icons', 
    resourceURL:'adapter/output/icons', 
    height:'760px' 
  })

  let configIOPage = gui.addPage( 'ConfigureIO-nonav' ) 
  configIOPage.title = "Adapter Configuration"
  configIOPage.setPageWidth( "90%")  
  configIOPage.dynamicRow( configureIoForm )

}


const ADAPTER_FORM = {
  'RMQQ': { 
    label: 'RabbitMQ Queue',
    formFields : [
      { id: "rmqURL",   label: "AMQP URL", type: "text" },
      { id: "rmqQueue", label: "Queue Name", type: "text" },
    ]
  },
  'RMQS': { 
    label: 'RabbitMQ Subscription',
    formFields : []
  },
  'RMQT': { 
    label: 'RabbitMQ Topic',
    formFields : []
  },
  'AzureEH': { 
    label: 'Azure Event Hub',
    formFields : []
   },
  'AzureSB': { 
    label: 'Azure Service Bus Queue',
    formFields : []
   },
  'HTTP': { 
    label: 'HTTP Endpoint',
    formFields : [
      { id: "httpBaseURL",  label: "Base URL", type: "text" }
    ]
   },
  'LCDB': { 
    label: 'Low Code DB',
    formFields : []
   },
  'AzureBLOB': { 
    label: 'Azure Storage BLOB',
    formFields : []
   },
  'InfluxDB': { 
    label: 'InfluxDB',
    formFields : []
   },
}

async function configureIoForm( staticRows, req, pageName )  {
  if ( ! req.query.id || req.query.id.split(',').length != 3 ) { 
    log.warn('require param: id') 
    return [] 
  }

  let ioDir = req.query.id.split(',')[0]
  let ioOpt = req.query.id.split(',')[1]
  let adapterId = req.query.id.split(',')[2]

  let formCfg = ADAPTER_FORM[ ioOpt ]

  let lbl = ( ioDir == 'input' ? 'Input' : 'Output' )

  let rowArr = [] 

  let formFields =  [
    { id: "id",   label: "Adapter Id", type: "text", value: adapterId, readonly: true },
    { id: "adapter", type: "text", value: ioOpt, hidden: true }
  ].concat(
    formCfg.formFields
  )
  

  rowArr.push({
    id: 'AdapterIoConfig', rowId: 'AdapterIoConfig',
    title : 'Adapter '+lbl, decor: "decor", height: '760px', 
    type  : 'pong-form', resourceURL : 'adapter/'+ioDir,
    moduleConfig : {
      label: formCfg.label,
      id: 'AdapterIoConfigForm',
      fieldGroups:[{ columns: [{ formFields: formFields }] }],
      actions : [ 
        { id: "AdapterIoConfigSaveBtn", actionName: "Save", 
          actionURL: 'adapter/'+ioDir, target: "_parent" }
      ]
    }
  })

  return rowArr
}
// ==========================================================================++
 
function genDynNav ( navType, oldNavTabs, req ) {
  return new Promise( async ( resolve, reject ) => {
    try {
      return resolve( oldNavTabs )
      // if ( navType === 'nav' ) { // can also be 'nav-embed' and 'nav-embed-sub'
      //   log.debug( 'dynamicNav', oldNavTabs )
      //   let menu = JSON.parse( JSON.stringify( oldNavTabs ) )
      //   let user = await userDta.getUserInfoFromReq( gui, req )
      //   // log.info( 'dynamicNav', user )

      //   if ( user ) {
      //     menu = [{ "layout": "Apps",  "label": "Apps" }]

      //     // check if user needs admin menu
      //     for ( let adminScopeId of user.role.admin ) {
      //       // log.info( 'dynamicNav admin', adminScopeId )
      //       if ( user.scopeId.indexOf( adminScopeId ) == 0) {
      //         menu.push({ layout: 'Scope', label: 'Scopes' })
      //         menu.push({ layout: 'Users', label: 'Users' })
      //         break                
      //       }
      //     }
      //     // check if user needs dev menu
      //     for ( let devScopeId of user.role.dev ) {
      //       log.debug( 'dynamicNav dev', user )
      //       if ( user.scopeId.indexOf( devScopeId ) == 0 ) {
      //         menu.push({ layout: 'Customize', label: 'Customize' })
      //         menu.push({ layout: 'Marketplace', label: 'App Marketplace' })
      //         break                
      //       }
      //     }
          
      //     if ( oldNavTabs ) {
      //       for ( let nav of oldNavTabs ) {
      //         log.debug( 'nav', nav )
      //         if ( nav.label == 'Docu' ) {
      //           menu.push( nav )
      //         }
      //       }
      //     }

      //   } else {
      //     log.debug( 'menu', menu )
      //   }

      //   resolve( menu )

      // } else {
      //   resolve( oldNavTabs )
      // }
    } catch ( e ) { 
      log.error('dynamicNav', e)
      resolve( oldNavTabs )
    }
  })
}

// ==========================================================================++


async function genPageHeader ( pgHeader, req, page ) {
  // return new Promise( ( resolve, reject ) => {
    // log.info( 'genPageHeader', pgHeader )
    if ( page == 'openid-login-nonav' ) {
      return {
        logo: { text: "Login" },
        frameWarning: "true",
        modules: []
      }
    }
    return pgHeader
}

// ==========================================================================
// helper 

function errorView( txt ) {
  return [{ 
    id: 'error', 
    title: 'Error: '+txt,
    height: '100px', decor: 'decor',
    resourceURL: 'none'
  }]
}

function getHtmlURL( id ) {
  return  cfg.GUI_URL+'/index.html?layout='+id+'-nonav'
}

function addHtmlPage( gui, id, title, cssId, contentId ) {
  log.info( 'addHtmlPage',  id + '-nonav' )
  let gtcPage = gui.addPage( id + '-nonav', title )
  gtcPage.title = 'LowCode App'
  gtcPage.setPageWidth( '90%' )
  /** Add an empty view to the default page. */
  gtcPage.addView({ 
    id: cssId, name:'',
    height:'auto', 
    resourceURL: 'content/'+id,
    decor: 'none'
  }) 
}


