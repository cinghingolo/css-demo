// Assumes that this happens _after_ page load.
// Order of footer scripts is _important_

module.exports = JSON.parse(document.getElementById('mh_user').innerHTML)

require('debug')('mh-client-user')(module.exports);


