import { Enum, EnumValue } from '@/components/constraint-modeler/enum/Enum';
import { ComparisonTypeEnum } from '@/components/constraint-modeler/enum/ComparisonTypeEnum';
import { DataTypeEnum } from '@/components/constraint-modeler/enum/DataTypeEnum';

describe('ComparisonType Enum', () => {

  it('inherits correctly', () => {
    expect(ComparisonTypeEnum instanceof Enum).toBe(true);
    expect(ComparisonTypeEnum instanceof Object).toBe(true);

    expect(Enum.prototype.isPrototypeOf(ComparisonTypeEnum)).toBe(true);

    expect(ComparisonTypeEnum.EQUAL instanceof EnumValue).toBe(true);
    expect(ComparisonTypeEnum.EQUAL instanceof Object).toBe(true);

    expect(EnumValue.prototype.isPrototypeOf(ComparisonTypeEnum.EQUAL)).toBe(true);
  });

  it('valueCount correctly', () => {
    expect(ComparisonTypeEnum.enumToValueList().length).toEqual(18);
  });

  it('getType correctly', () => {
    expect(ComparisonTypeEnum.getType('EQUAL')).toEqual(ComparisonTypeEnum.EQUAL);
    expect(ComparisonTypeEnum.getType('NOT_EQUAL')).toEqual(ComparisonTypeEnum.NOT_EQUAL);
    expect(ComparisonTypeEnum.getType('GT')).toEqual(ComparisonTypeEnum.GT);
    expect(ComparisonTypeEnum.getType('GTE')).toEqual(ComparisonTypeEnum.GTE);
    expect(ComparisonTypeEnum.getType('LT')).toEqual(ComparisonTypeEnum.LT);
    expect(ComparisonTypeEnum.getType('LTE')).toEqual(ComparisonTypeEnum.LTE);
    expect(ComparisonTypeEnum.getType('BETWEEN')).toEqual(ComparisonTypeEnum.BETWEEN);
    expect(ComparisonTypeEnum.getType('NOT_BETWEEN')).toEqual(ComparisonTypeEnum.NOT_BETWEEN);
    expect(ComparisonTypeEnum.getType('IN')).toEqual(ComparisonTypeEnum.IN);
    expect(ComparisonTypeEnum.getType('NOT_IN')).toEqual(ComparisonTypeEnum.NOT_IN);
    expect(ComparisonTypeEnum.getType('LIKE')).toEqual(ComparisonTypeEnum.LIKE);
    expect(ComparisonTypeEnum.getType('NOT_LIKE')).toEqual(ComparisonTypeEnum.NOT_LIKE);
    expect(ComparisonTypeEnum.getType('NULL')).toEqual(ComparisonTypeEnum.NULL);
    expect(ComparisonTypeEnum.getType('NOT_NULL')).toEqual(ComparisonTypeEnum.NOT_NULL);
    expect(ComparisonTypeEnum.getType('EMPTY')).toEqual(ComparisonTypeEnum.EMPTY);
    expect(ComparisonTypeEnum.getType('NOT_EMPTY')).toEqual(ComparisonTypeEnum.NOT_EMPTY);

    expect(ComparisonTypeEnum.getType('')).toBeNull();
    expect(ComparisonTypeEnum.getType('Unexpected Junk')).toBeNull();
    expect(ComparisonTypeEnum.getType(null)).toBeNull();
    expect(ComparisonTypeEnum.getType(undefined)).toBeNull();
  });

  it('getTypeFromAlias correctly', () => {
    expect(ComparisonTypeEnum.getTypeFromAlias('eq')).toEqual(ComparisonTypeEnum.EQUAL);
    expect(ComparisonTypeEnum.getTypeFromAlias('ne')).toEqual(ComparisonTypeEnum.NOT_EQUAL);
    expect(ComparisonTypeEnum.getTypeFromAlias('gt')).toEqual(ComparisonTypeEnum.GT);
    expect(ComparisonTypeEnum.getTypeFromAlias('gte')).toEqual(ComparisonTypeEnum.GTE);
    expect(ComparisonTypeEnum.getTypeFromAlias('lt')).toEqual(ComparisonTypeEnum.LT);
    expect(ComparisonTypeEnum.getTypeFromAlias('lte')).toEqual(ComparisonTypeEnum.LTE);
    expect(ComparisonTypeEnum.getTypeFromAlias('between')).toEqual(ComparisonTypeEnum.BETWEEN);
    expect(ComparisonTypeEnum.getTypeFromAlias('notbetween')).toEqual(ComparisonTypeEnum.NOT_BETWEEN);
    expect(ComparisonTypeEnum.getTypeFromAlias('in')).toEqual(ComparisonTypeEnum.IN);
    expect(ComparisonTypeEnum.getTypeFromAlias('notin')).toEqual(ComparisonTypeEnum.NOT_IN);
    expect(ComparisonTypeEnum.getTypeFromAlias('like')).toEqual(ComparisonTypeEnum.LIKE);
    expect(ComparisonTypeEnum.getTypeFromAlias('notlike')).toEqual(ComparisonTypeEnum.NOT_LIKE);
    expect(ComparisonTypeEnum.getTypeFromAlias('null')).toEqual(ComparisonTypeEnum.NULL);
    expect(ComparisonTypeEnum.getTypeFromAlias('notnull')).toEqual(ComparisonTypeEnum.NOT_NULL);
    expect(ComparisonTypeEnum.getTypeFromAlias('empty')).toEqual(ComparisonTypeEnum.EMPTY);
    expect(ComparisonTypeEnum.getTypeFromAlias('notempty')).toEqual(ComparisonTypeEnum.NOT_EMPTY);

    expect(ComparisonTypeEnum.getTypeFromAlias('')).toBeNull();
    expect(ComparisonTypeEnum.getTypeFromAlias('Unexpected Junk')).toBeNull();
    expect(ComparisonTypeEnum.getTypeFromAlias(null)).toBeNull();
    expect(ComparisonTypeEnum.getTypeFromAlias(undefined)).toBeNull();
  });

  it('getAllForDataType correctly', () => {
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.STRING).length).toEqual(10);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.NUMBER).length).toEqual(12);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.BOOLEAN).length).toEqual(4);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.DATE).length).toEqual(12);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.ENUM).length).toEqual(6);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.URL).length).toEqual(6);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.OBJECT).length).toEqual(4);
    expect(ComparisonTypeEnum.getAllForDataType(DataTypeEnum.LOB).length).toEqual(4);
    expect(ComparisonTypeEnum.getAllForDataType(null).length).toEqual(0);
    expect(ComparisonTypeEnum.getAllForDataType(undefined).length).toEqual(0);
  });


});
