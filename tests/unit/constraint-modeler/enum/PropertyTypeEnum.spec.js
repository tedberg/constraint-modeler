import { Enum, EnumValue } from '@/components/constraint-modeler/enum/Enum';
import { PropertyTypeEnum } from '@/components/constraint-modeler/enum/PropertyTypeEnum';

describe('PropertyType Enum', () => {

  it('inherits correctly', () => {
    expect(PropertyTypeEnum instanceof Enum).toBe(true);
    expect(PropertyTypeEnum instanceof Object).toBe(true);

    expect(Enum.prototype.isPrototypeOf(PropertyTypeEnum)).toBe(true);

    expect(PropertyTypeEnum.SINGLE instanceof EnumValue).toBe(true);
    expect(PropertyTypeEnum.SINGLE instanceof Object).toBe(true);

    expect(EnumValue.prototype.isPrototypeOf(PropertyTypeEnum.SINGLE)).toBe(true);
  });

  it('valueCount correctly', () => {
    expect(PropertyTypeEnum.enumToValueList().length).toEqual(3);
  });

  it('getType correctly', () => {
    expect(PropertyTypeEnum.getType('ALL')).toEqual(PropertyTypeEnum.ALL);
    expect(PropertyTypeEnum.getType('SINGLE')).toEqual(PropertyTypeEnum.SINGLE);
    expect(PropertyTypeEnum.getType('MULTI')).toEqual(PropertyTypeEnum.MULTI);

    expect(PropertyTypeEnum.getType('')).toBeNull();
    expect(PropertyTypeEnum.getType('Unexpected Junk')).toBeNull();
    expect(PropertyTypeEnum.getType(null)).toBeNull();
    expect(PropertyTypeEnum.getType(undefined)).toBeNull();
  });

  it('getTypeFromAlias correctly', () => {
    expect(PropertyTypeEnum.getTypeFromAlias('all')).toEqual(PropertyTypeEnum.ALL);
    expect(PropertyTypeEnum.getTypeFromAlias('single')).toEqual(PropertyTypeEnum.SINGLE);
    expect(PropertyTypeEnum.getTypeFromAlias('multi')).toEqual(PropertyTypeEnum.MULTI);

    expect(PropertyTypeEnum.getTypeFromAlias('')).toBeNull();
    expect(PropertyTypeEnum.getTypeFromAlias('Unexpected Junk')).toBeNull();
    expect(PropertyTypeEnum.getTypeFromAlias(null)).toBeNull();
    expect(PropertyTypeEnum.getTypeFromAlias(undefined)).toBeNull();
  });


});
