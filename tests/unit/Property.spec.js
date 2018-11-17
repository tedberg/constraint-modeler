
import Property from '@/components/constraint-modeler/Property';
import { DataTypeEnum } from '../../src/components/constraint-modeler/enum/DataTypeEnum';

const PROPERTIES_LIST = {
  'propertyList': [
    {
      'path': 'name',
      'displayName': 'Name',
      'simpleDataType': 'string',
      'dataType': 'java.lang.String'
    },
    {
      'path': 'age',
      'displayName': 'Age',
      'simpleDataType': 'number',
      'dataType': 'java.lang.Integer'
    },
    {
      'path': 'status',
      'displayName': 'Status',
      'simpleDataType': 'enum',
      'dataType': 'com.xyz.model.Status'
    }
  ],
  'multiPropertyList': [
    {
      'path': 'alert',
      'displayName': 'alert',
      'simpleDataType': 'object',
      'dataType': 'com.xyz.Alert',
      'expectedDataMagnitude': 10000,
      'keyDisplayPropertyPath': null,
      'relationship': true,
      'multiProperty': true,
      'nestedPropertyList': [
        {
          'path': 'alert.message',
          'displayName': 'Message',
          'simpleDataType': 'string',
          'dataType': 'java.lang.String'
        }
      ]
    }
  ]
};

describe('Property.js', () => {
  it('configures correctly', () => {
    const msg = 'new message';
    const property = new Property(PROPERTIES_LIST.propertyList[1]);
    expect(property.path).toMatch('age');
    expect(property.displayName).toMatch('Age');
    expect(property.simpleDataType).toMatch('number');
    expect(property.dataType).toMatch('java.lang.Integer');

    expect(property.isObjectType()).toEqual(false);
    expect(property.getSimpleDataTypeEnum()).toEqual(DataTypeEnum.NUMBER);
    expect(property.getServerDataType()).toMatch('java.lang.Integer');
  });
});
