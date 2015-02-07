goog.require('fa.utils');

goog.require('goog.testing.jsunit');

var testStringifyVersion = function() {
  assertEquals('222', fa.utils.stringifyVersion("2.2.2"));
};
var testHandleCb = function() {
	var cb = function(){
		console.log('callback');
	}
  assertEquals('Callback equals callback', cb, fa.utils.handleCb(cb));
};