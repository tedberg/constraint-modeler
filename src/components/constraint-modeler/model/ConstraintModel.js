import { log } from '@/common/LoggingFacade';
import { DataTypeEnum } from '../enum/DataTypeEnum';
import { ComparisonTypeEnum } from '../enum/ComparisonTypeEnum';
import QueryElement from './QueryElement';

let constraintId = 10000;

function constraintIdGenerator() {
  constraintId += 1000;
  return constraintId;
}

// used for testing
export function resetConstraintIdGenerator() {
  constraintId = 10000;
}

/**
 *  A Constraint models a single condition used in filtering data.
 */
export default class ConstraintModel extends QueryElement {

  constructor() {
    super(constraintIdGenerator());
    this.comparisonType = ComparisonTypeEnum.EQUAL;
    this.valueArray = [];
    this.verifiedValidity = null; // Can be set as an object via outside verification (usually a call to a server)  {valid: false, reason: 'blah...'}
  }

  // was constraintGroup.initConstraintsFromString
  static buildModelFromString(constraintToken, pathToPropertyMap) {
    log.debug('buildModelFromString, constraintToken = ', constraintToken);

    // contact.address.city:eq:Springfield

    let constraintModel = new ConstraintModel();
    constraintModel.setValuesFromToken(constraintToken);
    log.log('initial constraint model', constraintModel);

    let property = pathToPropertyMap[constraintModel.key];
    log.log('property', property);

    if (!(typeof property === 'undefined' || property === null)) {
      constraintModel.setProperty(property);
    } else {
      log.error('In buildModelFromString, property not properly defined.');
    }

    log.log('final constraint model', constraintModel);

    return constraintModel;
  }

  isValid() {
    if (this.verifiedValidity) {
      return this.verifiedValidity.valid;
    } else { // Do a more basic check of syntax.
      if (typeof this.key === 'undefined' || this.key === null || typeof this.comparisonType === 'undefined' || this.comparisonType === null) {
        return false;
      } else {
        switch (this.comparisonType.expectedNumberOfObjectValues) {
          case 0:
            return true;
          case 1:
            return (typeof this.value !== 'undefined' && this.value !== null);
          default:
            if (typeof this.valueArray === 'undefined' || this.valueArray === null) {
              return false;
            } else {
              return (typeof this.valueArray[0] !== 'undefined' && this.valueArray[0] !== null && typeof this.valueArray[1] !== 'undefined' && this.valueArray[1] !== null);
            }
        }
      }
    }
  }

  getReasonInvalid() {
    if (this.verifiedValidity) {
      return this.verifiedValidity.reason;
    } else {
      return !this.isValid() ? 'Property must be defined.' : '';
    }
  }

  setVerifiedValidity(valid, reason) {
    log.log('constraint setVerifiedValidity', this.getObjectId(), valid, reason);
    this.verifiedValidity = {
      valid: valid,
      reason: reason
    };
  }

  getComparisonType() {
    return this.comparisonType;
  }

  setComparisonType(comparisonType) {
    this.comparisonType = comparisonType;
  }

  getValueArray() {
    return this.valueArray;
  }

  get value() {
    return this.valueArray[0];
  }

  getValueArrayItem(index) {
    return this.valueArray[index];
  }

  setValue(value) {
    this.setValueArrayItem(0, value);
  }

  setValueArrayItem(index, value) {
    this.valueArray[index] = value;
  }

  setValueArray(newValues) {
    this.valueArray = newValues;
  }

  setValuesFromToken(constraintToken) {
    let keyValuePair = constraintToken.split(':');  // [0] = lower(contact.lastname)    [1] = eq    [2] = simpson

    if (keyValuePair.length < 2 || keyValuePair.length > 3) {
      log.error(`Invalid constraint token passed.  Was = ${constraintToken}`);
    }

    this.splitFunctionFromKey(keyValuePair[0]); // Check for aggregate or query function and process as necessary.

    if (keyValuePair.length === 2) {
      log.debug('In setValuesFromToken length is 2');
      if (keyValuePair[1] === ComparisonTypeEnum.NULL.alias || keyValuePair[1] === ComparisonTypeEnum.NOT_NULL.alias || keyValuePair[1] === ComparisonTypeEnum.EMPTY.alias || keyValuePair[1] === ComparisonTypeEnum.NOT_EMPTY.alias) {
        //log.debug("In setValuesFromToken using normal syntax for no arg comparison.");
        this.comparisonType = ComparisonTypeEnum.getTypeFromAlias(keyValuePair[1]);
      } else {
        //log.debug("In setValuesFromToken using short syntax");
        this.comparisonType = ComparisonTypeEnum.EQUAL;
        this.setValue(keyValuePair[1]);
      }
    } else if (keyValuePair.length === 3) {
      this.comparisonType = ComparisonTypeEnum.getTypeFromAlias(keyValuePair[1]);
      if (this.comparisonType.expectedNumberOfObjectValues >= 2) {
        this.valueArray = keyValuePair[2].split(',');
      } else {
        this.setValue(keyValuePair[2]);
      }
    }
  }

