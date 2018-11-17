import { Enum, EnumValue } from '@/components/constraint-modeler/enum/Enum';
import { QueryFunctionEnum } from '@/components/constraint-modeler/enum/QueryFunctionEnum';
import { DataTypeEnum } from '@/components/constraint-modeler/enum/DataTypeEnum';

describe('QueryFunction Enum', () => {

  it('inherits correctly', () => {
    expect(QueryFunctionEnum instanceof Enum).toBe(true);
    expect(QueryFunctionEnum instanceof Object).toBe(true);

    expect(Enum.prototype.isPrototypeOf(QueryFunctionEnum)).toBe(true);

    expect(QueryFunctionEnum.MIN instanceof EnumValue).toBe(true);
    expect(QueryFunctionEnum.MIN instanceof Object).toBe(true);

    expect(EnumValue.prototype.isPrototypeOf(QueryFunctionEnum.MIN)).toBe(true);
  });

  it('checks instanceof correctly', () => {
    let model = 'hello';
    expect(QueryFunctionEnum.checkInstanceOf(model)).toBe(false);

    model = {};
    expect(QueryFunctionEnum.checkInstanceOf(model)).toBe(false);

    model = DataTypeEnum.NUMBER;
    expect(QueryFunctionEnum.checkInstanceOf(model)).toBe(false);

    model = QueryFunctionEnum.MIN;
    expect(QueryFunctionEnum.checkInstanceOf(model)).toBe(true);
  });

  it('valueCount correctly', () => {
    expect(QueryFunctionEnum.enumToValueList().length).toEqual(15);
  });

  it('getType correctly', () => {
    expect(QueryFunctionEnum.getType('MIN')).toEqual(QueryFunctionEnum.MIN);
    expect(QueryFunctionEnum.getType('MAX')).toEqual(QueryFunctionEnum.MAX);
    expect(QueryFunctionEnum.getType('SUM')).toEqual(QueryFunctionEnum.SUM);
    expect(QueryFunctionEnum.getType('AVG')).toEqual(QueryFunctionEnum.AVG);
    expect(QueryFunctionEnum.getType('COUNT')).toEqual(QueryFunctionEnum.COUNT);
    expect(QueryFunctionEnum.getType('UPPER')).toEqual(QueryFunctionEnum.UPPER);
    expect(QueryFunctionEnum.getType('LOWER')).toEqual(QueryFunctionEnum.LOWER);
    expect(QueryFunctionEnum.getType('TRIM')).toEqual(QueryFunctionEnum.TRIM);
    expect(QueryFunctionEnum.getType('LENGTH')).toEqual(QueryFunctionEnum.LENGTH);
    expect(QueryFunctionEnum.getType('ABS')).toEqual(QueryFunctionEnum.ABS);
    expect(QueryFunctionEnum.getType('SQRT')).toEqual(QueryFunctionEnum.SQRT);
    expect(QueryFunctionEnum.getType('DAY')).toEqual(QueryFunctionEnum.DAY);
    expect(QueryFunctionEnum.getType('MONTH')).toEqual(QueryFunctionEnum.MONTH);
    expect(QueryFunctionEnum.getType('YEAR')).toEqual(QueryFunctionEnum.YEAR);
    expect(QueryFunctionEnum.getType('SIZE')).toEqual(QueryFunctionEnum.SIZE);

    expect(QueryFunctionEnum.getType('')).toBeNull();
    expect(QueryFunctionEnum.getType('Unexpected Junk')).toBeNull();
    expect(QueryFunctionEnum.getType(null)).toBeNull();
    expect(QueryFunctionEnum.getType(undefined)).toBeNull();
  });

  it('getTypeFromAlias correctly', () => {
    expect(QueryFunctionEnum.getTypeFromAlias('min')).toEqual(QueryFunctionEnum.MIN);
    expect(QueryFunctionEnum.getTypeFromAlias('max')).toEqual(QueryFunctionEnum.MAX);
    expect(QueryFunctionEnum.getTypeFromAlias('sum')).toEqual(QueryFunctionEnum.SUM);
    expect(QueryFunctionEnum.getTypeFromAlias('avg')).toEqual(QueryFunctionEnum.AVG);
    expect(QueryFunctionEnum.getTypeFromAlias('count')).toEqual(QueryFunctionEnum.COUNT);
    expect(QueryFunctionEnum.getTypeFromAlias('upper')).toEqual(QueryFunctionEnum.UPPER);
    expect(QueryFunctionEnum.getTypeFromAlias('lower')).toEqual(QueryFunctionEnum.LOWER);
    expect(QueryFunctionEnum.getTypeFromAlias('trim')).toEqual(QueryFunctionEnum.TRIM);
    expect(QueryFunctionEnum.getTypeFromAlias('length')).toEqual(QueryFunctionEnum.LENGTH);
    expect(QueryFunctionEnum.getTypeFromAlias('abs')).toEqual(QueryFunctionEnum.ABS);
    expect(QueryFunctionEnum.getTypeFromAlias('sqrt')).toEqual(QueryFunctionEnum.SQRT);
    expect(QueryFunctionEnum.getTypeFromAlias('day')).toEqual(QueryFunctionEnum.DAY);
    expect(QueryFunctionEnum.getTypeFromAlias('month')).toEqual(QueryFunctionEnum.MONTH);
    expect(QueryFunctionEnum.getTypeFromAlias('year')).toEqual(QueryFunctionEnum.YEAR);
    expect(QueryFunctionEnum.getTypeFromAlias('size')).toEqual(QueryFunctionEnum.SIZE);

    expect(QueryFunctionEnum.getTypeFromAlias('')).toBeNull();
    expect(QueryFunctionEnum.getTypeFromAlias('Unexpected Junk')).toBeNull();
    expect(QueryFunctionEnum.getTypeFromAlias(null)).toBeNull();
    expect(QueryFunctionEnum.getTypeFromAlias(undefined)).toBeNull();
  });

  it('getQueryFunctionValueList correctly', () => {
    expect(QueryFunctionEnum.getQueryFunctionValueList().length).toEqual(10);
  });

  it('getQueryFunctionValueListForInputType correctly', () => {
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.STRING).length).toEqual(4);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.NUMBER).length).toEqual(2);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.BOOLEAN).length).toEqual(0);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.DATE).length).toEqual(3);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.ENUM).length).toEqual(0);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.URL).length).toEqual(0);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.OBJECT).length).toEqual(0);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.LOB).length).toEqual(0);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.COLLECTION).length).toEqual(1);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(null).length).toEqual(0);
    expect(QueryFunctionEnum.getQueryFunctionValueListForInputType(undefined).length).toEqual(0);
  });

  it('getAggregateFunctionValueList correctly', () => {
    expect(QueryFunctionEnum.getAggregateFunctionValueList().length).toEqual(5);

  });

  it('getAggregateFunctionValueListForInputType correctly', () => {
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.STRING).length).toEqual(1);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.NUMBER).length).toEqual(5);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.BOOLEAN).length).toEqual(1);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.DATE).length).toEqual(1);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.ENUM).length).toEqual(1);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.URL).length).toEqual(1);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.OBJECT).length).toEqual(0);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.LOB).length).toEqual(0);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(DataTypeEnum.COLLECTION).length).toEqual(0);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(null).length).toEqual(0);
    expect(QueryFunctionEnum.getAggregateFunctionValueListForInputType(undefined).length).toEqual(0);
  });

  it('isInputCollection correctly', () => {
    expect(QueryFunctionEnum.MIN.isInputCollection()).toBe(false);
    expect(QueryFunctionEnum.MAX.isInputCollection()).toBe(false);
    expect(QueryFunctionEnum.SUM.isInputCollection()).toBe(false);

    expect(QueryFunctionEnum.SIZE.isInputCollection()).toBe(true);
  });

  it('isInputNumeric correctly', () => {
    expect(QueryFunctionEnum.MIN.isInputNumeric()).toBe(true);
    expect(QueryFunctionEnum.MAX.isInputNumeric()).toBe(true);
    expect(QueryFunctionEnum.SUM.isInputNumeric()).toBe(true);

    expect(QueryFunctionEnum.COUNT.isInputNumeric()).toBe(false);
    expect(QueryFunctionEnum.UPPER.isInputNumeric()).toBe(false);
    expect(QueryFunctionEnum.LENGTH.isInputNumeric()).toBe(false);

    expect(QueryFunctionEnum.SQRT.isInputNumeric()).toBe(true);

    expect(QueryFunctionEnum.MONTH.isInputNumeric()).toBe(false);

    expect(QueryFunctionEnum.SIZE.isInputNumeric()).toBe(false);
  });

  it('isOutputNumeric correctly', () => {
    expect(QueryFunctionEnum.MIN.isOutputNumeric()).toBe(true);
    expect(QueryFunctionEnum.MAX.isOutputNumeric()).toBe(true);
    expect(QueryFunctionEnum.SUM.isOutputNumeric()).toBe(true);

    expect(QueryFunctionEnum.COUNT.isOutputNumeric()).toBe(true);
    expect(QueryFunctionEnum.UPPER.isOutputNumeric()).toBe(false);
    expect(QueryFunctionEnum.LENGTH.isOutputNumeric()).toBe(true);

    expect(QueryFunctionEnum.SQRT.isOutputNumeric()).toBe(true);

    expect(QueryFunctionEnum.MONTH.isOutputNumeric()).toBe(true);

    expect(QueryFunctionEnum.SIZE.isOutputNumeric()).toBe(true);
  });

});
