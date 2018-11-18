import { Enum, EnumValue } from './Enum';

/**
 *  Enumeration of supported data types used in Constraints.
 */
export var DataTypeEnum = (function () {
  'use strict';

  DataType.prototype = Object.create(EnumValue.prototype);
  DataType.prototype.constructor = DataType;

  function DataType (key, label, alias) {
    // Call the parent constructor
    EnumValue.call(this, key, label, alias);
  }

  EnumDefs.prototype = Object.create(Enum.prototype);
  EnumDefs.prototype.constructor = EnumDefs;

  function EnumDefs () {
    // Call the parent constructor
    Enum.call(this);

    this.STRING = new DataType('STRING', 'String', 'string');
    this.NUMBER = new DataType('NUMBER', 'Number', 'number');
    this.BOOLEAN = new DataType('BOOLEAN', 'Boolean', 'boolean');
    this.DATE = new DataType('DATE', 'Date', 'date');
    this.ENUM = new DataType('ENUM', 'Enum', 'enum');
    this.URL = new DataType('URL', 'Url', 'url');
    this.OBJECT = new DataType('OBJECT', 'Object', 'object');
    this.LOB = new DataType('LOB', 'Lob', 'lob');
    this.COLLECTION = new DataType('COLLECTION', 'Collection', 'collection');

    let self = this;

    this.getTypeFromAlias = function (alias) {
      let prop;
      for (prop in self) {
        let item = self[prop];
        if (typeof item !== 'function' && item.alias === alias) {
          return item;
        }
      }

      // Check alternate, supported aliases
      if (alias === 'integer' || alias === 'int' || alias === 'float') {
        return self.NUMBER;
      }

      console.error('Invalid alias passed.  Alias = ', alias);
      return null;
    };

    this.checkInstanceOf = function (obj) {
      return obj instanceof DataType;
    };
  }

  let returnValue = new EnumDefs();

  if (typeof Object.freeze === 'function') {
    returnValue = Object.freeze(returnValue);
  }

  return returnValue;
}());