  renderSyntax() {
    let syntax;
    if (typeof this.queryFunction !== 'undefined' && this.queryFunction !== null) {
      syntax = `${this.queryFunction}(${this.key}) ${this.comparisonType}`;
    } else {
      syntax = `${this.key} ${this.comparisonType}`;
    }

    switch (this.comparisonType.expectedNumberOfObjectValues) {
      case 1:
        syntax += ` ${this.renderSyntaxForValue(this.value)}`;
        break;
      case 0:
        break;
      case 2:
        if (typeof this.valueArray === 'undefined' || this.valueArray === null) {
          syntax += ' undefined AND undefined';
        } else {
          syntax += ` ${this.renderSyntaxForValue(this.valueArray[0])} AND ${this.renderSyntaxForValue(this.valueArray[1])}`;
        }
        break;
      default:
        if (typeof this.valueArray === 'undefined' || this.valueArray === null) {
          syntax += ' (undefined)';
        } else {
          syntax += ' (';
          let count = 0;
          for (let val of this.valueArray) {
            count++;
            syntax += this.renderSyntaxForValue(val);
            if (count !== this.valueArray.length) {
              syntax += ', ';
            }
          }
          syntax += ')';
        }

    }
    return syntax;
  }

  renderSyntaxForValue(value) {
    log.log('renderSyntaxForValue', value, this.dataType, this.dataType === DataTypeEnum.STRING);
    let syntax;
    if (this.dataType === DataTypeEnum.STRING) {
      syntax = `'${value}'`;
    } else {
      syntax = value;
    }
    log.log('renderSyntaxForValue result', syntax);
    return syntax;
  }

  /**
   * Render the constraint as a query string token.
   * @param applySpecialHandlerConversions true to mutate constraint names for back end compatibility.
   * False for preserving saved filter definitions as entered.
   * @returns {string} The syntax of the constraint in query string format.
   */
  renderQueryString(applySpecialHandlerConversions) {
    // sum(version.versionNumber):eq:3
    // version.filesize:null
    // version.versionNumber:between:2,4
    // version.versionNumber:in:2,4,6
    let syntax;
    let constraintName = this.key;

    if (typeof applySpecialHandlerConversions === 'undefined') {
      log.error('ConstraintModel.renderQueryString - argument: applySpecialHandlerConversions was undefined.');
    }

    if (applySpecialHandlerConversions) { // Mutate constraint names for back end compatibility. False for preserving saved filter definition.
      if (this.isSpecialHandlerApplicable() && this.specialHandlerFunction.propertySuffix) {
        constraintName += this.specialHandlerFunction.propertySuffix;
      }
    }

    if (typeof this.queryFunction !== 'undefined' && this.queryFunction !== null) {
      syntax = `${this.queryFunction.alias}(${constraintName}):${this.comparisonType.alias}`;
    } else {
      syntax = `${constraintName}:${this.comparisonType.alias}`;
    }

    switch (this.comparisonType.expectedNumberOfObjectValues) {
      case 1:
        syntax += `:${this.value}`;
        break;
      case 0:
        break;
      case 2:
        if (typeof this.valueArray === 'undefined' || this.valueArray === null) {
          syntax += ':undefined';
        } else {
          syntax += `:${this.valueArray[0]},${this.valueArray[1]}`;
        }
        break;
      default:
        if (typeof this.valueArray === 'undefined' || this.valueArray === null) {
          syntax += ':undefined';
        } else {
          syntax += ':';
          let count = 0;
          for (let val of this.valueArray) {
            count++;
            syntax += val;
            if (count !== this.valueArray.length) {
              syntax += ',';
            }
          }
        }

    }
    return syntax;
  }

  /**
   * Is a special handler configured for this constraint?  If so, was chosen comparator a
   * standard choice or one that is tied to a specialHandlerFunction?
   * @returns {boolean} true if there is a configured special handler that applies to the current comparator
   */
  isSpecialHandlerApplicable() {
    if (this.specialHandlerFunction && this.specialHandlerFunction.applicableComparisonTypeArray) {
      // SpecialHandler is in play.  Thus, only apply enhancement function to comparators that are tied to it.
      if (this.specialHandlerFunction.applicableComparisonTypeArray.indexOf(this.comparisonType) > -1) {
        return true;
      }
    }
    return false;
  }

}
