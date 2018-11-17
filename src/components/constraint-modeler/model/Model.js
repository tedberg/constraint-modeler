import { log } from '@/common/LoggingFacade';
import Property from '../Property';
import ConstraintModelerResource from '../ConstraintModelerResource';
import ConstraintGroupModel, { ROOT_CONSTRAINT_GROUP_ID } from './ConstraintGroupModel';
import ConstraintModel from './ConstraintModel';
import ProjectionGroupModel from './ProjectionGroupModel';
import AbstractConstraintModelerResource from '../AbstractConstraintModelerResource';

const defaultErrorFunction = error => {
  log.error(error);
};

/**
 * Models the entire domain for the ConstraintModeler.
 * Each Constraint Group has a Junction, defaulting to AND, one or more Constraints and zero or more sub constraint groups.
 *
 * ---------------------------
 * Constraint Group (Root)
 *  Junction          - JunctionEnum
 *  Constraints       - Constraint[]
 *  Constraint Groups - ConstraintGroup[]  - Recursion here as each item has same structure as the Root.
 *
 * Projection Group (Optionally)
 *  Projections       - Projection[]
 * ---------------------------
 *
 * Requires pathToPropertyMap to be set, a mapping fetched from the server, mapping the propertyPath String to a Property instance.
 */
export default class Model {

  // TODO, several ways to init model from JSON, queryString, etc.  Maybe a factory/builder pattern here?

  constructor (objectName, constraintModelerResource = new ConstraintModelerResource()) {
    if (!objectName) {
      throw new Error('Model must be instantiated with a valid objectName.');
    }

    if (!(constraintModelerResource instanceof AbstractConstraintModelerResource)) {
      throw new Error('Model must be instantiated with a valid ConstraintModelerResource.');
    }

    this.constraintModelerResource = constraintModelerResource;

    this.objectName = objectName;
    // TODO: Are these the same?  Did className need to be fully qualified?
    //this.className = null;  // The server side className on which we will apply constraints.

    this.rootConstraintGroup = new ConstraintGroupModel(ROOT_CONSTRAINT_GROUP_ID);
    this.projectionGroup = null;

    this.propertyList = [];
    this.multiPropertyList = [];
    this.pathToPropertyMap = {};
  }

  getRootConstraintGroup () {
    return this.rootConstraintGroup;
  }

  getPropertyList () {
    return this.propertyList;
  }

  getMultiPropertyList () {
    return this.multiPropertyList;
  }

  getPathToPropertyMap () {
    return this.pathToPropertyMap;
  }

  setPathToPropertyMap (mapping) {
    this.pathToPropertyMap = mapping;
  }

  addProjectionGroup () {
    if (!this.projectionGroup) {
      this.projectionGroup = new ProjectionGroupModel();
    }
  }

  findConstraintById (constraintId) {
    return this.rootConstraintGroup.findConstraintById(constraintId);
  }

  getProjectionGroup () {
    return this.projectionGroup;
  }

  loadProperties () {
    let successFunction = data => {
      if (data.propertyList) {
        data.propertyList.forEach(prop => {
          let property = new Property(prop);
          this.propertyList.push(property);
          this.recursivePropertyListScan(property);
        });
      }

      if (data.multiPropertyList) {
        data.multiPropertyList.forEach(prop => {
          let property = new Property(prop);
          this.multiPropertyList.push(property);
          this.recursivePropertyListScan(property);
        });
      }

      return data;
    };

    return this.constraintModelerResource
      .loadProperties(this.objectName)
      .then(successFunction)
      .catch(defaultErrorFunction);
  }

  /**
   * Builds up the pathToPropertyMap by scanning the given property and its nested propertyLists.
   * @param property
   */
  recursivePropertyListScan (property) {
    this.pathToPropertyMap[property.path] = property;

    if (!(typeof property.nestedPropertyList === 'undefined' || property.nestedPropertyList === null)) {
      for (let prop of property.nestedPropertyList) {
        this.recursivePropertyListScan(prop);
      }
    }

    if (!(typeof property.nestedMultiPropertyList === 'undefined' || property.nestedMultiPropertyList === null)) {
      for (let prop of property.nestedMultiPropertyList) {
        this.recursivePropertyListScan(prop);
      }
    }
  }

