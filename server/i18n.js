var i18n = require('i18n')
  , debug = require('debug')('mh-i18n')
  , path = require('path')
  , config = require('../config/config')

var LOCALES = ['de', 'en', 'fr', 'it']

// regex to detect email-links (see http://emailregex.com/)
var EMAIL_REGEX = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i

i18n.configure({
  // setup some locales - other locales default to de silently
  locales: LOCALES,
  defaultLocale: 'de',
  // where to store json files - defaults to './locales'
  directory: path.join(__dirname, '../content/locales'),
  updateFiles: false,
  autoReload: true
});

module.exports = function(req, res, next) {

  var locale = 'de' // By default

  /**
   * Parse Request url to detect locale
   * - locale will be set to the /[locale]/-Portion of the path
   * - res.locals.unlocalizedPath will be set to the *unlocalized* portion of the path
   * Example 1: http://www.moneyhouse.ch/fr/creditrating
   * - locale=fr
   * - res.locals.path = /de/creditrating
   * - res.locals.unlocalizedPath = /creditrating
   * Example 2: http://www.moneyhouse.ch/creditrating
   * - locale=de (default locale)
   * - res.locals.path = /de/creditrating
   * - res.locals.unlocalizedPath = /creditrating
   *
   * Hint: don't use Array.forEach(...) as it does not allow breaking the loop!
   */
  LOCALES.every(function(l){
    var match = req.url.match( new RegExp("^\/(" +  l +  ")([\/\?].*)?$", "i"));
    if (match){
      locale = match[1]
      req.url =  match[2] || '/'
      return false
    }
    return true
  })


  res.locals.translationMode = process.env.TRANSLATION_MODE
//  debug('translationMode: ' + (res.locals.translationMode || 'off'))

  res.locals.unlocalizedPath = req.url
  res.locals.LOCALES = LOCALES

  i18n.setLocale(req, locale)

  res.locals.__ = res.__ = function() {
    if (process.env.TRANSLATION_MODE && arguments && arguments['0']){
      var key = arguments['0']
      return '{{__phrase_' + key + '__}}'
    }
    return i18n.__.apply(req, arguments);
  };

  res.locals.__n = res.__n = function() {
    return i18n.__n.apply(req, arguments);
  }

  res.locals.getLocale = res.getLocale = function() {
    return i18n.getLocale.apply(req);
  };

  /**
   * Creates an URL to use in links
   * - automatic detecting/handling of void/javascript-URLs
   * - automatic detecting of E-Mail mailtos
   * - automatic localisation of URLs
   *
   * An absolute URL (starting from the root/host) will be created.
   *
   * @param url
   * @returns {*}
   */
  res.locals.createUrl = function(url){
    if (!url){
      return 'javascript:void(0)'
    }

    // email address:
    if (EMAIL_REGEX.test(url)){
      return 'mailto:' + url
    }
    // empty url
    if (url.length == 0 || url.indexOf('#') == 0){
      return 'javascript:void(0)'
    }
    // javascript url
    if (url.indexOf('javascript:') == 0 ){
      return url
    }
    // external url
    if (url.indexOf('http') == 0){
      return url
    }

    // replace double slashes that might occur when concatenating paths
    url = url.replace('//', '/')

    // default: create localized version of the URL
    return '/' + res.getLocale() + url
  }

  res.locals.createInternationalUrl = function(url, locale){
    if (url === null || url === undefined){
      return url
    }

    // don't localize if path is already localized
    var localePrefix = '/' + locale
    if (url.indexOf(localePrefix) === 0){
      return url
    }

    return '/' + locale + url
  }

  // Add here browser strings to be translated
  res.locals.browserI18nStrings = {}
  var keys = ['API Error']

  keys.forEach(function(k) {
    res.locals.browserI18nStrings[k] = res.locals.__(k)
  })

  /**
   * Routes with /de language prefix are somehow not working on the php site, so the link should not contain the
   * locale in the path when locale is 'de'
   * Elsewhere 'fr/en/it' should be in the url path
   */
  function getLocalePrefix() {
    if (res.locals.getLocale() != 'de') {
      return '/' + res.locals.getLocale()
    }
    return '';
  }

  return next();
};
