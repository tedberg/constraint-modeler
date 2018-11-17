import { log } from '@/common/LoggingFacade';
import { JunctionEnum } from '../enum/JunctionEnum';
import QueryElementGroup, { serializeObjectToQueryStringParameters } from './QueryElementGroup';
import ConstraintModel from './ConstraintModel';

export const ROOT_CONSTRAINT_GROUP_ID = 1000000;

let constraintGroupId = ROOT_CONSTRAINT_GROUP_ID;

function constraintGroupIdGenerator() {
  constraintGroupId += 100000;
  return constraintGroupId;
}

// used for testing
export function resetConstraintGroupIdGenerator() {
  constraintGroupId = ROOT_CONSTRAINT_GROUP_ID;
}

/**
 *  A ConstraintGroup models a group of Constraints that are used collectively to filter data.
 */
export default class ConstraintGroupModel extends QueryElementGroup {
  // TODO, several ways to init model from JSON, queryString, etc.  Maybe a factory/builder pattern here?

  constructor(constraintGroupId) {
    super(constraintGroupId);
    this.junction = JunctionEnum.AND;
    this.constraintList = [];
    this.constraintGroupList = [];
  }

  isRoot() {
    return Number(this.getObjectId()) === ROOT_CONSTRAINT_GROUP_ID;
  }

  getJunction() {
    return this.junction;
  }

  setJunction(junction) {
    this.junction = junction;
  }

  getConstraintList() {
    return this.constraintList;
  }

  setConstraintList(constraintList) {
    this.constraintList = constraintList;
  }

  addConstraint() {
    let constraint = new ConstraintModel();
    this.constraintList.push(constraint);
    return constraint;
  }

  removeConstraint(constraintId) {
    let index = this.constraintList.findIndex(constraint => constraint.getObjectId() === constraintId);
    if (index >= 0) {
      this.constraintList.splice(index, 1);
    } else {
      log.error('removeConstraint called with invalid id', constraintId);
    }
  }

  getConstraintGroupList() {
    return this.constraintGroupList;
  }

  addConstraintGroup(subConstraintGroup) {
    let constraintGroup = subConstraintGroup || new ConstraintGroupModel(constraintGroupIdGenerator());
    this.constraintGroupList.push(constraintGroup);
    return constraintGroup;
  }

  findConstraintGroupById(constraintGroupId) {
    let constraintGroup = this.constraintGroupList.find(constraintGroup => constraintGroup.getObjectId() === Number(constraintGroupId));
    if (constraintGroup) {
      return constraintGroup;
    }

    // Some is variant of forEach, breaks loop if iteration returns true.
    this.constraintGroupList.some(constraintGroup => {
      constraintGroup = constraintGroup.findConstraintGroupById(constraintGroupId);
      return constraintGroup;
    });

    return constraintGroup;
  }

  removeConstraintGroup(constraintGroupId) {
    let index = this.constraintGroupList.findIndex(constraintGroup => constraintGroup.getObjectId() === constraintGroupId);
    if (index >= 0) {
      this.constraintGroupList.splice(index, 1);
    } else {
      log.error('removeConstraintGroup called with invalid id', constraintGroupId);
    }
  }

  removeConstraintGroupRecursively(constraintGroupId) {
    let index = this.constraintGroupList.findIndex(constraintGroup => constraintGroup.getObjectId() === constraintGroupId);
    if (index >= 0) {
      this.constraintGroupList.splice(index, 1);
      return true;
    } else {
      this.constraintGroupList.some(constraintGroup => constraintGroup.removeConstraintGroupRecursively(constraintGroupId));
    }
  }

  /**
   * Returns a count of how many constraints are established directly within this ConstraintGroup.
   * @return {*}
   */
  getQueryElementCount() {
    return this.constraintList.length;
  }

  /**
   * Returns a count of how many constraints are established directly within this ConstraintGroup.
   * @return {*}
   */
  getConstraintCount() {
    return this.constraintList.length;
  }

  /**
   * Returns a count of how many constraints are established within any subgroups of this ConstraintGroup.
   * @return {*}
   */
  getNestedConstraintCount() {
    let count = 0;
    this.constraintGroupList.forEach(constraintGroup => {
      count += constraintGroup.getConstraintCount();
      count += constraintGroup.getNestedConstraintCount();
    });

    return count;
  }

  /**
   * Returns a count of how many constraints are established directly within this ConstraintGroup
   * and within any subgroups.
   * @return {*}
   */
  getTotalConstraintCount() {
    return this.getConstraintCount() + this.getNestedConstraintCount();
  }

  isValid() {
    return this.constraintList.every(constraint => constraint.isValid()) &&
      this.constraintGroupList.every(constraintGroup => constraintGroup.isValid());
  }

  findConstraintById(constraintId) {
    let constraint = this.constraintList.find(constraint => constraint.getObjectId() === Number(constraintId));
    if (constraint) {
      return constraint;
    }

    // Some is variant of forEach, breaks loop if iteration returns true.
    this.constraintGroupList.some(constraintGroup => {
      constraint = constraintGroup.findConstraintById(constraintId);
      return constraint;
    });

    return constraint;
  }

  static buildModelFromJson(constraintGroupId, constraintObject, pathToPropertyMap) {
    log.debug('buildModelFromJson, constraintObject = ', constraintObject);

    let constraintGroupModel = new ConstraintGroupModel(constraintGroupId);

    if (constraintObject.junction) {
      constraintGroupModel.setJunction(JunctionEnum.getTypeFromAlias(constraintObject.junction));
    }

    // Complex constraint form (constraint[value]=property)
    if (constraintObject.value) {
      constraintGroupModel.setConstraintList(ConstraintGroupModel.buildConstraintList(constraintGroupModel, constraintObject.value, pathToPropertyMap));
    }

    let keys = Object.keys(constraintObject);
    keys.map(key => {
      if (key !== 'value' && key !== 'junction') {
        let subConstraintGroup = ConstraintGroupModel.buildModelFromJson(constraintGroupIdGenerator(), constraintObject[key], pathToPropertyMap);
        constraintGroupModel.addConstraintGroup(subConstraintGroup);
      }
    });

    return constraintGroupModel;
  }

