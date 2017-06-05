var test = require('tape')
  , auth = require('../../server/auth')

test('createLoginRedirectUrl() should produce the correct redirect url', function(t){
  t.equal(auth.createLoginRedirectUrl({status:'success'}), '?login=success', 'should work without autoredirect')
  t.equal(auth.createLoginRedirectUrl({status:'success', autoredirect:'path/to/some/place'}), 'path/to/some/place?login=success', 'should work with autoredirect without query parms')
  t.equal(auth.createLoginRedirectUrl({status:'success', autoredirect:'path/to/some/place?param1=foo&param2=bar'}), 'path/to/some/place?login=success&param1=foo&param2=bar', 'should work with autoredirect with query params')
  t.equal(auth.createLoginRedirectUrl({status:'success', autoredirect:'path/to/some/place?a=foo&z=bar'}), 'path/to/some/place?a=foo&login=success&z=bar', 'query params should be sorted alphabetically')
  t.end()
})

test('createLoginRedirectUrl() should use the referrer if the autoredirect is not set', function(t){
  t.equal(auth.createLoginRedirectUrl({status:'success', referrer:'/some/referrer'}), '/some/referrer?login=success', 'should work when autoredirect is not set')
  t.equal(auth.createLoginRedirectUrl({status:'success', autoredirect:'/some/auto/redirect', referrer:'/some/referrer'}), '/some/auto/redirect?login=success', 'should prefer autoredirect over referrer')
  t.equal(auth.createLoginRedirectUrl({status:'success', autoredirect:'/some/auto/redirect?a=foo&b=bar', referrer:'/some/referrer'}), '/some/auto/redirect?a=foo&b=bar&login=success', 'should keep original query params')
  t.end()
})

test('createLoginRedirectUrl() should propagate autofollow Errors correctly', function(t){
  t.equal(auth.createLoginRedirectUrl({status:'success', autoredirect:'/some/auto/redirect', autofollowError:true, referrer:'/some/referrer'}), '/some/auto/redirect?autofollowError=true&login=success', 'autofollowError parameter is correctly set')
  t.equal(auth.createLoginRedirectUrl({status:'success', autofollowError:true, referrer:'/some/referrer'}), '/some/referrer?autofollowError=true&login=success', 'autofollowError parameter is correctly without autoredirect')
  t.end()
})
