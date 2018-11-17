import { Enum, EnumValue } from '@/components/constraint-modeler/enum/Enum';
import { DataTypeEnum } from '@/components/constraint-modeler/enum/DataTypeEnum';

describe('DataType Enum', () => {

  it('inherits correctly', () => {
    expect(DataTypeEnum instanceof Enum).toBe(true);
    expect(DataTypeEnum instanceof Object).toBe(true);

    expect(Enum.prototype.isPrototypeOf(DataTypeEnum)).toBe(true);

    expect(DataTypeEnum.STRING instanceof EnumValue).toBe(true);
    expect(DataTypeEnum.STRING instanceof Object).toBe(true);

    expect(EnumValue.prototype.isPrototypeOf(DataTypeEnum.STRING)).toBe(true);
  });

  it('valueCount correctly', () => {
    expect(DataTypeEnum.enumToValueList().length).toEqual(9);
  });

  it('getType correctly', () => {
    expect(DataTypeEnum.getType('STRING')).toEqual(DataTypeEnum.STRING);
    expect(DataTypeEnum.getType('NUMBER')).toEqual(DataTypeEnum.NUMBER);
    expect(DataTypeEnum.getType('BOOLEAN')).toEqual(DataTypeEnum.BOOLEAN);
    expect(DataTypeEnum.getType('DATE')).toEqual(DataTypeEnum.DATE);
    expect(DataTypeEnum.getType('ENUM')).toEqual(DataTypeEnum.ENUM);
    expect(DataTypeEnum.getType('URL')).toEqual(DataTypeEnum.URL);
    expect(DataTypeEnum.getType('OBJECT')).toEqual(DataTypeEnum.OBJECT);
    expect(DataTypeEnum.getType('LOB')).toEqual(DataTypeEnum.LOB);
    expect(DataTypeEnum.getType('COLLECTION')).toEqual(DataTypeEnum.COLLECTION);

    expect(DataTypeEnum.getType('')).toBeNull();
    expect(DataTypeEnum.getType('Unexpected Junk')).toBeNull();
    expect(DataTypeEnum.getType(null)).toBeNull();
    expect(DataTypeEnum.getType(undefined)).toBeNull();
  });

  it('getTypeFromAlias correctly', () => {
    expect(DataTypeEnum.getTypeFromAlias('string')).toEqual(DataTypeEnum.STRING);
    expect(DataTypeEnum.getTypeFromAlias('number')).toEqual(DataTypeEnum.NUMBER);
    expect(DataTypeEnum.getTypeFromAlias('boolean')).toEqual(DataTypeEnum.BOOLEAN);
    expect(DataTypeEnum.getTypeFromAlias('date')).toEqual(DataTypeEnum.DATE);
    expect(DataTypeEnum.getTypeFromAlias('enum')).toEqual(DataTypeEnum.ENUM);
    expect(DataTypeEnum.getTypeFromAlias('url')).toEqual(DataTypeEnum.URL);
    expect(DataTypeEnum.getTypeFromAlias('object')).toEqual(DataTypeEnum.OBJECT);
    expect(DataTypeEnum.getTypeFromAlias('lob')).toEqual(DataTypeEnum.LOB);
    expect(DataTypeEnum.getTypeFromAlias('collection')).toEqual(DataTypeEnum.COLLECTION);

    expect(DataTypeEnum.getTypeFromAlias('')).toBeNull();
    expect(DataTypeEnum.getTypeFromAlias('Unexpected Junk')).toBeNull();
    expect(DataTypeEnum.getTypeFromAlias(null)).toBeNull();
    expect(DataTypeEnum.getTypeFromAlias(undefined)).toBeNull();
  });

});

