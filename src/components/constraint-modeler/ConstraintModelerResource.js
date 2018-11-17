import ApiResource from '../../common/ApiResource';
import AbstractConstraintModelerResource from './AbstractConstraintModelerResource';

export default class ConstraintModelerResource extends AbstractConstraintModelerResource {

  constructor() {
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
  loadValueList(serverDataType) {
    return this.getJson(`/objects/${serverDataType}/values`);
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
  loadProperties(objectName) {
    return this.getJson(`/api/objects/${objectName}/classInfo`);
  }

  // Model.validate
  /**
   *
   * @param {string} className such as: 'User'
   * @param {string} constraintList - JSON String of array such as: [{"objectId":13000,"constraint":"id:gt:4"},{"objectId":14000,"constraint":"name:notnull"}]
   * @returns {Object} via a Promise, such as:
   * {
   *   "success": true,
   *   "data": [
   *      {"objectId": "13000", "constraint": "id:gt:4", "valid": true, "invalidReason": null},
   *      {"objectId": "14000", "constraint": "name:notnull", "valid": true, "invalidReason": null}
   *   ]
   * }
   */
  validateConstraintModeler(className, constraintList) {
    let url = `/objects/${className}/constraintModeler/validate`;
    let queryString = 'constraintList=' + encodeURIComponent(constraintList);
    return this.getJson(`${url}?${queryString}`);
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
  loadResultWithConstraints(className, urlEncodedConstraintQueryString) {
    let url = `/objects/${className}`;
    return this.getJson(`${url}?${urlEncodedConstraintQueryString}`);
  }

}
