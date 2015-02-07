


  //Initialize Library
  /**
   * Creates a Fireadmin object
   * @namespace Fireadmin
   * @param {String} url Url of Firebase to use with Fireadmin
   * @example
   * //Create new Fireadmin Object
   * var fa = new Fireadmin("https://<your-app>.firebaseio.com");
   */
  function Fireadmin (url, optionsObj) {
    if(typeof url == "undefined" || typeof url != "string"){
      throw new Error('Url is required to use FireAdmin');
    }
    this.ref = new Firebase(url);
    this.fbUrl = url;
    return this;
  };
  /**
  * This callback is displayed as part of the Requester class.
  * @callback Fireadmin~errorCb
  * @param {string} code
  * @param {string} message
  */
  /**
   * Creates an object provided the name of the list the object will go into and the object itself.
   * The object is created with a createdAt parameter that is a server timestamp from Firebase.
   * If a user is currently signed in, the object will contain the author's `$uid` under the author parameter.
   * @memberOf Fireadmin#
   * @param {String} listName - `Required` The name of the list the object will be put into.
   * @param {Object} objectData - `Required` Data you wish to be contained within new object
   * @param {Function} onSuccess - `Not Required` Function that runs when your object has been created successfully and returns newly created object.
   * @param {Function} onError - `Not Required` Function that runs if there is an error creating the object.
   * @example
   * //creates new message object in message list
   * fa.createObject('messages', {title:Example, content:"Cool Message"}, function(newMsg){
   *  console.log('New Message created successfuly:', newMsg);
   * }, function(err){
   *  console.error('Error creating new message:', err);
   * });
   */
  Fireadmin.prototype.createObject = function(listName, obj, successCb, errorCb){
    var auth = this.ref.getAuth();
    // If user is logged in they are added as the author
    if(auth) {
      obj.author = auth.uid;
    }
    // Add created at time stamp to object
    obj.createdAt = Firebase.ServerValue.TIMESTAMP;
    if(typeof listName == 'string' && typeof obj != 'undefined'){
      this.ref.child(listName).push(obj, function(err){
        if(!err){
          handleCb(successCb, obj);
        } else {
          handleCb(errorCb, err);
        }
      });
    }
  };

    /**
   * Deletes an object from a list given object id and list name
   * @memberOf Fireadmin#
   * @param {String} listName - `Required` The name of the list the object will be put into.
   * @param {Object} id - `Required` Id of object you wish to delete
   * @param {Function} onSuccess - `Not Required` Function that runs when your object has been created successfully and returns newly created object.
   * @param {Function} onError - `Not Required` Function that runs if there is an error creating the object.
   * @example
   * //creates new message object in message list
   * fa.deleteObject('messages', {title:Example, content:"Cool Message"}, function(newMsg){
   *  console.log('New Message created successfuly:', newMsg);
   * }, function(err){
   *  console.error('Error creating new message:', err);
   * });
   */
  Fireadmin.prototype.deleteObject = function(listName, id, successCb, errorCb){
    this.ref.child(listName).child(id).on('value', function(objSnap){
      if(objSnap.val()){
        objSnap.ref().remove(function(err){
          if(!err){
            handleCb(successCb);
          } else {
            handleCb(errorCb, err);
          }
        });
      } else {
        console.error(id + ' does not exist in ' + listName + ' so it can not be deleted.');
        handleCb(errorCb, {message:'Object does not exist', status:400});
      }
    }, function(err){
        console.error('Error deleting'+ id + ' from '+ listName + ' :', err);
        handleCb(errorCb, err);
    });
  };
  /** Modified version of Firebase's authWithPassword that handles presence
   * @memberOf Fireadmin#
   * @param {object} loginData Login data of new user
   * @param {Function} onSuccess Function that runs when the user is successfully authenticated with presence enabled.
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error
   * @example
   * // Signin User with email and password
   * fb.emailAuth({email:test@test.com, password:'testtest'}, function(auth){
   *  console.log('Login Successful for user:', auth.uid);
   * }, function(err){
   *  console.error('Error logging in:', err);
   * });
   */
  Fireadmin.prototype.emailAuth = function(loginData, successCb, errorCb){
    var self = this.ref;
    self.authWithPassword(loginData, function(error, authData) {
      if (error === null) {
        // user authenticated with Firebase
        console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
        // Manage presence
        self.setupPresence(authData.uid);
        // [TODO] Check for account/Add account if it doesn't already exist
        handleCb(successCb, authData);
      } else {
        console.error("Error authenticating user:", error);
        handleCb(errorCb, error);
      }
    });
  };
  /**
  * Gets list of objects created by the currently logged in User.
  * @memberof Fireadmin#
  * @param {String} listName - The name of the list the objects will be grabbed from.
  * @param {Function} onSuccess - Function that runs when the list has been retrieved successfully
  * @param {Fireadmin~errorCb} onError - Function that runs if there is an error.
  * @example
  * // Signin User with email and password
  * fb.listByCurrentUser("messages", function(messageList){
  *  console.log('List of messages by currently logged in user:', messageList);
  * }, function(err){
  *  console.error('Error getting message list:', err);
  * });
  */
  Fireadmin.prototype.listByCurrentUser = function(listName, successCb, errorCb) {
    var auth = this.ref.getAuth();
    if(auth != null) {
      this.ref.child(listName).orderByChild('author').equalTo(auth.uid).on('value', function(listSnap){
        handleCb(successCb, listSnap.val());
      }, function(err){
        handleCb(errorCb, err);
      });
    } else {
      var error = {code:"INVALID_AUTH", message:'listByCurrentUser cannot load list without current user'};
      console.error(error.message);
      handleCb(errorCb, error);
    }
  };
  /**
  * Gets list of objects created by the currently logged in User.
  * @memberof Fireadmin#
  * @param {String | Array} listPath - `Required` The name or path of the list the objects will be grabbed from.
  * @param {String} Uid - `Required` The Uid of the user that created objects.
  * @param {Function} onSuccess - `Not Required` Function that runs when the list has been retrieved successfully
  * @param {Fireadmin~errorCb} onError - `Not Required` Function that runs if there is an error.
  * @example
  * // Signin User with email and password
  * var uid = "simplelogin:1";
  * fb.listByUid("messages", uid, function(messageList){
  *  console.log('List of messages by ' + uid + ' : ', messageList);
  * }, function(err){
  *  console.error('Error getting message list:', err);
  * });
  */
  Fireadmin.prototype.listByUid = function(listPath, uid, successCb, errorCb) {
    this.fbRef(listPath).orderByChild('author').equalTo(uid).on('value', function(listSnap){
      handleCb(successCb, listSnap.val());
    }, function(err){
      handleCb(errorCb, err);
    });
  };
  /**
  * Get count of objects in a given path or list
  * @memberof Fireadmin#
  * @param {String | Array} listPath - The name or path of the list of which to count.
  * @param {Function} onSuccess - Function that runs on completion of gathering list count.
  * @param {Fireadmin~errorCb} onError - Function that runs if there is an error.
  * @example
  * //String list name
  * fa.objectCount("users", function(count){
  *  console.log('There are ' + count + ' users');
  * });
  * //Array list path
  * fa.objectCount(['messages', messageId, 'comments'], function(commentCount){
  *  console.log('There are ' + commentCount + ' comments on the message with id: ' + messageId);
  * });
  */
  Fireadmin.prototype.objectCount = function(listPath, successCb, errorCb){
    var self = this;
    this.fbRef(listPath).on('value', function(usersListSnap){
      handleCb(successCb, usersListSnap.numChildren());
    }, function(err){
      handleCb(errorCb, err);
    });
  };
  /**
  * Get total user count
  * @memberof Fireadmin#
  * @param {Function} onSuccess - Function that returns total user count.
  * @param {Fireadmin~errorCb} onError - Function that runs if there is an error.
  * @example
  * fa.userCount("users", function(count){
  *  console.log('There are is a total of ' + count + ' users.');
  * });
  */
  Fireadmin.prototype.userCount = function(successCb, errorCb){
    this.ref.child('users').on('value', function(usersListSnap){
      handleCb(successCb, usersListSnap.numChildren());
    }, function(err){
      handleCb(errorCb, err);
    });
  };
  /** Get the number of users that are currently online.
  * @memberOf Fireadmin#
  * @param {Function} onSuccess Function that returns number of users currently online
  * @param {Fireadmin~errorCb} onError Function that runs if there is an error
  * @example
  * fa.onlineUserCount(function(count){
  *   console.log('There are ' + count + ' users currently online.');
  * });
  *
  */
  Fireadmin.prototype.onlineUserCount = function(successCb, errorCb){
    this.ref.child('presence').on("value", function(onlineUserSnap){
      console.log('There are currently' + count + ' users online.');
      handleCb(successCb, onlineUserSnap.numChildren());
    }, function(err){
      handleCb(errorCb, err);
    });
  };
  /** Get account for a user given their uid.
  * @memberOf Fireadmin#
  * @param {String} uid Unique Id for account.
  * @param {Function} onSuccess Function that returns account info once it is loaded.
  * @param {Fireadmin~errorCb} onError Function that runs if there is an error.
  * @example
  * // Get account for uid: simplelogin:1
  * fa.accountByUid('simplelogin:1', function(account){
  *   console.log('Account for user with uid: ' + uid + ' is : ', account);
  * }, function(err){
  *    console.error('Error getting account for ' + uid + ' : ', err);
  * });
  *
  */
  Fireadmin.prototype.accountByUid = function(uid, successCb, errorCb){
    this.ref.child(uid).on('value', function(accountSnap){
      handleCb(successCb, accountSnap.val());
    }, function(err){
      console.error('Error getting account for ' + uid + ' : ', err);
      handleCb(errorCb, err);
    });
  };
  /** Get user account that is associated to a given email.
   * @memberOf Fireadmin#
   * @param {String} email Email of account to retreive.
   * @param {Function} onSuccess Function that returns account info once it is loaded.
   * @param {Fireadmin~errorCb} onError Function that runs if there is an error.
   * @example
   * fa.accountByEmail("test@test.com", function(account){
   *   console.log('Account loaded:' + account);
   * }, function(err){
   *  console.error('Error getting account by email:', err);
   * });
   *
   */
  Fireadmin.prototype.accountByEmail = function(email, successCb, errorCb){
    if(email && typeof email == "string"){
      this.ref.child('users').orderByChild('email').equalTo(email).on("value", function(querySnapshot) {
        console.log('accountByEmail returned:', querySnapshot.val());
        handleCb(successCb, querySnapshot.val());
      }, function(err){
        console.error('Error getting account by email:', err);
        handleCb(errorCb, err);
      });
    } else {
      handleCb(errorCb);
    }
  };

  /** Start presence management for a specificed user uid. This function is used within Fireadmin login functions.
  * @memberOf Fireadmin#
  * @param {string} uid Unique Id for user that for which presence is being setup.
  *
  */
  Fireadmin.prototype.setupPresence = function(uid){
    console.log('setupPresence called for uid:', uid);
    var self = this.ref;
    var amOnline = self.child('.info/connected');
    var onlineRef = self.child('presence').child(uid);
    var sessionsRef = self.child('sessions');
    var userRef = self.child('users').child(uid);
    var userSessionRef = self.child('users').child(uid).child('sessions');
    var pastSessionsRef = userSessionRef.child('past');
    amOnline.on('value', function(snapShot){
      if(snapShot.val()) {
        //user is online
        var onDisconnectRef = self.onDisconnect();
        // add session and set disconnect
        var session = sessionsRef.push({began: Firebase.ServerValue.TIMESTAMP, user:uid});
        var endedRef = session.child('ended');
        endedRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        //add correct session id to user
        // adding session id to current list under user's session
        var currentSesh = userSessionRef.child('current').push(session.key());
        // Remove session id from users current session folder
        currentSesh.onDisconnect().remove();
        // remove from presence list
        onlineRef.set(true);
        onlineRef.onDisconnect().remove();
        // Add session id to past sessions on disconnect
        // pastSessionsRef.onDisconnect().push(session.key());
        // Do same on unAuth
        self.onAuth(function(authData){
          if(!authData){
            endedRef.set(Firebase.ServerValue.TIMESTAMP);
            currentSesh.remove();
            onlineRef.remove();
          }
        });
      }
    });
  };

  /** Get a firebase reference for a path in array | string form
  *
  * @memberOf Fireadmin#
  * @param {String|Array} path relative path to the root folder in Firebase instance
  * @returns A Firebase instance
  * @example
  * //Array as path
  * var userRef = fa.fbRef(['users', uid]);
  */
  Fireadmin.prototype.fbRef = function(path){
    var ref = this;
    var args = Array.prototype.slice.call(arguments);
    if( args.length ) {
      //[TODO] Have this return a Fireadmin object
      ref = ref.child(pathRef(args));
    }
    return ref;
  };

  Fireadmin.prototype.sendPushNotificaiton = function(){

  };
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


  