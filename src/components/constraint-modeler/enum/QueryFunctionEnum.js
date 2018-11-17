import {Enum, EnumValue} from './Enum';
import {DataTypeEnum} from './DataTypeEnum';

/**
 *  Enumeration of supported QueryFunction functions, including Aggregate functions.
 */
export var QueryFunctionEnum = (function (DataTypeEnum) {
  'use strict';

  QueryFunction.prototype = Object.create(EnumValue.prototype);
  QueryFunction.prototype.constructor = QueryFunction;

  function QueryFunction(key, label, alias, aggregateFunctionFlag, inputDataType, outputDataType) {
    // Call the parent constructor
    EnumValue.call(this, key, label, alias);

    this.aggregateFunctionFlag = aggregateFunctionFlag;
    this.inputDataType = inputDataType;
    this.outputDataType = outputDataType;

    this.isAggregate = function () {
      return this.aggregateFunctionFlag;
    };

    this.isInputCollection = function () {
      return this.inputDataType === DataTypeEnum.COLLECTION;
    };

    this.getInputDataType = function () {
      return this.inputDataType;
    };

    this.getOutputDataType = function () {
      return this.outputDataType;
    };

    this.isInputNumeric = function () {
      return this.inputDataType === DataTypeEnum.NUMBER;
    };

    this.isOutputNumeric = function () {
      return this.outputDataType === DataTypeEnum.NUMBER;
    };
  }

  EnumDefs.prototype = Object.create(Enum.prototype);
  EnumDefs.prototype.constructor = EnumDefs;

  function EnumDefs() {
    // Call the parent constructor
    Enum.call(this);

    this.MIN = new QueryFunction('MIN', 'Min', 'min', true, DataTypeEnum.NUMBER, DataTypeEnum.NUMBER);
    this.MAX = new QueryFunction('MAX', 'Max', 'max', true, DataTypeEnum.NUMBER, DataTypeEnum.NUMBER);
    this.SUM = new QueryFunction('SUM', 'Sum', 'sum', true, DataTypeEnum.NUMBER, DataTypeEnum.NUMBER);
    this.AVG = new QueryFunction('AVG', 'Average', 'avg', true, DataTypeEnum.NUMBER, DataTypeEnum.NUMBER);
    this.COUNT = new QueryFunction('COUNT', 'Count', 'count', true, DataTypeEnum.STRING, DataTypeEnum.NUMBER);   // TODO: Input can be any single value dataType
    this.UPPER = new QueryFunction('UPPER', 'Upper', 'upper', false, DataTypeEnum.STRING, DataTypeEnum.STRING);
    this.LOWER = new QueryFunction('LOWER', 'Lower', 'lower', false, DataTypeEnum.STRING, DataTypeEnum.STRING);
    this.TRIM = new QueryFunction('TRIM', 'Trim', 'trim', false, DataTypeEnum.STRING, DataTypeEnum.STRING);
    this.LENGTH = new QueryFunction('LENGTH', 'Length', 'length', false, DataTypeEnum.STRING, DataTypeEnum.NUMBER); // length(s) -- returns numeric value
    this.ABS = new QueryFunction('ABS', 'Abs', 'abs', false, DataTypeEnum.NUMBER, DataTypeEnum.NUMBER);
    this.SQRT = new QueryFunction('SQRT', 'Sqrt', 'sqrt', false, DataTypeEnum.NUMBER, DataTypeEnum.NUMBER);
    //this.MOD = new QueryFunction('MOD', 'Mod', 'mod', false, DataTypeEnum.NUMBER); // TODO: Mod needs 2 inputs, numerator and denominator
    this.DAY = new QueryFunction('DAY', 'Day', 'day', false, DataTypeEnum.DATE, DataTypeEnum.NUMBER);
    this.MONTH = new QueryFunction('MONTH', 'Month', 'month', false, DataTypeEnum.DATE, DataTypeEnum.NUMBER);
    this.YEAR = new QueryFunction('YEAR', 'Year', 'year', false, DataTypeEnum.DATE, DataTypeEnum.NUMBER);
    this.SIZE = new QueryFunction('SIZE', 'Size', 'size', false, DataTypeEnum.COLLECTION, DataTypeEnum.NUMBER); // size(collection) -- returns an integer (0 if empty)

    this.getAggregateFunctionValueList = function () {
      let self = this;
      let valueArray = [];
      let keys = Object.keys(self);
      keys.map(function (key) {
        let item = self[key];
        if (typeof item !== 'function' && item.isAggregate()) {
          valueArray.push(item);
        }
      });

      return valueArray;
    };

    this.getAggregateFunctionValueListForInputType = function (inputDataType) {
      let self = this;
      let valueArray = [];
      if (inputDataType) {
        let keys = Object.keys(self);
        keys.map(function (key) {
          let item = self[key];
          if (item === QueryFunctionEnum.COUNT) {
            if (inputDataType !== DataTypeEnum.OBJECT && inputDataType !== DataTypeEnum.LOB && inputDataType !== DataTypeEnum.COLLECTION) {
              valueArray.push(item);
            }
          } else {
            if (typeof item !== 'function' && item.isAggregate() && item.getInputDataType() === inputDataType) {
              valueArray.push(item);
            }
          }
        });
      }

      return valueArray;
    };

    this.getQueryFunctionValueList = function () {
      let self = this;
      let valueArray = [];
      let keys = Object.keys(self);
      keys.map(function (key) {
        let item = self[key];
        if (typeof item !== 'function' && !item.isAggregate()) {
          valueArray.push(item);
        }
      });

      return valueArray;
    };

    this.getQueryFunctionValueListForInputType = function (inputDataType) {
      let self = this;
      let valueArray = [];
      if (inputDataType) {
        let keys = Object.keys(self);
        keys.map(function (key) {
          let item = self[key];
          if (typeof item !== 'function' && !item.isAggregate() && item.getInputDataType() === inputDataType) {
            valueArray.push(item);
          }
        });
      }

      return valueArray;
    };

    this.checkInstanceOf = function (obj) {
      return obj instanceof QueryFunction;
    };
  }

  let returnValue = new EnumDefs();

  if (typeof Object.freeze === 'function') {
    returnValue = Object.freeze(returnValue);
  }

  return returnValue;
}(DataTypeEnum));
