/**
 *  Class to support the concept of Enums in JavaScript.
 */
export var Enum = function () {
  'use strict';

  let self = this;

  /**
   * Takes an Enum object and returns a value Array.
   */
  this.enumToValueList = () => {
    let valueArray = [];
    let keys = Object.keys(self);
    keys.map(key => {
      let item = self[key];
      if (typeof item !== 'function') {
        valueArray.push(item);
      }
    });

    return valueArray;
  };

  this.getType = key => {
    let val = self[key] || null;
    if (!val) {
      console.error('Invalid key passed.  Key = ', key);
    }
    return val;
  };

  this.getTypeFromAlias = alias => {
    let prop;
    for (prop in self) {
      let item = self[prop];
      if (typeof item !== 'function' && item.alias === alias) {
        return item;
      }
    }
    console.error('Invalid alias passed.  Alias = ', alias);
    return null;
  };
};

export var EnumValue = function (key, label, alias) {
  this.key = key;
  this.label = label;
  this.alias = alias;
  this.toString = () => this.label;
  this.equals = (value) => {
    if (value && value.key) {
      return this.key === value.key;
    }
    return false;
  };
};

export var GeneralEnum = (function () {
  'use strict';

  EnumDefs.prototype = Object.create(Enum.prototype);
  EnumDefs.prototype.constructor = EnumDefs;

  function EnumDefs () {
    // Call the parent constructor
    Enum.call(this);

    /**
     * Constant used to represent when a choice of null or NONE is made from an Enum based menu.
     * @type {EnumValue}
     */
    this.NONE = new EnumValue('NONE', 'None', 'none');

    /**
     * Static method that can return values for any passed Enum.
     * Takes an Enum object and returns a value Array.
     * @param obj the Enum object used to supply the values.
     */
    this.enumToValueList = obj => {
      let valueArray = [];
      let keys = Object.keys(obj);
      keys.map(key => {
        let item = obj[key];
        if (typeof item !== 'function') {
          valueArray.push(item);
        }
      });

      return valueArray;
    };

    this.checkInstanceOf = function (obj) {
      return obj instanceof EnumValue;
    };
  }

  let returnValue = new EnumDefs();

  if (typeof Object.freeze === 'function') {
    returnValue = Object.freeze(returnValue);
  }

  return returnValue;
}());
