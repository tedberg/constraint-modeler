import { log } from '@/common/LoggingFacade';
import QueryElement from './QueryElement';

let projectionId = 1000;

function projectionIdGenerator () {
  projectionId += 100;
  return projectionId;
}

// used for testing
export function resetProjectionIdGenerator () {
  projectionId = 1000;
}

/**
 *  A Projection models a single property or function used in selecting/projecting data.
 */
export default class ProjectionModel extends QueryElement {

  // TODO, several ways to init model from JSON, queryString, etc.  Maybe a factory/builder pattern here?

  constructor () {
    super(projectionIdGenerator());
  }

  isValid () {
    return !(typeof this.key === 'undefined' || this.key === null);
  }

  getReasonInvalid () {
    return !this.isValid() ? 'Property must be defined.' : '';
  }

  // TODO: Need to review
  setValuesFromToken (token) {
    let keyValuePair = token.split(':');  // [0] = contact.lastname

    if (keyValuePair.length !== 1) {
      log.error('Invalid projection token passed.  Was = ', token);
    }

    this.splitFunctionFromKey(keyValuePair[0]); // Check for aggregate or query function and process as necessary.

    log.debug('In setValuesFromToken', 'keyValuePair = ', keyValuePair, keyValuePair.length);
  }

  renderSyntax () {
    let syntax;
    if (typeof this.queryFunction !== 'undefined' && this.queryFunction !== null) {
      syntax = `${this.queryFunction}(${this.key})`;
    } else {
      syntax = this.key;
    }

    return syntax;
  }

  /**
   * Render the constraint as a query string token.
   * @param applySpecialHandlerConversions true to mutate constraint names for back end compatibility.
   * False for preserving saved filter definitions as entered.
   * @returns {string} The syntax of the constraint in query string format.
   */
  renderQueryString (applySpecialHandlerConversions) {
    let queryString;
    let projectionName = this.key;

    if (typeof this.queryFunction !== 'undefined' && this.queryFunction !== null) {
      queryString = `${this.queryFunction.alias}(${projectionName})`;
    } else {
      queryString = projectionName;
    }

    return queryString;
  }

}

