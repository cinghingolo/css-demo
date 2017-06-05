var debug = require('debug')('mh-client-i18n')

// Assumes that this happens _after_ page load.
// Order of footer scripts is _important_
var strings =JSON.parse(document.getElementById('i18n-strings').innerHTML)

debug(strings);

/**
 * translation function for browser strings. The function can take several more arguments for substitution
 * @param k the string to translate
 * @param arguments remaining arguments will be used to replace occurrences of '%s' in the translated string
 *        whereas the last one will be reused, if there are more occurrences than replace-arguments
 */
var __ = module.exports = function(k){
  if (!strings[k]) {
    debug('Error, missing client translation for', k)
  }
  if (strings[k] && containsSubstitution(strings[k]) && arguments.length > 1){
    var replaceArgs = Array.prototype.slice.call(arguments, 1)
    var result = simpleSubstitute(strings[k], replaceArgs)
    return result
  }

  return strings[k] || k;
}

/**
 * check if translations string contains '%s' (for substitution)
 * @param str
 * @returns {boolean}
 */
function containsSubstitution(str){
  if (!str || !str.indexOf){
    return false
  }

  return str.indexOf('%s') > -1
}

/**
 * Replaces occurrences of '%s' inside a string with values from an array. The last value of the array will be reused, if there
 * are more occurrences than values.
 * @param str the string with the occurrences of '%s'
 * @param replaces the values to use to replace the occurrences
 * @returns {*} the string with replaced occurrences
 */
function simpleSubstitute(str, replaces){
  var ixRepl = 0;
  var currentRepl;
  while(str.indexOf('%s') > -1){
    // take next replace argument or re-use last one if exhausted
    currentRepl = ixRepl < replaces.length?replaces[ixRepl]:currentRepl
    str = replaceIndex(str, str.indexOf('%s'), currentRepl)
    ixRepl++
  }
  return str;
}

/**
 * get indices of a substring inside another string
 * @param searchStr the string to search for
 * @param str the string to search in
 * @param caseSensitive whether the search should be case sensitive or not
 * @returns {Array} array of indices that mark the beginning of searchStr
 */
/*
function getIndicesOf(searchStr, str, caseSensitive) {
  var startIndex = 0, searchStrLen = searchStr.length;
  var index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}
*/

/**
 * replace nth occurrence of '%s' inside a string
 * @param string the string to search for occurrences of '%s'
 * @param at n (as in n-th occurence)
 * @param repl the string to replace the n-th occurence with
 * @returns string the string with the n-th occurence of '%s' replaced with repl
 */
function replaceIndex(string, at, repl) {
  if(!string){
    return ''
  }
  return string.replace("%s", function(match, i) {
    if( i === at ) {
      return repl;
    }

    return match;
  });
}
