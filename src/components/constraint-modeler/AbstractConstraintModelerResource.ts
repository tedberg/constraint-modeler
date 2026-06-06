import ApiResource from "../../common/ApiResource";

/**
 * This is a base class for ConstraintModelerResource, listing the required methods to implement.
 */
export default class AbstractConstraintModelerResource extends ApiResource {
  loadValueList(_serverDataType): any {
    throw new Error("Must not call abstract method directly.");
  }

  loadProperties(_objectName): any {
    throw new Error("Must not call abstract method directly.");
  }

  validateConstraintModeler(_className, _constraintList): any {
    throw new Error("Must not call abstract method directly.");
  }

  loadResultWithConstraints(_className, _urlEncodedConstraintQueryString): any {
    throw new Error("Must not call abstract method directly.");
  }

  static implementsRequiredMethods(obj) {
    if (!obj) {
      return false;
    }

    return (
      typeof obj.loadValueList === "function" &&
      typeof obj.loadProperties === "function" &&
      typeof obj.validateConstraintModeler === "function" &&
      typeof obj.loadResultWithConstraints === "function"
    );
  }

  static isValidImplementation(obj) {
    return (
      obj instanceof AbstractConstraintModelerResource ||
      AbstractConstraintModelerResource.implementsRequiredMethods(obj)
    );
  }
}
