var test = require('tape')
  , fork = require('child_process').fork
  , request = require('superagent')

var server

test('setup server with fixtures', function(t){
  server = fork(__dirname + '/run-server', {stdio: 'pipe'})
  setTimeout(function(){
    t.end()
  }, 1000)
})


test('GET /does/not/exist', function(t){
  request
    .get('http://localhost:3000/does/not/exist')
    .end(function(err, resp){
      t.ok(err)
      t.equal(resp.status, 404)
      t.end()
    })
})

test('auth: bad password', function(t){
  request
    .post('http://localhost:3000/login')
    .send({
      username: 'test@test.ch'
      , password: 'incorrect'
    })
    .set('Accept', 'application/json')
    .end(function(err, resp){
      //t.error(err)
      t.equal(resp.status, 401)
      t.end()
    })
})

test('auth: good password', function(t){
  request
    .post('http://localhost:3000/login')
    .send({
      username: 'test@test.ch'
      , password: 'registered'
    })
    .set('Accept', 'application/json')
    .end(function(err, resp){
      t.error(err)
      t.equal(resp.status, 200)
      t.end()
    })
})

test('auth: logout', function(t){
  request
    .get('http://localhost:3000/logout')
    .end(function(err, resp){
      t.error(err)
      t.equal(resp.status, 200)
      t.end()
    })
})


var testPageOk = function(url){
  return test('GET ' + url, function(t){
    request
      .get('http://localhost:3000' + url)
      .end(function(err, resp){
        t.error(err)
        t.ok(resp)
        t.equal(resp.status, 200)
        t.end()
      })
  })
}

;([
    '/'
  , '/version'
  , '/de/companies/lausanne'
]).map(testPageOk)



/**
 * Ensure unlocalized companies URLs are redirected to their localized versions
 */
var testUnlocalizedPagesAreRedirected = function(obj){
  return test('Test redirect of unlocalized entity URLs: ' + obj.url, function(t){
    request
      .get('http://localhost:3000' + obj.url)
      .end(function(err, resp){
        var expectedRedirectUrl = 'http://localhost:3000' + obj.redirectedTo
        t.error(err)
        t.ok(resp)
        t.equal(resp.status, 200)
        t.equal(resp.redirects.length, 1)
        t.true(resp.redirects.indexOf(expectedRedirectUrl) > -1, obj.url + ' should be redirected to ' + obj.redirectedTo)
        t.end()
    })
  })
};
([
  {url: '/companies/lausanne', redirectedTo: '/de/companies/lausanne'}
]).map(testUnlocalizedPagesAreRedirected)

test('kill test server', function(t){
  server.kill()
  t.end()
})
