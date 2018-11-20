export function serializeObjectToQueryStringParameters (obj, prefix) {
  let str = [];

  Object.keys(obj).map(property => {
    let k = prefix ? prefix + '[' + property + ']' : property;
    let v = obj[property];

    str.push((v !== null && typeof v === 'object')
      ? serializeObjectToQueryStringParameters(v, k)
      : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  });

  return str.join('&');
}

/**
 *  A QueryElementGroup models a container for a group of elements to be used in a Query.
 */
export default class QueryElementGroupModel {

  constructor (objectId) {
    this.objectId = objectId;
  }

  // ---------- Abstract methods ----------

  initFromQueryString (queryString, pathToPropertyMap) {
    throw new Error('Call to abstract method initFromQueryString.');
  }

  isValid () {
    throw new Error('Call to abstract method isValid.');
  }

  renderSyntax () {
    throw new Error('Call to abstract method renderSyntax.');
  }

  renderQueryString (applySpecialHandlerConversions) {
    throw new Error('Call to abstract method renderQueryString.');
  }

  renderQueryStringDecoded (applySpecialHandlerConversions) {
    throw new Error('Call to abstract method renderQueryStringDecoded.');
  }

  /**
   * Returns a count of how many queryElements are established directly within this QueryElementGroup.
   * @return {*}
   */
  getQueryElementCount () {
    throw new Error('Call to abstract method getQueryElementCount.');
  }

  // ---------- Concrete methods ----------

  getObjectId () {
    return this.objectId;
  }

  findMaxKey (myMap) {
    let keys = Object.keys(myMap);
    let maxKey = 0;
    keys.map(key => {
      if (key > maxKey) {
        maxKey = key;
      }
    });
    return Number(maxKey);
  }

  // TODO: Need to review
  renderJSON () {
    return JSON.stringify(this);
  }
}