  // Builds the constraint list from the token string.
  static buildConstraintList(constraintGroupModel, constraintString, pathToPropertyMap) {
    let constraintModelList = [];

//       junction:or (Can appear in index 0)
// [0] = contact.lastname:eq:Simpson
// [1] = contact.address.city:eq:Springfield
// [2] = (name:notnull
// [3] = (id:notnull
// [4] =  description:null))
    let constraintTokenArray = constraintString.split(';');

    for (let constraintToken of constraintTokenArray) {
      log.log('constraintToken', constraintToken);
      let keyValuePair = constraintToken.split(':');

      if (keyValuePair[0] === 'junction') {  // TODO: Edge case, simple format has ConstraintGroup.junction mixed into the constraint string.
        constraintGroupModel.setJunction(JunctionEnum.getTypeFromAlias(keyValuePair[1]));
      } else {
        constraintModelList.push(ConstraintModel.buildModelFromString(constraintToken, pathToPropertyMap));
      }
    }

    return constraintModelList;
  }

  renderSyntax() {
    let junction = ` ${this.junction.label} `;
    let syntax = '(';

    let list = this.constraintList;

    let count = 0;
    for (let constraint of list) {
      count++;
      syntax += constraint.renderSyntax();
      if (count < list.length) {
        syntax += junction;
      }
    }

    for (let constraintGroup of this.constraintGroupList) {
      syntax += junction;
      syntax += constraintGroup.renderSyntax();
    }

    syntax += ')';

    return syntax;
  }

  renderSimpleObject(applySpecialHandlerConversions) {
    let simple = {};
    let constraint = {};

    if (this.junction !== JunctionEnum.AND) {
      constraint.junction = this.junction.alias;
    }

    let stringValue = this.renderConstraintsAsString(applySpecialHandlerConversions);
    if (stringValue !== null && stringValue.length > 0) { // Don't set constraint.value to empty string, leave undefined in that case.
      constraint.value = stringValue;
    }

    let count = 0;
    for (let constraintGroup of this.constraintGroupList) {
      count++;
      constraint['sub' + count] = constraintGroup.renderSimpleObject(applySpecialHandlerConversions);
    }

    if (this.objectId === ROOT_CONSTRAINT_GROUP_ID) {
      simple.constraint = constraint;
    } else {
      simple = constraint;
    }

    return simple;
  }

  /**
   * Renders the group's direct child constraints as a string concatenated with a semicolon delimiter.
   * @param applySpecialHandlerConversions true to mutate constraint names for back end compatibility.
   * False for preserving saved filter definitions as entered.
   * @return {string}
   */
  renderConstraintsAsString(applySpecialHandlerConversions) {
    let queryString = '';

    let count = 0;
    let list = this.constraintList;
    for (let constraint of list) {
      count++;
      queryString += constraint.renderQueryString(applySpecialHandlerConversions);
      if (count < list.length) {
        queryString += ';';
      }
    }

    return queryString;
  }

  /**
   * Renders the ConstraintGroup as a complex queryString parameter, supporting many constraints and subConstraintGroups.
   * @return String parameter
   */
  renderQueryString(applySpecialHandlerConversions) {
    let simpleObject = this.renderSimpleObject(applySpecialHandlerConversions);
    return serializeObjectToQueryStringParameters(simpleObject);
  }

  /**
   * Renders the URI Decoded version of the ConstraintGroup as a complex queryString parameter, supporting many constraints and subConstraintGroups.
   * This is used for viewing and debugging.
   * @return String parameter
   */
  renderQueryStringDecoded(applySpecialHandlerConversions) {
    return decodeURIComponent(this.renderQueryString(applySpecialHandlerConversions));
  }

  /**
   * Renders the group's direct child constraints as a list of objects, with objects containing and objectId and constraint rendered as a string.
   * @return {Array}
   */
  renderConstraintsAsList(applySpecialHandlerConversions) {
    let list = [];
    for (let constraint of this.constraintList) {
      list.push({
        objectId: constraint.objectId,
        constraint: constraint.renderQueryString(applySpecialHandlerConversions)
      });
    }
    return list;
  }

  /**
   * Iterates over child constraints and child constraintGroups to build a structured list of constraint entries, each containing and
   * objectId and and constraint rendered as a string.  List will have object entries and sub-lists of entries.
   * @return {Array}
   */
  renderStructuredObjectList(applySpecialHandlerConversions) {
    let list = this.renderConstraintsAsList(applySpecialHandlerConversions);
    for (let constraintGroup of this.constraintGroupList) {
      list.push(constraintGroup.renderStructuredObjectList(applySpecialHandlerConversions));
    }
    return list;
  }

  /**
   * Iterates over child constraints and child constraintGroups to build a flattened list of constraint entries, each containing and
   * objectId and and constraint rendered as a string.
   * @return {Array}
   */
  renderFlattenedObjectList(applySpecialHandlerConversions) {
    let list = this.renderConstraintsAsList(applySpecialHandlerConversions);
    for (let constraintGroup of this.constraintGroupList) {
      list = list.concat(constraintGroup.renderFlattenedObjectList(applySpecialHandlerConversions));
    }
    return list;
  }


}

