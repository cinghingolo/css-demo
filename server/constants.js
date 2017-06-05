var debug = require('debug')('mh-constants')

module.exports = function(locals){

  locals.REGIONALCITIES = [
    {region: 'Stadt Zürich', uri: 'zuerich' },
    {region: 'Stadt Genf', uri: 'genf' },
    {region: 'Stadt Basel', uri: 'basel' },
    {region: 'Stadt Lausanne', uri: 'lausanne' },
    {region: 'Stadt Bern', uri: 'bern' },
    {region: 'Stadt Winterthur', uri: 'winterthur' },
    {region: 'Stadt Luzern', uri: 'luzern' },
    {region: 'Stadt St. Gallen', uri: 'st-gallen' },
    {region: 'Stadt Lugano', uri: 'lugano' },
    {region: 'Stadt Biel', uri: 'biel' }
  ]

  /**
   * Capitalize first letter of a string taking care of performances
   * See http://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
   * This function is useful to avoid key duplications (same key with capital first letter) in the translation data
   * @param string
   * @returns {string} Capitalized string
   */
  locals.capitalize = function(string){
    if (!string) {
      return string
    }
    return string[0].toUpperCase() + string.slice(1);
  }

  /**
   * Make first letter of a string to lower case
   * @param string
   * @returns {string} String with lower case initial
   */
  locals.lowerCaseFirst = function(string){
    if (!string) {
      return string
    }
    return string[0].toLowerCase() + string.slice(1);
  }
}
