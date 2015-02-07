goog.require('fa.utils');

goog.require('goog.testing.jsunit');

var testEmpty = function() {
  assertTrue('Fa should be defined', typeof fa.utils != 'undefined');
};