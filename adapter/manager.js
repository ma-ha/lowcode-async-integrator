const log    = require( './helper/log' ).logger
const axios  = require( 'axios' )

exports: module.exports = {
  registerPod
}

async function registerPod( podId, cfg, workerId ) {
  try {
    log.info( 'REGISTER ADAPTER ...' )
    let adaper = {
      serviceId : podId,
      callbackURL : cfg.POD_URL,
      workerId : workerId
    }

    let result = await axios.post(
      cfg.MANAGER_URL+'/pod/register', 
      adaper, 
      { headers: { 
        'cluster_key' : cfg.CLUSTER_KEY
      }} 
    )
    log.info( 'REGISTER ADAPTER', result.status, result.statusText, result.data )
    
    return result.data.id

  } catch ( exc ) {
    log.error( 'REGISTER ADAPTER', exc.message )
    process.exit()
  }
}