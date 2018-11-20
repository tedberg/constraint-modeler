import { log } from '@/common/LoggingFacade';
import QueryElementGroupModel, { serializeObjectToQueryStringParameters } from './QueryElementGroupModel';
import ProjectionModel from './ProjectionModel';

export default class ProjectionGroupModel extends QueryElementGroupModel {

  // TODO, several ways to init model from JSON, queryString, etc.  Maybe a factory/builder pattern here?

  constructor (obj) {
    super(1000);
    this.projectionList = [];

    let settings = obj || {};
    this.grouped = settings.grouped || false;
    this.projectionAsMap = settings.projectionAsMap || false;
  }

  // /objects/asset.html?
  // property=id;size(version);max(averageRating);name
  // &
  // grouped=true
  // &
  // projectionAsMap=true

  getQueryElementCount () {
    return this.projectionList.length;
  }

  getProjectionList () {
    return this.projectionList;
  }

  isGrouped () {
    return this.grouped;
  }

  isProjectionAsMap () {
    return this.projectionAsMap;
  }

  addProjection () {
    let projection = new ProjectionModel();
    this.projectionList.push(projection);
    return projection;
  }

  removeProjection (projectionId) {
    log.log('removeProjection with id', projectionId);
    let index = this.projectionList.findIndex(projection => projection.getObjectId() === projectionId);
    log.log('removeProjection index', index);
    if (index >= 0) {
      this.projectionList.splice(index, 1);
    } else {
      log.error('removeProjection called with invalid id', projectionId);
    }
  }

  isValid () {
    return this.projectionList.every(projection => projection.isValid());
  }

  findProjectionById (projectionId) {
    return this.projectionList.find(projection => projection.getObjectId() === projectionId);
  }

  buildModelFromJson (jsonObject, pathToPropertyMap) {
    log.info('ProjectionGroup buildModelFromJson', jsonObject);

    if (!(typeof jsonObject === 'undefined' || jsonObject === null)) {
      // Values coming from an object built from a queryString have string values, not boolean for data types.
      if (jsonObject.grouped && String(jsonObject.grouped).toLowerCase() === 'true') {
        this.grouped = true;
        log.log('grouped = true');
      }
      if (jsonObject.projectionAsMap && String(jsonObject.projectionAsMap).toLowerCase() === 'true') {
        this.projectionAsMap = true;
        log.log('projectionAsMap = true');
      }

      let projectionString = jsonObject.property;

      log.info('ProjectionGroup projectionString', projectionString);

      if (!(typeof projectionString === 'undefined' || projectionString === null)) {
        if (typeof projectionString === 'object') {
          // Complex constraint form (constraint[value]=property)
          throw new Error('Parsed projection is an object.');
        } else if (typeof projectionString === 'string') {
          // Simple constraint form (constraint=property)
          this.initProjectionsFromString(projectionString, pathToPropertyMap);
        } else {
          throw new Error('Parsed projection is not an object, nor a string.  Datatype = ' + typeof projectionString);
        }
      }
    }
  }

  initProjectionsFromString (projectionString, pathToPropertyMap) {
    let projectionTokenArray = projectionString.split(';');   // [0] = contact.lastname  [1] = contact.address.city [2] = name

    log.info('ProjectionGroup initProjectionsFromString', projectionString);
    for (let projectionToken of projectionTokenArray) {
      log.info('ProjectionGroup initProjectionsFromString Loop', projectionToken);
      let projection = this.addProjection();
      projection.setValuesFromToken(projectionToken);

      log.info('ProjectionGroup initProjectionsFromString Loop - Projection', projection);

      let property = pathToPropertyMap[projection.key];
      if (!(typeof property === 'undefined' || property === null)) {
        projection.setProperty(property);
      } else {
        log.error('In initProjectionsFromString, property not properly defined.');
      }
    }
  }

  renderSyntax () {
    let syntax = '(';

    let count = 0;
    for (let projection of this.projectionList) {
      count++;
      if (count > 1) {
        syntax += ',';
      }
      syntax += projection.renderSyntax();
    }

    syntax += ')';

    return syntax;
  }

  renderSimpleObject (applySpecialHandlerConversions) {
    let simple = {};
    simple.property = this.renderProjectionsAsString(applySpecialHandlerConversions);
    simple.grouped = this.grouped;
    simple.projectionAsMap = this.projectionAsMap;
    return simple;
  }

  /**
   * Renders the ConstraintGroup as a complex queryString parameter, supporting many constraints and subConstraintGroups.
   * @return String parameter
   */
  renderQueryString (applySpecialHandlerConversions) {
    let simpleObject = this.renderSimpleObject(applySpecialHandlerConversions);
    return serializeObjectToQueryStringParameters(simpleObject);
  }

  /**
   * Renders the URI Decoded version of the ConstraintGroup as a complex queryString parameter, supporting many constraints and subConstraintGroups.
   * This is used for viewing and debugging.
   * @return String parameter
   */
  renderQueryStringDecoded (applySpecialHandlerConversions) {
    return decodeURIComponent(this.renderQueryString(applySpecialHandlerConversions));
  }

  /**
   * Renders the group's direct child constraints as a string concatenated with a semicolon delimiter.
   * @param applySpecialHandlerConversions true to mutate constraint names for back end compatibility.
   * False for preserving saved filter definitions as entered.
   * @return {string}
   */
  renderProjectionsAsString (applySpecialHandlerConversions) {
    let queryString = '';
    let count = 0;
    for (let projection of this.projectionList) {
      count++;
      queryString += projection.renderQueryString(applySpecialHandlerConversions);
      if (count < this.projectionList.length) {
        queryString += ';';
      }
    }

    return queryString;
  }

}