  buildModelFromJson (jsonObject) {
    log.debug('buildModelFromJson, jsonObject = ', jsonObject);

    if (jsonObject) { // If null or undefined, model remains in vanilla state.
      let pathToPropertyMap = this.pathToPropertyMap;

      let constraintSimpleObject;

      if (jsonObject.projectionGroup || jsonObject.constraintGroup) {
        // Newer 2.8 format
        log.debug('Newer 2.8 format found');
        if (jsonObject.projectionGroup && jsonObject.projectionGroup.property) {
          log.debug('Projection query found');
          this.projectionGroup = new ProjectionGroupModel();
          this.projectionGroup.buildModelFromJson(jsonObject.projectionGroup, this.pathToPropertyMap);
        }

        constraintSimpleObject = jsonObject.constraintGroup;
      } else if (jsonObject.constraint) {
        // Older format (no projections)
        log.debug('Older 2.x format found');
        constraintSimpleObject = jsonObject;
      } else {
        constraintSimpleObject = null;
      }

      if (constraintSimpleObject) {
        // Needed at Root level
        let constraintObject = constraintSimpleObject.constraint;

        if (typeof constraintObject === 'object') {
          this.rootConstraintGroup = ConstraintGroupModel.buildModelFromJson(ROOT_CONSTRAINT_GROUP_ID, constraintObject, pathToPropertyMap);
        } else if (typeof constraintObject === 'string') {
          // Simple constraint form (constraint=property)
          this.rootConstraintGroup.setConstraintList(ConstraintModel.buildModelFromString(constraintObject, pathToPropertyMap));
        } else {
          throw new Error(`Parsed constraint is not an object, nor a string.  Datatype = ${typeof constraintObject}`);
        }
      }
    }

  }

  // Json Structure, (older format)

  // {
  // "constraint":{
  //    "value":"c1:eq:val1;c2:eq:val2;c3:eq:val3",    // This is 3 constraints
  //    "sub1":{                                       // First sub constraint Group
  //      "value":"c11:eq:val11;c12:eq:val12",         // Two more constraints
  //      "sub1":{                                     // First sub constraint Group under previous Constraint group
  //         "junction":"or",                          // Defines junction OR instead of default AND
  //         "value":"c21:eq:val21;c22:eq:val22"       // Two more constraints which will use the OR junction
  //      }
  //    },
  //    "sub2":{                                       // Second sub constraint group
  //      "value":"c31:eq:val31;c32:eq:val32"          // Two more constraints (AND Junction)
  //    }
  //  }
  // }

  // Newer format

  // /**
  //  * Using current state, builds modeler object format.
  //  *
  //  * 2.8 format
  //  * {
  //  *   "projectionGroup":{
  //  *     "property":"id;name;reason",
  //  *     "grouped":false,
  //  *     "projectionAsMap":false
  //  *   },
  //  *   "constraintGroup":{
  // "constraint":{
  //    "value":"c1:eq:val1;c2:eq:val2;c3:eq:val3",    // This is 3 constraints
  //    "sub1":{                                       // First sub constraint Group
  //      "value":"c11:eq:val11;c12:eq:val12",         // Two more constraints
  //      "sub1":{                                     // First sub constraint Group under previous Constraint group
  //         "junction":"or",                          // Defines junction OR instead of default AND
  //         "value":"c21:eq:val21;c22:eq:val22"       // Two more constraints which will use the OR junction
  //      }
  //    },
  //    "sub2":{                                       // Second sub constraint group
  //      "value":"c31:eq:val31;c32:eq:val32"          // Two more constraints (AND Junction)
  //    }
  //  }
  //  *   }
  //  * }
  //  *
  //  * @returns {Object}
  //  */
  //

