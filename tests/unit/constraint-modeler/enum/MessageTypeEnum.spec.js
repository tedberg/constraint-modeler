import { Enum, EnumValue } from '@/components/constraint-modeler/enum/Enum';
import { MessageTypeEnum } from '@/components/constraint-modeler/enum/MessageTypeEnum';

describe('MessageType Enum', () => {

  it('inherits correctly', () => {
    expect(MessageTypeEnum instanceof Enum).toBe(true);
    expect(MessageTypeEnum instanceof Object).toBe(true);

    expect(Enum.prototype.isPrototypeOf(MessageTypeEnum)).toBe(true);

    expect(MessageTypeEnum.HELP instanceof EnumValue).toBe(true);
    expect(MessageTypeEnum.HELP instanceof Object).toBe(true);

    expect(EnumValue.prototype.isPrototypeOf(MessageTypeEnum.HELP)).toBe(true);
  });

  it('valueCount correctly', () => {
    expect(MessageTypeEnum.enumToValueList().length).toEqual(4);
  });

  it('getType correctly', () => {
    expect(MessageTypeEnum.getType('HELP')).toEqual(MessageTypeEnum.HELP);
    expect(MessageTypeEnum.getType('INFO')).toEqual(MessageTypeEnum.INFO);
    expect(MessageTypeEnum.getType('WARNING')).toEqual(MessageTypeEnum.WARNING);
    expect(MessageTypeEnum.getType('ERROR')).toEqual(MessageTypeEnum.ERROR);

    expect(MessageTypeEnum.getType('')).toBeNull();
    expect(MessageTypeEnum.getType('Unexpected Junk')).toBeNull();
    expect(MessageTypeEnum.getType(null)).toBeNull();
    expect(MessageTypeEnum.getType(undefined)).toBeNull();
  });

  it('getTypeFromAlias correctly', () => {
    expect(MessageTypeEnum.getTypeFromAlias('help')).toEqual(MessageTypeEnum.HELP);
    expect(MessageTypeEnum.getTypeFromAlias('info')).toEqual(MessageTypeEnum.INFO);
    expect(MessageTypeEnum.getTypeFromAlias('warning')).toEqual(MessageTypeEnum.WARNING);
    expect(MessageTypeEnum.getTypeFromAlias('error')).toEqual(MessageTypeEnum.ERROR);

    expect(MessageTypeEnum.getTypeFromAlias('')).toBeNull();
    expect(MessageTypeEnum.getTypeFromAlias('Unexpected Junk')).toBeNull();
    expect(MessageTypeEnum.getTypeFromAlias(null)).toBeNull();
    expect(MessageTypeEnum.getTypeFromAlias(undefined)).toBeNull();
  });


});

