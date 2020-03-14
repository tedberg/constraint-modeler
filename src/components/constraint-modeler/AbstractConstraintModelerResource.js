import ApiResource from '../../common/ApiResource';

/**
 * This is a base class for ConstraintModelerResource, listing the required methods to implement.
 */
export default class AbstractConstraintModelerResource extends ApiResource {

  loadValueList (serverDataType) {
    throw new Error('Must not call abstract method directly.');
  }

  loadProperties (objectName) {
    throw new Error('Must not call abstract method directly.');
  }

  validateConstraintModeler (className, constraintList) {
    throw new Error('Must not call abstract method directly.');
  }

  loadResultWithConstraints (className, urlEncodedConstraintQueryString) {
    throw new Error('Must not call abstract method directly.');
  }

  static implementsRequiredMethods (obj) {
    if (!obj) {
      return false;
    }

    return (
      typeof obj.loadValueList === 'function' &&
      typeof obj.loadProperties === 'function' &&
      typeof obj.validateConstraintModeler === 'function' &&
      typeof obj.loadResultWithConstraints === 'function'
    );

  }

  static isValidImplementation(obj) {
    return (obj instanceof AbstractConstraintModelerResource ||
      AbstractConstraintModelerResource.implementsRequiredMethods(obj));
  }

}
