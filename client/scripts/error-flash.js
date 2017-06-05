var $ = require('jquery')
  , __ = require('./i18n')
  , debug = require('debug')('mh-error-flash')


var flashHash = function (){
  // Check the location hash for flash-error=:id and if so, trigger an
  // error popup
  if (location.hash && location.hash.indexOf('flash-error') > 0){
    var id = location.hash.match(/flash-error=(.*)/)
    if (id && id[1]){
      debug(id[1]);
      flashError(id[1])
    }
  }
}

$(flashHash);


var flashError = module.exports = function(message) {
    var msg = __(message)
      , $err = $("<div class='error-popup' />")

    $err.text(msg)

    $(document.body).append($err)
    setTimeout(function(){ $err.remove() }, 1000)

}
