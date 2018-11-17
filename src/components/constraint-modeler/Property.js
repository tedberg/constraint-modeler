import { DataTypeEnum } from './enum/DataTypeEnum';

/**
 *  Property models a single field in a Class.
 */
export default class Property {

  constructor(obj) {
    let prop = obj || {};

    this.path = prop.path || undefined;
    this.displayName = prop.displayName || undefined;
    this.simpleDataType = prop.simpleDataType || undefined;
    this.dataType = prop.dataType || undefined; // The java data type

    // If this property has a large magnitude of data and a human readable unique property exists for the dataset,
    // an Autocomplete widget is best here, rather than a select list.
    this.expectedDataMagnitude = prop.expectedDataMagnitude || undefined; // For entity data types, the magnitude of the total set of data.
    this.keyDisplayPropertyPath = prop.keyDisplayPropertyPath || undefined; // Property path to a property which is unique and human readable for the data set.

    this.relationship = prop.relationship || false;
    this.multiProperty = prop.multiProperty || false;
    this.nestedPropertyList = prop.nestedPropertyList || undefined;  // nested list is just being set as straight JSON, not converted recursively into real Property instances.
    this.nestedMultiPropertyList = prop.nestedMultiPropertyList || undefined;  // nested list is just being set as straight JSON, not converted recursively into real Property instances.
  }

  isObjectType() {
    return this.simpleDataType === 'object';
  }

  getSimpleDataTypeEnum() {
    return DataTypeEnum.getTypeFromAlias(this.simpleDataType);
  }

  getServerDataType() {
    return this.dataType;
  }

}
