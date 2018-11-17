import ConstraintModel, { resetConstraintIdGenerator } from '@/components/constraint-modeler/model/ConstraintModel';
import QueryElement from '@/components/constraint-modeler/model/QueryElement';
import { QueryFunctionEnum } from '@/components/constraint-modeler/enum/QueryFunctionEnum';
import Property from '@/components/constraint-modeler/Property';

let pathToPropertyMap;
let constraint1;
let constraint2;
let constraint3;

beforeEach(() => {
  resetConstraintIdGenerator();

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

  // id 11000
  constraint1 = new ConstraintModel();
  constraint1.key = 'c1';
  constraint1.setValue('val1');

  // id 12000
  constraint2 = new ConstraintModel();
  constraint2.key = 'c2';
  constraint2.setValue('val2');

  // id 13000
  constraint3 = new ConstraintModel();
  constraint3.key = 'c3';
  constraint3.setValue('val3');
});

afterEach(() => {
  pathToPropertyMap = null;
  constraint1 = null;
  constraint2 = null;
  constraint3 = null;
});

describe('ConstraintModel simple tests', () => {

  it('constructs correctly', () => {
    expect(constraint1.getObjectId()).toEqual(11000);
  });

  it('a basic test example', () => {
    expect(constraint1.key).toEqual('c1');
    expect(constraint1.value).toEqual('val1');
  });

  it('inherits correctly', () => {
    expect(constraint1 instanceof ConstraintModel).toBe(true);
    expect(constraint1 instanceof QueryElement).toBe(true);
    expect(constraint1 instanceof Object).toBe(true);

    expect(QueryElement.prototype.isPrototypeOf(constraint1)).toBe(true);

    expect(constraint2 instanceof ConstraintModel).toBe(true);
    expect(constraint2 instanceof QueryElement).toBe(true);
    expect(constraint2 instanceof Object).toBe(true);
  });

  it('splitFunctionFromKey correctly', () => {
    let simpleKey = 'contact.lastname';
    let functionKey = 'upper(contact.lastname)';
    let aggregateKey = 'max(contact.lastname)';

    constraint1.splitFunctionFromKey(simpleKey);
    expect(constraint1.key).toEqual(simpleKey);

    constraint1.splitFunctionFromKey(functionKey);
    expect(constraint1.key).toEqual(simpleKey);
    expect(constraint1.queryFunction).toEqual(QueryFunctionEnum.UPPER);

    constraint1.splitFunctionFromKey(aggregateKey);
    expect(constraint1.key).toEqual(simpleKey);
    expect(constraint1.queryFunction).toEqual(QueryFunctionEnum.MAX);
  });


});
