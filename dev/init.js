  goog.provide('fa.init');
  fa.init = function(){
    var requiredVersion = "2.1.2"; // Minimum Firebase Library version
    var fbVersionInt = fa.utils.stringifyVersion(window.Firebase.SDK_VERSION); // Firebase Version with . removed
    var requiredVersionInt = fa.utils.stringifyVersion(requiredVersion); //Required version with . removed
    if(typeof window.Firebase == 'undefined'){ //Check for Firebase library
      throw new Error('Firebase is required to use FireAdmin');
    } else if (fbVersionInt < requiredVersionInt){ //Check Firebase library version
      console.warn('Unsupported Firebase version: ' + window.Firebase.SDK_VERSION +'. Please upgrade to 2.1.2 or newer.');
    }
  };
  fa.init();