  renderSyntax () {
    let syntax = '';
    if (this.projectionGroup) {
      syntax = this.projectionGroup.renderSyntax();
    }

    syntax += this.rootConstraintGroup.renderSyntax();
    if (syntax === '()') {
      syntax = '';
    }

    return syntax;
  }

  renderQueryString () {
    let applySpecialHandlerConversions = false; // For UI not server
    return this.buildQueryString(applySpecialHandlerConversions, false);
  }

  buildQueryString (applySpecialHandlerConversions, applyUrlEncoding) {
    let syntax = '';
    if (this.projectionGroup && this.projectionGroup.getQueryElementCount() > 0) {
      if (applyUrlEncoding) {
        syntax = this.projectionGroup.renderQueryString(applySpecialHandlerConversions);
        syntax += encodeURIComponent('&');
      } else {
        syntax = this.projectionGroup.renderQueryStringDecoded(applySpecialHandlerConversions);
        syntax += '&';
      }

    }

    if (applyUrlEncoding) {
      syntax += this.rootConstraintGroup.renderQueryString(applySpecialHandlerConversions);
    } else {
      syntax += this.rootConstraintGroup.renderQueryStringDecoded(applySpecialHandlerConversions);
    }

    return syntax;
  }

  renderSimpleJSON () {
    let applySpecialHandlerConversions = false; // For UI not server

    let modelerObject = {
      constraintGroup: this.rootConstraintGroup.renderSimpleObject(applySpecialHandlerConversions)
    };

    if (this.projectionGroup) {
      modelerObject.projectionGroup = this.projectionGroup.renderSimpleObject(applySpecialHandlerConversions);
    }

    return JSON.stringify(modelerObject);
  }

  renderFlattenedObjectList () {
    let applySpecialHandlerConversions = false;
    let list = this.rootConstraintGroup.renderFlattenedObjectList(applySpecialHandlerConversions);
    log.dir(list);
    return this.renderObjectArray(list);
  }

  renderStructuredObjectList () {
    let applySpecialHandlerConversions = false;
    let list = this.rootConstraintGroup.renderStructuredObjectList(applySpecialHandlerConversions);
    log.dir(list);
    return this.renderObjectArray(list);
  }

  renderObjectArray (list) {
    let syntax = '<ol>';
    for (let entry of list) {
      syntax += '<li>';
      if (Array.isArray(entry)) {
        syntax += this.renderObjectArray(entry);
      } else {
        syntax += `${entry.objectId} - ${entry.constraint}`;
      }
      syntax += '</li>';
    }
    syntax += '</ol>';
    return syntax;
  }

  validate () {
    let promiseResponse;

    let validProjectionGroup = true;
    if (this.projectionGroup) {
      validProjectionGroup = this.projectionGroup.isValid();
    }

    if (validProjectionGroup) {
      let applySpecialHandlerConversions = true; // Sending to server

      let successFunction = data => {
        let list = data.data;
        list.forEach(entry => {
          let constraint = this.findConstraintById(entry.objectId);
          if (constraint) {
            constraint.setVerifiedValidity(entry.valid, entry.invalidReason);
          } else {
            log.warn('Server validate response contained an objectId which is not found in our model...', entry.objectId);
          }
        });

        return data;
      };

      let constraintList = JSON.stringify(this.rootConstraintGroup.renderFlattenedObjectList(applySpecialHandlerConversions));

      log.log('validate - constraintList', constraintList);

      promiseResponse = this.constraintModelerResource
        .validateConstraintModeler(this.objectName, constraintList)
        .then(successFunction)
        .catch(defaultErrorFunction);
    } else {
      // TODO: Indicate projections are invalid - They may already indicate this in their state.
      promiseResponse = Promise.resolve();
    }

    return promiseResponse;
  }

  apply () {
    let applySpecialHandlerConversions = true; // Server side call
    let urlEncodedConstraintQueryString = this.buildQueryString(applySpecialHandlerConversions, true);

    let successFunction = data => data;
    return this.constraintModelerResource
      .loadResultWithConstraints(this.objectName, urlEncodedConstraintQueryString)
      .then(successFunction)
      .catch(defaultErrorFunction);
  }

}

