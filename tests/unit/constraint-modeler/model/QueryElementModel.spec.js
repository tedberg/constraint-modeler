import QueryElementModel from '@/components/constraint-modeler/model/QueryElementModel';
import Property from '@/components/constraint-modeler/Property';
import { DataTypeEnum } from '@/components/constraint-modeler/enum/DataTypeEnum';
import { QueryFunctionEnum } from '@/components/constraint-modeler/enum/QueryFunctionEnum';

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

describe('QueryElement.js', () => {
  it('constructs correctly', () => {
    const queryElement = new QueryElementModel(123);
    expect(queryElement.getObjectId()).toEqual(123);
  });

  it('sets property correctly', () => {
    let queryElement = new QueryElementModel(123);
    const property = new Property(PROPERTIES_LIST.propertyList[1]);
    queryElement.setProperty(property);

    expect(queryElement.key).toMatch('age');
    expect(queryElement.label).toMatch('Age');
    expect(queryElement.dataType).toEqual(DataTypeEnum.NUMBER);
    expect(queryElement.serverDataType).toMatch('java.lang.Integer');
  });

  it('splits function from key for a simple key correctly', () => {
    let queryElement = new QueryElementModel(123);
    queryElement.splitFunctionFromKey('contact.lastname');

    expect(queryElement.key).toMatch('contact.lastname');
    expect(queryElement.queryFunction).toBeNull();
  });

  it('splits function from key for a function key correctly', () => {
    let queryElement = new QueryElementModel(123);
    queryElement.splitFunctionFromKey('lower(contact.lastname)');

    expect(queryElement.key).toMatch('contact.lastname');
    expect(queryElement.queryFunction).toEqual(QueryFunctionEnum.LOWER);
  });

});
