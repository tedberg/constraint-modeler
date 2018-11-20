import { log } from '@/common/LoggingFacade';
import { DataTypeEnum } from '../enum/DataTypeEnum';
import { QueryFunctionEnum } from '../enum/QueryFunctionEnum';
import { GeneralEnum } from '../enum/Enum';

/**
 *  A QueryElement models an element to be used in a Query.  It may be a projection, constraint, etc.
 */
export default class QueryElementModel {

  constructor (objectId) {
    this.objectId = objectId;

    this.property = null;                 // The Property instance that this element is based on.
    this.queryFunction = null;            // Aggregate and non-aggregate functions.

    this.key = null;                      // key for the pathToPropertyMap (propertyPath)
    this.label = null;                    // This is the user friendly label that matches the key.  Matches the form labels for a given key (propertyPath).
    this.dataType = DataTypeEnum.STRING;  // The simple datatype for the given key (string, number, boolean, date, enum, url, object)
    this.serverDataType = null;           // The server/java data type, such as Person.
  }

  // ---------- Abstract methods ----------

  setValuesFromToken (token) {
    throw new Error('Call to abstract method setValuesFromToken.');
  }

  renderSyntax () {
    throw new Error('Call to abstract method renderSyntax.');
  };

  renderQueryString (applySpecialHandlerConversions) {
    throw new Error('Call to abstract method renderQueryString.');
  }

  // ---------- Concrete methods ----------

  getObjectId () {
    return this.objectId;
  }

  getReasonInvalid () {
    return '';
  }

  getProperty () {
    return this.property;
  }

  setProperty (property) {
    this.property = property;

    this.key = property.path;
    this.label = property.displayName;
    this.dataType = DataTypeEnum.getTypeFromAlias(property.simpleDataType);
    this.serverDataType = property.dataType;
  }

  getQueryFunction () {
    return this.queryFunction;
  }

  getKey () {
    return this.key;
  }

  getLabel () {
    return this.label;
  }

  getDataType () {
    return this.dataType;
  }

  getServerDataType () {
    return this.serverDataType;
  }

  /**
   * Check if the key contains parenthesis and if so, split out the query function from the real key.
   * Take the passed key and set this constraint key and conditionally this constraint query function.
   *
   * @param theKey the key to check. Examples are: lower(contact.lastname) or just contact.lastname
   */
  splitFunctionFromKey (theKey) {
    if (theKey !== null && theKey.indexOf('(') !== -1) { // Must be an aggregate or queryFunction
      let functionKeyPair = theKey.split('('); // Split function and property
      let functionAlias = functionKeyPair[0];
      let fieldName = functionKeyPair[1];

      let queryFunction = QueryFunctionEnum.getTypeFromAlias(functionAlias);

      log.log('splitFunctionFromKey queryFunction', functionAlias, queryFunction);

      if (queryFunction !== null) {
        this.queryFunction = queryFunction;
        this.key = fieldName.replace(')', ''); // Remove closing parenthesis from the key
      } else {
        log.error('Unrecognized function alias used by constraint - ' + functionAlias);
      }
    } else {
      log.info('In splitFunctionFromKey, set this.key = ', theKey);
      this.key = theKey;
    }
  }

  // TODO: Review usage of GeneralEnum.
  setQueryFunction (enumKey) {
    if (enumKey === GeneralEnum.NONE.key) {
      this.queryFunction = null;
    } else {
      this.queryFunction = QueryFunctionEnum.getType(enumKey);
    }
  }

}

