import { Enum, EnumValue } from '@/components/constraint-modeler/enum/Enum';
import { JunctionEnum } from '@/components/constraint-modeler/enum/JunctionEnum';

describe('Junction Enum', () => {

  it('inherits correctly', () => {
    expect(JunctionEnum instanceof Enum).toBe(true);
    expect(JunctionEnum instanceof Object).toBe(true);

    expect(Enum.prototype.isPrototypeOf(JunctionEnum)).toBe(true);

    expect(JunctionEnum.AND instanceof EnumValue).toBe(true);
    expect(JunctionEnum.AND instanceof Object).toBe(true);

    expect(EnumValue.prototype.isPrototypeOf(JunctionEnum.AND)).toBe(true);
  });

  it('valueCount correctly', () => {
    expect(JunctionEnum.enumToValueList().length).toEqual(3);
  });

  it('getType correctly', () => {
    expect(JunctionEnum.getType('AND')).toEqual(JunctionEnum.AND);
    expect(JunctionEnum.getType('OR')).toEqual(JunctionEnum.OR);
    expect(JunctionEnum.getType('NOT')).toEqual(JunctionEnum.NOT);
    expect(JunctionEnum.getType('')).toBeNull();
    expect(JunctionEnum.getType('Unexpected Junk')).toBeNull();
    expect(JunctionEnum.getType(null)).toBeNull();
    expect(JunctionEnum.getType(undefined)).toBeNull();
  });

  it('getTypeFromAlias correctly', () => {
    expect(JunctionEnum.getTypeFromAlias('and')).toEqual(JunctionEnum.AND);
    expect(JunctionEnum.getTypeFromAlias('or')).toEqual(JunctionEnum.OR);
    expect(JunctionEnum.getTypeFromAlias('not')).toEqual(JunctionEnum.NOT);
    expect(JunctionEnum.getTypeFromAlias('')).toBeNull();
    expect(JunctionEnum.getTypeFromAlias('Unexpected Junk')).toBeNull();
    expect(JunctionEnum.getTypeFromAlias(null)).toBeNull();
    expect(JunctionEnum.getTypeFromAlias(undefined)).toBeNull();
  });


});
