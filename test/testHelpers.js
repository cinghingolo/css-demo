var debug = require('debug')('test-helpers')
  , moment = require('moment')

moment.locale('de')

/**
 * helper function to check if properties from a reference object exist in a candidate object and have the same value
 * comparison is done non-strictly by value. If a property is an object, the function recurses to compare nested properties.
 * The function does not consider properties that are only present in the candidate object!
 * @param candidate candidate object
 * @param reference reference object
 * @param t (optional) test object for debug output
 * @param previousKey (optional) previous key used for recursion
 * @returns {boolean}
 *  - true if all the properties from the reference objects exist in the candidate object with the same value
 *  - false if at least one property does not exist in the candidate object or has a different value
 */
module.exports.propertiesAreEqual = function(candidate, reference, t, previousKey){
  previousKey = previousKey || ''
  log.t = log.t || t
  for(var key of Object.keys(reference)){
    var currentKey = (previousKey.length > 0?previousKey + '.':'') + key
    var currentKeyStr = '[\'' + currentKey.split('.').join('\'][\'') + '\']'

    // property does not exist on candidate
    if (!candidate[key]){
      log('candidate' + currentKeyStr  + ' is falsy' + ' (' + candidate[key] + ')')
      return false
    }

    // recursion for nested properties
    if (typeof reference[key] == 'object'){
      var nestedAreEqual = module.exports.propertiesAreEqual(candidate[key], reference[key], t, currentKey)
      if (!nestedAreEqual){
        log('nested properties are not equal')
        return false
      }
      else continue
    }

    log('candidate' + currentKeyStr + '=' + candidate[key] + ' should be ' + reference[key])

    if (candidate[key] !== reference[key]){
      log('candidate' + currentKeyStr + '=' + candidate[key] + ' is not equal to ' + reference[key])
      return false
    }
  }
  return true
}

var log = function(message){
  if (log.t) log.t.comment(message)
  else debug(message)
}

/**
 * Create a validity object with a start (validFrom)-Date and an end (validTo)-date
 * @param mustBeValidToday
 * @returns {{validFrom: string, invalidFrom: string}}
 */
module.exports.createValidity = createValidity = function(mustBeValidToday){
  //var days1 = getRandomInt(1,365)
  var validFrom = moment().subtract(10, 'days')
  var invalidFrom = mustBeValidToday?moment().add(10, 'days'):moment()
  var validity = {
    validFrom: validFrom.format('YYYY-MM-DD'),
    invalidFrom: invalidFrom.format('YYYY-MM-DD')
  }
  return validity
}

/**
 * shuffles an array of elements in place
 * @param arr the array to shuffle
 */
module.exports.shuffle = shuffle = function(arr) {
  var j, x, i;
  for (i = arr.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = arr[i - 1];
    arr[i - 1] = arr[j];
    arr[j] = x;
  }
}

/**
 * creates a random number between min (inclusive) and max (inclusive)
 * @param min lower bound
 * @param max upper bound
 * @returns {*} a random number
 */
module.exports.getRandomInt = getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min +1)) + min;
}

/**
 * cuts a string till the last occurrence of a character. If the character is not present, the whole string is returned
 * @param str, string to cut
 * @param char, character to search
 * @returns string
 */
module.exports.cutStringTillLastCharOccurence = cutStringTillLastCharOccurrence = function(str, char) {
  var i = str.lastIndexOf(char);
  return (i > 0) ? str.substring(0, i) : str
}
