var csvStringify = require('csv-stringify')

var DE = require('../content/locales/de.json')
  , EN = require('../content/locales/en.json')
  , FR = require('../content/locales/fr.json')
  , IT = require('../content/locales/it.json')

var locales = {de: DE, en: EN, fr: FR, it: IT}
  , out = {}

Object.keys(locales).forEach( (l) => { 
  var tr = locales[l]
  Object.keys(tr).forEach( (key) => {
    if (!out[key]){
      out[key] = {}
    }

    out[key][l] = tr[key]
  })
})


var data = Object.keys(out).map( (k) => {
  return [
    k
  , out[k].de || k // Default is de
  , out[k].en || ''
  , out[k].fr || ''
  , out[k].it || ''
  ]
})

csvStringify(
  data,
  { 
    header: true
  , delimiter:'\t'
  , columns: ['KEY', 'DE', 'EN', 'FR', 'IT']
  },
  (err, csv) => {
    console.log(csv)
  }
)

