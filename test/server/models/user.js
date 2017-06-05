var test = require('tape')
  , User = require('../../../server/models/user')

test('test basic user attributes', function(t){
  var userJson = require('../../fixtures/user-registered.json')
  var user = new User(userJson)
  t.equal(user.getId(), userJson.id)
  t.equal(user.username, userJson.username)
  t.equal(user.getEmailAddress(), userJson.email)
  t.equal(user.getGender(), userJson.gender)
  t.equal(user.getName(), userJson.name)
  t.equal(user.getFirstName(), userJson.firstName)
  t.equal(user.getLastName(), userJson.lastName)
  t.equal(user.getLanguage(), userJson.language)
  t.equal(user.phpAutologinToken, userJson.phpAutologinToken)
  t.equal(user.user, userJson)
  t.end()
})

test('test isPremium()', function(t){
  var user = new User(require('../../fixtures/user-premium.json'))
  t.false(user.isPremium(), 'premium user that is not authenticated is not premium')

  user = new User(require('../../fixtures/user-premium.json'), false)
  t.false(user.isPremium(), 'premium user that is not authenticated is not premium')

  user = new User(require('../../fixtures/user-premium.json'), true)
  t.true(user.isPremium(), 'premium user that is authenticated is premium')
  t.end()
})

test('test isGuest()', function(t){
  var userJson = require('../../fixtures/user-registered.json')
  var user = new User(userJson)
  t.true(user.isGuest(), 'unauthenticated user is guest')

  user = new User(userJson, false)
  t.true(user.isGuest(), 'unauthenticated user is guest')

  var user = new User(userJson, true)
  t.false(user.isGuest(), 'authenticated user is not guest')
  t.end()
})

test('test registered user', function(t){
  var registeredUser = new User(require('../../fixtures/user-registered.json'), true)
  t.false(registeredUser.isGuest(), 'registered user is not a guest')
  t.false(registeredUser.isPremium(), 'registered user is not premium')
  t.end()
})

test('test premium user', function(t){
  var premiumUser = new User(require('../../fixtures/user-premium.json'), true)
  t.false(premiumUser.isGuest(), 'premium user is not a guest')
  t.true(premiumUser.isPremium(), 'premium user is premium')
  t.end()
})

test('test disabled user', function(t){
  var disabledUser = new User(require('../../fixtures/user-disabled.json'), true)
  t.true(disabledUser.isGuest(), 'disabled user is a guest')
  t.false(disabledUser.isPremium(), 'disabled user is not premium')
  t.true(disabledUser.hasEmptyToken(), 'disabled user has empty token')
  t.true(disabledUser.isInvalid(), 'disabled user is invalid')
  t.true(disabledUser.isDisabled(), 'disabled user is disabled')
  t.end()
})

test('test invalid user', function(t){
  var invalidUser = new User(require('../../fixtures/user-invalid.json'), true)
  t.true(invalidUser.isGuest(), 'invalid user is a guest')
  t.false(invalidUser.isPremium(), 'invalid user is not premium')
  t.true(invalidUser.hasEmptyToken(), 'invalid user has empty token')
  t.true(invalidUser.isInvalid(), 'invalid user is invalid')
  t.false(invalidUser.isDisabled(), 'invalid user is not disabled')
  t.end()
})

test('test admin user', function(t){
  var adminUser = new User(require('../../fixtures/user-admin.json'), true)
  t.false(adminUser.isGuest(), 'admin user is not a guest')
  t.true(adminUser.isAdmin(), 'admin user is admin')
  t.end()
})
