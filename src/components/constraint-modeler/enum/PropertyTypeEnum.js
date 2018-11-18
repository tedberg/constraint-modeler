import { Enum, EnumValue } from './Enum';

/**
 *  Enumeration of supported property types used in Constraints.
 */
export var PropertyTypeEnum = (function () {
  'use strict';

  PropertyType.prototype = Object.create(EnumValue.prototype);
  PropertyType.prototype.constructor = PropertyType;

  function PropertyType (key, label, alias) {
    // Call the parent constructor
    EnumValue.call(this, key, label, alias);
  }

  EnumDefs.prototype = Object.create(Enum.prototype);
  EnumDefs.prototype.constructor = EnumDefs;

  function EnumDefs () {
    // Call the parent constructor
    Enum.call(this);

    this.ALL = new PropertyType('ALL', 'All', 'all');
    this.SINGLE = new PropertyType('SINGLE', 'Single', 'single');
    this.MULTI = new PropertyType('MULTI', 'Multi', 'multi');

    this.checkInstanceOf = function (obj) {
      return obj instanceof PropertyType;
    };
  }

  let returnValue = new EnumDefs();

  if (typeof Object.freeze === 'function') {
    returnValue = Object.freeze(returnValue);
  }

  return returnValue;
}());
