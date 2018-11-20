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

}
