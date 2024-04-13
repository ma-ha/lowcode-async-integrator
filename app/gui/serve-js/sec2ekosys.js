/* LOWCODE-DATA-APP / copyright 2024 by ma-ha https://github.com/ma-ha  /  MIT License */


let mSec_Login_rss = null
let mSec_Logout_URL = null

function mSec_Login( params ) { 
  // console.log( params );
  let loginParams = {
    audience      : params.audience,
    client_id     : params.clientId,
    scope         : 'openid profile email read:all',
    redirect_uri  : params.loginRedirect,
    response_type : 'token id_token',
    prompt        : 'login'
  }
  let qs = Object.keys( loginParams ).map( 
    key => `${encodeURIComponent(key)}=${encodeURIComponent(loginParams[key])}`
  ).join('&');
  // console.log( qs )
  eraseCookie( 'pongSec2IdTkn' ) ;
  eraseCookie( 'pongSec2XsTkn' ) ;
  let url = `http://${+params.authDomain}?${qs}`;
  if ( params.loginURL ) {
    url =  params.loginURL + ( params.loginURL.indexOf( '?' ) > 0 ? '&' : '?' ) + qs;
  } 
  //console.log( url );
  window.location.href = url;
}

function eraseCookie( name ) {   
  document.cookie = name+'=; Max-Age=0;';  
}

function mSec_isAuthenticated( params, token, callback ) {
  // console.log( 'mSec_isAuthenticated', token )
  if ( ! token ) { return callback( null ); }
  if ( token && token.idToken ) { //TODO need real check
    let jwt = parseJwt( token.idToken  );
    if ( ! jwt ) { return callback( null ); }
    // console.log( "mSec_isAuthenticated JWT" , jwt )
    if ( ! mSec_Login_rss && jwt && jwt.exp ) {
      // jwt.exp = Date.now() / 1000 +  config.userSessionExpireMin * 60
      let expMs = jwt.exp* 1000 - Date.now() 
      console.log( "Start Logout Scheduler", Math.round( expMs/60000 ), 'min' )
      mSec_Login_rss = setTimeout( () => {
        sec2Logout();
      }, expMs )
    } 
    // console.log( 'mSec_isAuthenticated', jwt )
    callback( { name: jwt.email, email: jwt.email });
  } else {
    callback( null );
  }
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  if ( ! base64Url ) { return null; }
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function mSec_getIdTokenfromURL() {
  var idx = window.location.href.indexOf( 'id_token' )
  // console.log( 'ID Token '+idx )
  if (  idx > 0 ) {
    var tokenStr = window.location.href.substring( idx + 9 ) 
    if ( tokenStr.indexOf('&') > 0 ) { 
      tokenStr = tokenStr.substring( 0, tokenStr.indexOf('&') )
    }
    // alert( tokenStr );
    return tokenStr
  } else {
    return false
  }
}

function mSec_getAccessTokenFrmURL() {
  var idx = window.location.href.indexOf( 'access_token' )
  if (  idx > 0 ) {
    var tokenStr = window.location.href.substring( idx + 13 ) 
    if ( tokenStr.indexOf('&') > 0 ) { 
      tokenStr = tokenStr.substring( 0, tokenStr.indexOf('&') )
    }
    return tokenStr
  } else {
    return false
  }
}

function mSec_getUserId( userInfo ) {
  //console.log( userInfo );
  if ( userInfo && userInfo.name ) {
    return userInfo.name;
  } else {
    return '?';
  }
}

function mSec_Logout( params ) { 
  console.log( 'mSec_Logout', params )
  // https://auth0.com/docs/api/authentication#logout
  var logoutURL = params.logoutURL
    + '?client_id=' + params.clientId
    + '&return_to=' + params.logoutRedirect
  window.location.href = logoutURL
}


function mSec_ChangePassword( params, userEmail ) {
  window.location.href = 'index.html?layout=change-password-nonav'
//   new Auth0ChangePassword({
//     container:         "SecurityChangePasswordDiv",                   // required
// //    email:             "{{email | escape}}",                          // DO NOT CHANGE THIS
//     email:             userEmail,
//     csrf_token:        "{{csrf_token}}",                              // DO NOT CHANGE THIS
//     ticket:            "{{ticket}}",                                  // DO NOT CHANGE THIS
//     password_policy:   "{{password_policy}}",                         // DO NOT CHANGE THIS
//     password_complexity_options: '{{password_complexity_options}}',   // DO NOT CHANGE THIS
//     theme: {
//       icon: "{{tenant.picture_url | default: '//cdn.auth0.com/styleguide/1.0.0/img/badge.png'}}",
//       primaryColor: "{{tenant.colors.primary | default: '#ea5323'}}"
//     },
//     dict: {
//       // passwordPlaceholder: "your new password",
//       // passwordConfirmationPlaceholder: "confirm your new password",
//       // passwordConfirmationMatchError: "Please ensure the password and the confirmation are the same.",
//       // passwordStrength: {
//       //   containsAtLeast: "Contain at least %d of the following %d types of characters:",
//       //   identicalChars: "No more than %d identical characters in a row (e.g., "%s" not allowed)",
//       //   nonEmpty: "Non-empty password required",
//       //   numbers: "Numbers (i.e. 0-9)",
//       //   lengthAtLeast: "At least %d characters in length",
//       //   lowerCase: "Lower case letters (a-z)",
//       //   shouldContain: "Should contain:",
//       //   specialCharacters: "Special characters (e.g. !@#$%^&*)",
//       //   upperCase: "Upper case letters (A-Z)"
//       // },
//       // successMessage: "Your password has been reset successfully.",
//       // configurationError: "An error ocurred. There appears to be a misconfiguration in the form.",
//       // networkError: "The server cannot be reached, there is a problem with the network.",
//       // timeoutError: "The server cannot be reached, please try again.",
//       // serverError: "There was an error processing the password reset.",
//       // headerText: "Enter a new password for<br />{email}",
//       // title: "Change Password",
//       // weakPasswordError: "Password is too weak."
//       // passwordHistoryError: "Password has previously been used."
//     }
  // });

  // // close form after 30 sec
  // setTimeout( ()=> {
  //   $( "#SecurityChangePasswordDiv" ).toggle( "blind" ); 
  // }, 30000 );
}
