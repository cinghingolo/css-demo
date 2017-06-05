var debug = require('debug')('mh-user')

/**
 * The User module wraps the mh user object coming from the backend, adding rbac rules and methods to gather
 * objects like Notifications, Subscriptions and everything else that's user related
 */

/**
 * @param user Object, the mh user object coming from the backend
  {
    "id": 737903,
    "username": "roland.vonrotz@moneyhouse.ch",
    "email": "roland.vonrotz@moneyhouse.ch",
    "gender": "m",
    "name": "Roland Von Rotz",
    "firstName": "Roland",
    "lastName": "Von Rotz",
    "language": "de",
    "phpAutologinTokenRaw": "5545d02d1144b423fb2a768be0e860cb7f23525",
    "admin": true,
    "premium": true,
    "disabled": "true",
    "disabledReason": "invalid userdata(plz)",
    "token": "24636ovjvlf4cllbdkhnscghd60457d7bjfwip42u9t71t4ihbd3ije",
    "phpAutologinToken": "cb7f5d02d1144d60457dd60457d5782405762894",
  }
 *
 * @param isAuthenticated boolean, whether the user is authenticated
 * @constructor
 */
var User = function(user, isAuthenticated) {
  this.user = user;
  this.id = this.user.id
  this.username = this.user.username
  this.isAuthenticated = this.isInvalid() ? false : !!isAuthenticated;  // Authentication will be not granted to invalid users
  this.phpAutologinToken = user.phpAutologinToken
  this.token = user.token
  this.notifications = [];
}

// Rule will apply to unregistered users
User.prototype.isGuest = function() {
  return !this.isAuthenticated
}

User.prototype.getId = function() {
  return this.id
}

User.prototype.getCreated = function() {
  return this.user.created
}

User.prototype.getFirstLogin = function() {
  return this.user.firstLogin
}

User.prototype.getEmailAddress = function() {
  return this.user.email
}

User.prototype.isPremium = function(){
  return this.user.premium && !this.isGuest()
}

User.prototype.isAdmin = function(){
  return this.user.admin
}

User.prototype.isDisabled = function(){
  return this.user.disabled || false;
}

User.prototype.hasEmptyToken = function(){
 return !this.user.token
}

User.prototype.isInvalid = function(){
  return this.isDisabled() || this.hasEmptyToken()
}

User.prototype.getGender = function() {
  return this.user.gender
}

User.prototype.getName = function() {
  return this.user.name
}

User.prototype.getFirstName = function() {
  return this.user.firstName
}

User.prototype.getLastName = function() {
  return this.user.lastName
}

User.prototype.getLanguage = function() {
  return this.user.language
}

User.prototype.getFunction = function() {
  return this.user.function
}

User.prototype.getDivision = function() {
  return this.user.division
}

User.prototype.getUsage = function() {
  return this.user.usage
}

User.prototype.follows = function(entity) {
  // This is designed to be called from templates so it must be _synchronous_
  // therefore we have to rely on a previously populated cache.
  /*
  if (this.followsCache === undefined){
    throw new Error('User.follows called on an unprimed cache')
  }
  */
  if (!this.isAuthenticated) {
    return false
  }

  this.followsCache = this.followsCache || {}

  debug('User follows', entity, this.followsCache[entity])
  return this.followsCache[entity]
}

User.prototype.toBrowserJSON = function(){
  // NB. IMPORTANT - This needs to generate _safe_ json.
  return JSON.stringify({
    id: this.id
  , authenticated: this.isAuthenticated
  , premium: this.isPremium()
  })
}

function getNotifications() {
  return [
    {title: 'Architekturbüro Müler AG', text: 'Änderung der Bonität', href: '#TODO'},
    {title: 'Architekt Michlin AG', text: 'Änderung der Zahlungsweise', href: '#TODO'},
    {title: 'Bauunternehmen Häberli', text: 'Änderung der Zahlungswiese', href: '#TODO'}
  ]
}

function getPremiumNotifications() {
 return [
   {title: 'Meyer AG', text: 'Änderung der Bonität', href: '#TODO'},
   {title: 'Bauunternehmen Häberli', text: 'Änderung der Zahlungswiese', href: '#TODO'},
   {title: 'Architekt Hoffman AG', text: 'Änderung der Zahlungsweise', href: '#TODO'}
 ]
}

module.exports = User;

module.exports._getPremiumUser = function(){
 //debug('getPremiumUser return premium user fixture file: /fixtures/user-premium.json')
 var u = new User(require('../../test/fixtures/user-premium.json'), true)
 u.token = 'premium-token'
 return u
}

module.exports._getRegisteredUser = function(){
  //debug('getRegisteredUser return registered user fixture file: /fixtures/user-registered.json')
  var u = new User(require('../../test/fixtures/user-registered.json'), true)
  u.token = 'registered-token'
  return u
}

module.exports._getDisabledUser = function(){
  //debug('getDisabledUser return disabled user fixture file: /fixtures/user-disabled.json')
  var u = new User(require('../../test/fixtures/user-disabled.json'), true)
  return u
}
