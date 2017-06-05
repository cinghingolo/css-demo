var debug = require('debug')('mh-relationBuilder')
  , _ = require('lodash')
  , testUtil = require('../testHelpers')
  , moment = require('moment')

/**
 * Constructor
 * @param numberOfRelations
 * @returns {RelationBuilder}
 * @constructor
 */
var RelationBuilder = function(numberOfRelations){
  this.numberOfRelations = numberOfRelations
  this.shuffleRelations = false
  this.shuffleRoles = false
  this.relationOpts = []
  for(var i=0; i<numberOfRelations; i++){
    this.relationOpts.push({})
  }
  return this
}

/**
 *
 * @returns {RelationBuilder}
 */
RelationBuilder.prototype.withNumberOfRoles = function(){
  var numberOfRoles = _.toArray(arguments)
  for(var i=0; i<numberOfRoles.length; i++){
    var num = numberOfRoles[i]
    this.addRelationOption(i, 'numberOfRoles', num)
  }
  return this
}

/**
 *
 * @returns {RelationBuilder}
 */
RelationBuilder.prototype.withActiveStatus = function(){
  var activeStati = _.toArray(arguments)
  for(var i=0; i<activeStati.length; i++){
    var isActive = activeStati[i]
    this.addRelationOption(i, 'isActive', isActive)
  }
  return this
}

RelationBuilder.prototype.withFunctionCodes = function(){
  var functionCodes = _.toArray(arguments)
  for(var i=0; i<functionCodes.length; i++){
    var functionCode = functionCodes[i]
    this.addRelationOption(i, 'functionCode', functionCode)
  }
  return this
}

/**
 *
 */
RelationBuilder.prototype.shuffle = function(){
  this.shuffleRelations = true
  this.shuffleRoles = true
}

/**
 *
 * @returns {Array}
 */
RelationBuilder.prototype.build = function(){
  copyValuesFromLastElement(this.relationOpts)
  var relations = []
  for(var i=0; i<this.numberOfRelations; i++){
    var relation = this.createRelation(i, this.shuffleRoles)
    relations.push(relation)
  }
  if (this.shuffleRelations){
    testUtil.shuffle(relations)
  }
  return relations
}

/**
 *
 * @param i
 * @returns {{}}
 */
RelationBuilder.prototype.createRelation = function(i){
  var relation = {}
  var opts = this.relationOpts[this.relationOpts.length]
  if (i<this.relationOpts.length){
    opts = this.relationOpts[i]
  }
  relation.roles = this.createRelationRoles(opts);
  return relation;
}

/**
 *
 * @param numberOfRoles
 * @param isActive
 * @returns {Array}
 */
RelationBuilder.prototype.createRelationRoles = function(opts){
  var roles = []
  for(var i=0; i<opts.numberOfRoles; i++){
    var validFrom = moment().subtract(10, 'days').format('YYYY-MM-DD')
    var validTo = opts.isActive?null:moment().add(1, 'days').format('YYYY-MM-DD')

    var role = {
      from: validFrom,
      to: validTo
    }
    role.functionCode = {code: opts.functionCode, key: 'FunctionCode_' + opts.functionCode}
    roles.push(role)
  }

  return roles
}

RelationBuilder.prototype.addRelationOption = function(index, propertyName, propertyValue){
  // override exiting option
  if (index < this.relationOpts.length){
    this.relationOpts[index][propertyName] = propertyValue
  }
  // create new option
  else{
    var opt = {}
    opt[propertyName] = propertyValue
    this.relationOpts[index] = opt
  }
}

/**
 * Copies keys from the last element where a key is set to the following elements
 * @param relationOpts relation options array
 */
function copyValuesFromLastElement(relationOpts){
  var defaults = {}
  // find defaults
  relationOpts.forEach(function(opt){
    Object.keys(opt).forEach(function(key){
      if (!defaults[key]){
        var last = findLast(relationOpts, key)
        defaults[key] = last[key]
      }
    })
  })
  relationOpts.forEach(function(opt){
    Object.keys(defaults).forEach(function(key){
      if(opt[key] == undefined){
        opt[key] = defaults[key]
      }
    })
  })
}

/**
 * Finds the last element in {arr} where {key} is set
 * @param arr an array
 * @param key a key
 * @returns last element
 */
function findLast(arr, key){
  var last = undefined
  arr.forEach(function(elem){
    if(elem[key] != undefined){
      last = elem
    }
  })
  return last
}

module.exports = function(numberOfRelations){
  return new RelationBuilder(numberOfRelations)
}
