import { log } from '@/common/LoggingFacade';

/**
 * Takes a JSON string argument and converts it to an object with error handling.
 *
 * @param jsonString A JSON String
 * @return {object}
 */
const parseJSON = jsonString => {
  let jsonObject = {};
  if (jsonString && jsonString.length > 0) {
    try {
      jsonObject = JSON.parse(jsonString);
    } catch (error) {
      log.error(`Info: could not parse Json string with value of (${jsonString}). Message is: ${error.message}`);
    }
  }
  return jsonObject;
};

const DEFAULT_SAVE_FUNCTION = (filterObject, formData) => {
  log.log('Save Function Placeholder...', filterObject, formData);
  return Promise.resolve();
};

/**
 * Models the persistence aspects of the constraint model.
 * Usage is optional, only providing support when the ability to save constraint modeler models is desired.
 */
export default class ModelPersistence {

  constructor(saveFunction) {
    // Values for saving constraint models (if supported)
    this.saveFunction = saveFunction || DEFAULT_SAVE_FUNCTION;
    this.persistentId = null;    // If we load constraint model from persistence layer, set the id and name.
    this.persistentName = null;
  }

  /**
   * Save the current constraint model.
   */
  save(model, isValid = true) {
    return this.saveInternal(this.persistentId, model, isValid);
  }

  /**
   * Save the current constraint model as a newly saved instance.
   */
  saveAs(model, isValid = true) {
    return this.saveInternal(null, model, isValid);
  }

  saveInternal(persistentId, model, isValid) {
    let applySpecialHandlerConversions = false; // Don't save with server conversions

    // Convert to 2.8 format
    let modelerObject = ModelPersistence.convertToModelerObject(model);
    let constraintSyntax = model.rootConstraintGroup.renderSyntax();

    let filterObject = {
      rootObject: model.objectName,
      constraintValue: JSON.stringify(ModelPersistence.extractConstraintFromModelerObject(modelerObject)),
      logicalSyntax: constraintSyntax,
      valid: isValid
    };

    if (model.projectionGroup) {
      filterObject.projectionValue = JSON.stringify(ModelPersistence.extractProjectionFromModelerObject(modelerObject));
    }

    let formData = {
      id: persistentId
    };

    return this.saveFunction(filterObject, formData); // Call the registered save function.
  }


  /**
   * Takes simple object arguments representing separate constraint and/or projection definitions,
   * and returns them wrapped in the modeler object format.
   * Logic inspects to see if json already contains wrapper object (constraintGroup/projectionGroup)
   * to prevent double wrapping.
   *
   * @param constraintGroupSimpleObject output of ConstraintGroup.renderSimpleObject(false)
   * @param projectionGroupSimpleObject output of ProjectionGroup.renderSimpleObject(false)
   * @return {object}
   */
  static convertToModelerObjectFromSimpleObjects(constraintGroupSimpleObject, projectionGroupSimpleObject) {
    let modelerObject = {};

    if (constraintGroupSimpleObject && constraintGroupSimpleObject.constraintGroup) {
      // Already in new format, prevent double wrapping.
      modelerObject.constraintGroup = constraintGroupSimpleObject.constraintGroup;
    } else {
      modelerObject.constraintGroup = constraintGroupSimpleObject;
    }

    if (projectionGroupSimpleObject && projectionGroupSimpleObject.projectionGroup) {
      // Already in new format, prevent double wrapping.
      modelerObject.projectionGroup = projectionGroupSimpleObject.projectionGroup;
    } else {
      modelerObject.projectionGroup = projectionGroupSimpleObject;
    }

    return modelerObject;
  }

  /**
   * Takes JSON string arguments representing separate constraint and/or projection definitions,
   * converts them to objects and returns them wrapped in the modeler object format.
   * Logic inspects to see if json already contains wrapper object (constraintGroup/projectionGroup)
   * to prevent double wrapping.
   *
   * @param constraintJSON A JSON String modeling the constraint
   * @param projectionJSON A JSON String modeling the projection
   * @return {object}
   */
  static convertToModelerObjectFromJSON(constraintJSON, projectionJSON) {
    let constraintObject = parseJSON(constraintJSON);
    let projectionObject = parseJSON(projectionJSON);
    return ModelPersistence.convertToModelerObjectFromSimpleObjects(constraintObject, projectionObject);
  }

  /**
   * Using current state, builds modeler object format.
   *
   * 2.8 format
   * {
   *   "projectionGroup":{
   *     "property":"id;name;reason",
   *     "grouped":false,
   *     "projectionAsMap":false
   *   },
   *   "constraintGroup":{
   *     "constraint":{
   *       "value":"ok:eq:true"
   *     }
   *   }
   * }
   *
   * @returns {Object}
   */
  static convertToModelerObject({rootConstraintGroup, projectionGroup}) {
    let applySpecialHandlerConversions = false; // For UI not server

    let constraintGroupSimpleObject = rootConstraintGroup.renderSimpleObject(applySpecialHandlerConversions);
    let projectionGroupSimpleObject = null;
    if (projectionGroup) {
      projectionGroupSimpleObject = projectionGroup.renderSimpleObject(applySpecialHandlerConversions);
    }

    return ModelPersistence.convertToModelerObjectFromSimpleObjects(constraintGroupSimpleObject, projectionGroupSimpleObject);
  }

  /**
   * Takes the modelerObject format and returns a new object with only the projectionGroup.
   * @param modelerObject
   * @returns {Object}
   */
  static extractProjectionFromModelerObject(modelerObject) {
    return {
      projectionGroup: modelerObject.projectionGroup
    };
  }

  /**
   * Takes the modelerObject format and returns a new object with only the constraintGroup.
   * @param modelerObject
   * @returns {Object}
   */
  static extractConstraintFromModelerObject(modelerObject) {
    return {
      constraintGroup: modelerObject.constraintGroup
    };
  }

}

