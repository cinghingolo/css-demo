var debug = require('debug')('mh-mock-api')
  , config = require('../config/config')
  , qs = require('query-string')
  , fs = require('fs')
  , User = require('../server/models/user')
  , _ = require('lodash')

module.exports = require('../server/api')

module.exports.getUserByUsernamePassword = function(un, pwd, ip, cb){
  var user = false;
  if (un == 'test@test.ch' && pwd == 'premium') {
    user = User._getPremiumUser()
  } else if (un == 'test@test.ch' && pwd == 'registered') {
    user = User._getRegisteredUser()
  } else if (un == 'test@test.ch' && pwd == 'disabled') {
    user = User._getDisabledUser()
  }
  returnFixture(user, cb, 'getUserByUsernamePassword')
}

module.exports.getUserByToken = function(token, autoLoginToken, userIP, cb){
  debug('lookup user with token %s', token)
  var user = ''
  switch (token) {
    case 'premium-token':
      user = User._getPremiumUser()
      break;
    case '':
      user = User._getDisabledUser()
      break;
    default:
      user = User._getRegisteredUser()
      break;
  }
  user.token = token
  debug('user is guest: ' + user.isGuest())
  debug('user is premium: ' + user.isPremium())
  returnFixture(user, cb, 'getUserByToken')
}

module.exports.logout = function (token, userIP, cb) {
  return cb(null, {})
}


module.exports.getRelationGroups = function(id, query, user, cb){
  // Guest users have no rights to see all data
  if (query.status == 'all' && user.isGuest()) {
      cb(null, [])
  }

  if (!query.activeOnly) {
      query.activeOnly = 'true' // DEFAULT
  }
  if (query.page) {
      query.offset = query.page * 10
      query.page = undefined
  }
  query.limit = 10

  debug('getRelationGroups Request: /' + id + '/relationsGroups?' + qs.stringify(query));
  var relations = require('./fixtures/company-customers.json')

  if (query.activeOnly == 'true') {
    var activeRelations = relations.source.filter(function(relation){
      return relation.issuer && relation.issuer.statusCode && relation.issuer.statusCode.code == 1
    })
  }

  if (query.limit){
    var offset = query.offset != undefined?parseInt(query.offset):0
    var limit = offset + parseInt(query.limit)
    debug('getRelationGroups: slicing fixtures ' + offset + ' to ' + limit)
    var returnedRelations = Object.assign({}, relations)
    returnedRelations.source = activeRelations ? activeRelations.slice(offset,limit) : relations.source.slice(offset, limit)
  }
  returnFixture(returnedRelations, cb, 'getRelationGroups')
}

var returnFixture = function(fixture, cb, caller){
  caller = caller || 'unknown mocked API method'
  var payload = false
  var payloadType = typeof(fixture)
  switch(typeof(fixture)){
    case 'boolean':
      payload = !!fixture
      break;
    case 'string':
      payloadType = 'fixture file'
      payload = require(fixture)
      break;
    // 'object'
    default:
      payload = fixture
      if (_.isArray(payload)){
        payloadType = payload.length + ' objects'
      }
      fixture = JSON.stringify(fixture)
      break;
  }

  setTimeout(function(){
    debug('mocked ' + caller + ': return ' + payloadType + ': ' + fixture)
    cb(null, payload)
  }, 20)
}
