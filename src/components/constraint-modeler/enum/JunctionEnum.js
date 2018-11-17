import { Enum, EnumValue } from './Enum';

/**
 *  Enumeration of supported ConstraintGroup junctions.
 */
export var JunctionEnum = (function () {
    "use strict";

    Junction.prototype = Object.create(EnumValue.prototype);
    Junction.prototype.constructor = Junction;

    function Junction(key, label, alias) {
        // Call the parent constructor
        EnumValue.call(this, key, label, alias);
    }

    EnumDefs.prototype = Object.create(Enum.prototype);
    EnumDefs.prototype.constructor = EnumDefs;

    function EnumDefs() {
        // Call the parent constructor
        Enum.call(this);

        this.AND = new Junction('AND', 'And', 'and');
        this.OR = new Junction('OR', 'Or', 'or');
        this.NOT = new Junction('NOT', 'Not', 'not');

      this.checkInstanceOf = function (obj) {
        return obj instanceof Junction;
      };
    }

    let returnValue = new EnumDefs();

    if (typeof Object.freeze === 'function') {
        returnValue = Object.freeze(returnValue);
    }

    return returnValue;
}());
