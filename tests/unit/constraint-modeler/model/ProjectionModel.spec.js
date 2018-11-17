import ProjectionModel, { resetProjectionIdGenerator } from '@/components/constraint-modeler/model/ProjectionModel';
import QueryElement from '@/components/constraint-modeler/model/QueryElement';
import { QueryFunctionEnum } from '@/components/constraint-modeler/enum/QueryFunctionEnum';
import Property from '@/components/constraint-modeler/Property';

let pathToPropertyMap;
let projection1;
let projection2;

beforeEach(() => {
  resetProjectionIdGenerator();

  pathToPropertyMap = {
    c1: new Property({path: 'c1', displayName: 'c1', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c2: new Property({path: 'c2', displayName: 'c2', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c3: new Property({path: 'c3', displayName: 'c3', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c11: new Property({path: 'c11', displayName: 'c11', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c12: new Property({path: 'c12', displayName: 'c12', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c21: new Property({path: 'c21', displayName: 'c21', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c22: new Property({path: 'c22', displayName: 'c22', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c31: new Property({path: 'c31', displayName: 'c31', simpleDataType: 'string', dataType: 'java.lang.String'}),
    c32: new Property({path: 'c32', displayName: 'c32', simpleDataType: 'string', dataType: 'java.lang.String'})
  };

  // id 1100
  projection1 = new ProjectionModel();
  projection1.key = 'c1';

  // id 1200
  projection2 = new ProjectionModel();
  projection2.key = 'c2';
});

afterEach(() => {
  pathToPropertyMap = null;
  projection1 = null;
  projection2 = null;
});

describe('ProjectionModel simple tests', () => {

  it('constructs correctly', () => {
    expect(projection1.getObjectId()).toEqual(1100);
  });

  it('a basic test example', () => {
    expect(projection1.key).toEqual('c1');
  });

  it('inherits correctly', () => {
    expect(projection1 instanceof ProjectionModel).toBe(true);
    expect(projection1 instanceof QueryElement).toBe(true);
    expect(projection1 instanceof Object).toBe(true);

    expect(QueryElement.prototype.isPrototypeOf(projection1)).toBe(true);
  });

  it('splitFunctionFromKey correctly', () => {
    let simpleKey = 'contact.lastname';
    let functionKey = 'upper(contact.lastname)';
    let aggregateKey = 'max(contact.lastname)';

    projection1.splitFunctionFromKey(simpleKey);
    expect(projection1.key).toEqual(simpleKey);

    projection1.splitFunctionFromKey(functionKey);
    expect(projection1.key).toEqual(simpleKey);
    expect(projection1.queryFunction).toEqual(QueryFunctionEnum.UPPER);

    projection1.splitFunctionFromKey(aggregateKey);
    expect(projection1.key).toEqual(simpleKey);
    expect(projection1.queryFunction).toEqual(QueryFunctionEnum.MAX);
  });

});
