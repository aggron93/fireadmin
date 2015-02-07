  goog.provide("fa.utils");
  //Remove periods from version number
  fa.utils.stringifyVersion = function(version){
    return version.replace(".", "").replace(".", "");
  }
    /** Handle Callback functions by checking for existance and returning with val if avaialble
  * @function handleCb
  * @param callback {Function} Callback function to handle
  * @param value {string|object|array} Value to provide to callback function
  * @example
  * //Handle successCb
  *  function(uid, successCb, errorCb){
  *     ref.on('value', function(accountSnap){
  *      handleCb(successCb, accountSnap.val());
  *     }, function(err){
  *      handleCb(errorCb, err);
  *    });
  *  };
  */
  fa.utils.handleCb = function (cb, val){
    if(cb && typeof cb == 'function'){
      if(val){
        return cb(val);
      } else {
        return cb();
      }
    }
  };

  fa.utils.areValid = function() {
    //Create an array from arguments
    var args = Array.prototype.slice.call(arguments, 0);
    for(i=0; i < args.length; i++){
      if(typeof args[i] == 'undefined'){
        return false
      }
      if(typeof args[i] == ''){

      } else {
        console.error('[validateParams] Invalid argument:', args[i]);
        throw new Error('Invalid argument in validateParams function.');
      }
    }
  };