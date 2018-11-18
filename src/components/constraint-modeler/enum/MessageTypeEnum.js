import { Enum, EnumValue } from './Enum';

/**
 *  Enumeration of supported Message Types
 */
export var MessageTypeEnum = (function () {
  'use strict';

  MessageType.prototype = Object.create(EnumValue.prototype);
  MessageType.prototype.constructor = MessageType;

  function MessageType (key, label, alias) {
    // Call the parent constructor
    EnumValue.call(this, key, label, alias);
  }

  EnumDefs.prototype = Object.create(Enum.prototype);
  EnumDefs.prototype.constructor = EnumDefs;

  function EnumDefs () {
    // Call the parent constructor
    Enum.call(this);

    this.HELP = new MessageType('HELP', 'Help', 'help');
    this.INFO = new MessageType('INFO', 'Info', 'info');
    this.WARNING = new MessageType('WARNING', 'Warning', 'warning');
    this.ERROR = new MessageType('ERROR', 'Error', 'error');

    this.checkInstanceOf = function (obj) {
      return obj instanceof MessageType;
    };
  }

  let returnValue = new EnumDefs();

  if (typeof Object.freeze === 'function') {
    returnValue = Object.freeze(returnValue);
  }

  return returnValue;

}());
