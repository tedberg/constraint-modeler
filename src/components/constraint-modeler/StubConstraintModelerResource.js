import AbstractConstraintModelerResource from './AbstractConstraintModelerResource';

const VALUE_LIST = {
  'data': [{ 'identifyingValue': 'DISABLED', 'displayValue': 'Disabled' }, { 'identifyingValue': 'ENABLED', 'displayValue': 'Enabled' }],
};

const PROPERTIES_LIST = {
  'propertyList': [
    {
      'path': 'name',
      'displayName': 'Name',
      'simpleDataType': 'string',
      'dataType': 'java.lang.String'
    },
    {
      'path': 'age',
      'displayName': 'Age',
      'simpleDataType': 'number',
      'dataType': 'java.lang.Integer'
    },
    {
      'path': 'status',
      'displayName': 'Status',
      'simpleDataType': 'enum',
      'dataType': 'com.xyz.model.Status'
    }
  ],
  'multiPropertyList': [
    {
      'path': 'alert',
      'displayName': 'alert',
      'simpleDataType': 'object',
      'dataType': 'com.xyz.Alert',
      'expectedDataMagnitude': 10000,
      'keyDisplayPropertyPath': null,
      'relationship': true,
      'multiProperty': true,
      'nestedPropertyList': [
        {
          'path': 'alert.message',
          'displayName': 'Message',
          'simpleDataType': 'string',
          'dataType': 'java.lang.String'
        }
      ]
    }
  ]
};

const RESULT_RESPONSE = {
  'totalRows': 8,
  'queryTotalRows': 2,
  'success': true,
  'page': 1,
  'data': [
    { 'id': 1, 'name': 'Bill', 'age': 25, 'status': 'ENABLED' },
    { 'id': 2, 'name': 'Frank', 'age': 32, 'status': 'DISABLED' },
    { 'id': 3, 'name': 'Sally', 'age': 73, 'status': 'ENABLED' },
    { 'id': 4, 'name': 'Jim', 'age': 27, 'status': 'DISABLED' },
    { 'id': 5, 'name': 'Larry', 'age': 6, 'status': 'ENABLED' },
    { 'id': 6, 'name': 'Tony', 'age': 18, 'status': 'ENABLED' },
    { 'id': 7, 'name': 'Lisa', 'age': 50, 'status': 'DISABLED' },
    { 'id': 8, 'name': 'Beth', 'age': 21, 'status': 'ENABLED' },
    { 'id': 9, 'name': 'Randy', 'age': 45, 'status': 'ENABLED' },
    { 'id': 10, 'name': 'Moe', 'age': 62, 'status': 'ENABLED' }
  ]
};

/**
 * This is a stub for ConstraintModelerResource, which returns sample data, wrapped in a Promise to simulate the
 * necessary API calls that a backend server would provide.
 */
export default class StubConstraintModelerResource extends AbstractConstraintModelerResource {

  constructor () {
    super();
  }

  // Used by ValueInput.vue
  /**
   * Loads a list of values, each having an identifyingValue and displayValue attribute.
   *
   * @param {string} serverDataType - ex: 'status' or 'com.xyz.Status'
   * @returns {Object} via a Promise,  such as :
   * {
   *   "data": [{"identifyingValue": "DISABLED", "displayValue": "Disabled"}, {"identifyingValue": "ENABLED", "displayValue": "Enabled"}],
   * }
   */
  loadValueList (serverDataType) {
    return new Promise((resolve, reject) => {
      resolve(VALUE_LIST);
    });
  }

  // Called by Model.loadProperties
  /**
   * Loads the properties for the data model of the given objectName.
   * The property list contains the properties which can be used to build constraints.
   * One of the two arrays (propertyList, multiPropertyList) must have at least one value.
   *
   * The values path, displayName, simpleDataType and dataType are required.  The others are optional.
   *
   * @param objectName
   * @returns {Object} via Promise, such as:
   * {
   *   "propertyList": [
   *   {
   *     "path": "name",
   *     "displayName": "Name",
   *     "simpleDataType": "string",
   *     "dataType": "java.lang.String",
   *     "expectedDataMagnitude": null,
   *     "keyDisplayPropertyPath": null,
   *     "relationship": false,
   *     "nestedPropertyList": null,
   *     "nestedMultiPropertyList": null
   *   }
   *   ],
   *   "multiPropertyList": [
   *    {
   *       "path": "alert",
   *       "displayName": "alert",
   *       "simpleDataType": "object",
   *       "dataType": "com.xyz.Alert",
   *       "expectedDataMagnitude": 10000,
   *       "keyDisplayPropertyPath": null,
   *       "relationship": true,
   *       "multiProperty": true,
   *       "nestedPropertyList": [
   *         {
   *           "path": "alert.message",
   *           "displayName": "Message",
   *           "simpleDataType": "string",
   *           "dataType": "java.lang.String",
   *           "expectedDataMagnitude": null,
   *           "keyDisplayPropertyPath": null,
   *           "relationship": false,
   *           "multiProperty": false,
   *           "nestedPropertyList": null,
   *           "nestedMultiPropertyList": null
   *         }
   *       ]
   *    }
   *   ]
   * }
   */
  loadProperties (objectName) {
    return new Promise((resolve, reject) => {
      resolve(PROPERTIES_LIST);
    });
  }

  // Model.validate
  /**
   *
   * @param {string} className such as: 'User'
   * @param {string} constraintList - JSON String of array such as:
   * [{"objectId":13000,"constraint":"id:gt:4"},{"objectId":14000,"constraint":"name:notnull"}]
   * @returns {Object} via a Promise, such as:
   * {
   *   "success": true,
   *   "data": [
   *      {"objectId": "13000", "constraint": "id:gt:4", "valid": true, "invalidReason": null},
   *      {"objectId": "14000", "constraint": "name:notnull", "valid": true, "invalidReason": null}
   *   ]
   * }
   */
  validateConstraintModeler (className, constraintList) {
    let data = JSON.parse(constraintList).map(item => {
      item.valid = true;
      item.invalidReason = null;
      return item;
    });

    return new Promise((resolve, reject) => {
      resolve({
        success: true,
        data: data
      });
    });
  }

  // Model.apply
  /**
   *
   * @param {string} className such as: 'User'
   * @param {string} urlEncodedConstraintQueryString
   * @returns {Object} via a Promise, such as:
   * {
   *  "totalRows": 8,
   *  "queryTotalRows": 2,
   *  "success": true,
   *  "page": 1,
   *  "data": [
   *      {"name": "Bill", "age": 25},
   *      {"name": "Frank", "age": 32},
   *  ]
   * }
   */
  loadResultWithConstraints (className, urlEncodedConstraintQueryString) {
    return new Promise((resolve, reject) => {
      resolve(RESULT_RESPONSE);
    });
  }

}
