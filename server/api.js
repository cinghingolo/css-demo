var debug = require('debug')('mh-api')

module.exports = {}

module.exports.getUserByUsernamePassword = function(username, password, userIP, cb){
  /***
  * Implementation not needed - Function will be mocked
  * @see test/mock-api
  ***/
}

module.exports.getUserByToken = function(token, autoLoginToken, userIP, cb){
  /***
   * Implementation not needed - Function will be mocked
   * @see test/mock-api
   ***/
}

module.exports.getUserByAutologinToken = function(autoLoginToken, userIP, cb){
  /***
   * Implementation not needed - Function will be mocked
   * @see test/mock-api
   ***/
}

module.exports.logout = function(token, userIP, cb) {
  /***
   * Implementation not needed - Function will be mocked
   * @see test/mock-api
   ***/
}

module.exports.getRelationGroups = function(id, query, user, apiPath, cb){
  /***
   * Implementation not needed - Function will be mocked
   * @see test/mock-api
   ***/
}
