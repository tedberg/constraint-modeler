import { Enum, EnumValue } from './Enum';
import { DataTypeEnum } from './DataTypeEnum';
import { PropertyTypeEnum } from './PropertyTypeEnum';

/**
 *  Enumeration of supported comparison types used in Constraints.
 */
export var ComparisonTypeEnum = (function (DataTypeEnum, PropertyTypeEnum) {
  'use strict';

  ComparisonType.prototype = Object.create(EnumValue.prototype);
  ComparisonType.prototype.constructor = ComparisonType;

  function ComparisonType(key, label, alias, expectedNumberOfObjectValues, dataTypeRestrictionGroup, propertyTypeRestrictionGroup) {
    // Call the parent constructor
    EnumValue.call(this, key, label, alias);

    this.expectedNumberOfObjectValues = expectedNumberOfObjectValues;
    this.dataTypeGroup = dataTypeRestrictionGroup;
    if (propertyTypeRestrictionGroup) {
      this.propertyType = propertyTypeRestrictionGroup;
    } else {
      this.propertyType = PropertyTypeEnum.ALL;
    }
  }

  let dataTypeGroup = {  // TODO: Collection type was added, not covered here
    ALL: [DataTypeEnum.STRING, DataTypeEnum.NUMBER, DataTypeEnum.BOOLEAN, DataTypeEnum.DATE, DataTypeEnum.ENUM, DataTypeEnum.URL, DataTypeEnum.OBJECT, DataTypeEnum.LOB],
    NON_BOOLEAN: [DataTypeEnum.STRING, DataTypeEnum.NUMBER, DataTypeEnum.DATE, DataTypeEnum.ENUM, DataTypeEnum.URL],
    NON_OBJECT: [DataTypeEnum.STRING, DataTypeEnum.NUMBER, DataTypeEnum.BOOLEAN, DataTypeEnum.DATE, DataTypeEnum.ENUM, DataTypeEnum.URL],
    ORDERED: [DataTypeEnum.NUMBER, DataTypeEnum.DATE],
    STRING: [DataTypeEnum.STRING],
    STRING_AND_LOB: [DataTypeEnum.STRING, DataTypeEnum.LOB],
    OBJECT: [DataTypeEnum.OBJECT]
  };

  function isDataTypeInGroup(dataType, group) {
    if (typeof dataType === 'undefined' || typeof group === 'undefined' || dataType === null || group === null) {
      return false;
    } else if (group === dataTypeGroup.ALL) {
      return true;
    } else if (group === dataTypeGroup.ORDERED) {
      return (dataType === DataTypeEnum.NUMBER || dataType === DataTypeEnum.DATE);
    } else if (group === dataTypeGroup.STRING) {
      return dataType === DataTypeEnum.STRING;
    } else if (group === dataTypeGroup.STRING_AND_LOB) {
      return (dataType === DataTypeEnum.STRING || dataType === DataTypeEnum.LOB);
    } else if (group === dataTypeGroup.NON_BOOLEAN) {
      return dataType !== DataTypeEnum.BOOLEAN && dataType !== DataTypeEnum.OBJECT && dataType !== DataTypeEnum.LOB;
    } else if (group === dataTypeGroup.NON_OBJECT) {
      return dataType !== DataTypeEnum.OBJECT && dataType !== DataTypeEnum.LOB;
    } else if (group === dataTypeGroup.OBJECT) {
      return dataType === DataTypeEnum.OBJECT;
    } else {
      return false; // Error
    }
  }

  function isPropertyTypeInGroup(propertyType, group) {
    if (typeof propertyType === 'undefined' || propertyType === null) {
      return true;
    } else if (group === PropertyTypeEnum.ALL) {
      return true;
    } else if (group === PropertyTypeEnum.SINGLE) {
      return (propertyType === PropertyTypeEnum.SINGLE);
    } else if (group === PropertyTypeEnum.MULTI) {
      return propertyType === PropertyTypeEnum.MULTI;
    } else {
      return false; // Error
    }
  }

  EnumDefs.prototype = Object.create(Enum.prototype);
  EnumDefs.prototype.constructor = EnumDefs;

  function EnumDefs() {
    // Call the parent constructor
    Enum.call(this);

    this.EQUAL = new ComparisonType('EQUAL', 'Equal', 'eq', 1, dataTypeGroup.NON_OBJECT, PropertyTypeEnum.SINGLE);
    this.NOT_EQUAL = new ComparisonType('NOT_EQUAL', 'Not Equal', 'ne', 1, dataTypeGroup.NON_OBJECT, PropertyTypeEnum.SINGLE);
    this.GT = new ComparisonType('GT', 'Greater Than', 'gt', 1, dataTypeGroup.ORDERED, PropertyTypeEnum.SINGLE);
    this.GTE = new ComparisonType('GTE', 'Greater Than or Equal', 'gte', 1, dataTypeGroup.ORDERED, PropertyTypeEnum.SINGLE);
    this.LT = new ComparisonType('LT', 'Less Than', 'lt', 1, dataTypeGroup.ORDERED, PropertyTypeEnum.SINGLE);
    this.LTE = new ComparisonType('LTE', 'Less Than or Equal', 'lte', 1, dataTypeGroup.ORDERED, PropertyTypeEnum.SINGLE);
    this.BETWEEN = new ComparisonType('BETWEEN', 'Between', 'between', 2, dataTypeGroup.ORDERED, PropertyTypeEnum.SINGLE);
    this.NOT_BETWEEN = new ComparisonType('NOT_BETWEEN', 'Not Between', 'notbetween', 2, dataTypeGroup.ORDERED, PropertyTypeEnum.SINGLE);
    this.IN = new ComparisonType('IN', 'In', 'in', 10, dataTypeGroup.NON_BOOLEAN, PropertyTypeEnum.SINGLE);
    this.NOT_IN = new ComparisonType('NOT_IN', 'Not In', 'notin', 10, dataTypeGroup.NON_BOOLEAN, PropertyTypeEnum.SINGLE);
    this.IN_LIST = new ComparisonType('IN_LIST', 'In List', 'inlist', 1, dataTypeGroup.STRING, PropertyTypeEnum.SINGLE);
    this.NOT_IN_LIST = new ComparisonType('NOT_IN_LIST', 'Not In List', 'notinlist', 1, dataTypeGroup.STRING, PropertyTypeEnum.SINGLE);
    this.LIKE = new ComparisonType('LIKE', 'Like', 'like', 1, dataTypeGroup.STRING_AND_LOB, PropertyTypeEnum.SINGLE);
    this.NOT_LIKE = new ComparisonType('NOT_LIKE', 'Not Like', 'notlike', 1, dataTypeGroup.STRING_AND_LOB, PropertyTypeEnum.SINGLE);
    this.NULL = new ComparisonType('NULL', 'Is Null', 'null', 0, dataTypeGroup.ALL, PropertyTypeEnum.SINGLE);
    this.NOT_NULL = new ComparisonType('NOT_NULL', 'Is Not Null', 'notnull', 0, dataTypeGroup.ALL, PropertyTypeEnum.SINGLE);
    this.EMPTY = new ComparisonType('EMPTY', 'Is Empty', 'empty', 0, dataTypeGroup.OBJECT, PropertyTypeEnum.MULTI);
    this.NOT_EMPTY = new ComparisonType('NOT_EMPTY', 'Is Not Empty', 'notempty', 0, dataTypeGroup.OBJECT, PropertyTypeEnum.MULTI);
    //this.MEMBER_OF = new ComparisonType('MEMBER_OF', 'Contains', 'memberof', 1, dataTypeGroup.NON_OBJECT, PropertyTypeEnum.SINGLE);
    //this.NOT_MEMBER_OF = new ComparisonType('NOT_MEMBER_OF', 'Does not Contain', 'notmemberof', 1, dataTypeGroup.NON_OBJECT, PropertyTypeEnum.SINGLE);
    // TODO: MemberOf applies to single fields whose parent object is a multi property.

    let self = this;

    this.getAllForDataType = function (dataType, propertyType) {
      let valueArray = [];
      let prop;
      for (prop in self) {
        let item = self[prop];
        if (typeof item !== 'function' && isDataTypeInGroup(dataType, item.dataTypeGroup)) {
          if (propertyType) { // Caller wants to restrict to propertyType
            if (isPropertyTypeInGroup(propertyType, item.propertyType)) {
              valueArray.push(item);
            }
          } else { // Caller didn't specify propertyType to restrict on
            valueArray.push(item);
          }
        }
      }

      return valueArray;
    };

    this.checkInstanceOf = function (obj) {
      return obj instanceof ComparisonType;
    };

  }

  let returnValue = new EnumDefs();

  if (typeof Object.freeze === 'function') {
    returnValue = Object.freeze(returnValue);
  }

  return returnValue;
}(DataTypeEnum, PropertyTypeEnum));
