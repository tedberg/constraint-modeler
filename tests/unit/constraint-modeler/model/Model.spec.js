import Model from '@/components/constraint-modeler/model/Model';
import { ROOT_CONSTRAINT_GROUP_ID } from '@/components/constraint-modeler/model/ConstraintGroupModel';
import StubConstraintModelerResource from '@/components/constraint-modeler/StubConstraintModelerResource';
import { JunctionEnum } from '../../../../src/components/constraint-modeler/enum/JunctionEnum';

const FULL_JSON_OBJECT =
  {
    'projectionGroup': {
      'property': 'id;name;age',
      'grouped': false,
      'projectionAsMap': false
    },
    'constraintGroup': {
      'constraint': {
        'value': 'c1:eq:val1;c2:eq:val2;c3:eq:val3',    // This is 3 constraints
        'sub1': {                                       // First sub constraint Group
          'value': 'c11:eq:val11;c12:notnull',         // Two more constraints
          'sub1': {                                     // First sub constraint Group under previous Constraint group
            'junction': 'or',                          // Defines junction OR instead of default AND
            'value': 'lower(c21):eq:val21;c22:eq:val22'       // Two more constraints which will use the OR junction
          }
        },
        'sub2': {                                       // Second sub constraint group
          'value': 'c31:eq:val31;c32:in:val32a,val32b'          // Two more constraints (AND Junction)
        }
      }
    }
  };


let personModel;

beforeEach(() => {
  personModel = new Model('Person', new StubConstraintModelerResource());
});

afterEach(() => {
  personModel = null;
});

describe('Model simple tests', () => {

  it('constructs correctly', () => {
    expect(() => {
      new Model();
    }).toThrow();

    expect(() => {
      new Model(null);
    }).toThrow();

    expect(() => {
      new Model('Person', 'blah');
    }).toThrow();

    let sampleModel = new Model('Sample');
    expect(sampleModel.objectName).toMatch('Sample');

    sampleModel = new Model('Sample', new StubConstraintModelerResource());
    expect(sampleModel.objectName).toMatch('Sample');
    expect(sampleModel.constraintModelerResource).toBeInstanceOf(StubConstraintModelerResource);

    let cg = sampleModel.getRootConstraintGroup();
    expect(cg.getObjectId()).toEqual(ROOT_CONSTRAINT_GROUP_ID);
    expect(cg.isRoot()).toBe(true);
  });

  it('loads Properties correctly', () => {
    let promise = personModel.loadProperties();
    promise.then(data => {
      expect(data).toBeDefined();
      expect(data.propertyList).toBeDefined();
      expect(data.multiPropertyList).toBeDefined();

      let propertyList = personModel.getPropertyList();
      let multiPropertyList = personModel.getMultiPropertyList();

      expect(propertyList).toHaveLength(3);
      expect(multiPropertyList).toHaveLength(1);
    });
  });

  it('builds Model From Null Json correctly', () => {
    const nullJsonObject = null;

    expect.assertions(4);

    let promise = personModel.loadProperties();
    return promise.then(data => {
      personModel.buildModelFromJson(nullJsonObject);

      expect(personModel.getProjectionGroup()).toBeNull();

      let cg = personModel.getRootConstraintGroup();
      expect(cg.getJunction()).toEqual(JunctionEnum.AND);
      expect(cg.getConstraintList()).toHaveLength(0);
      expect(cg.getConstraintGroupList()).toHaveLength(0);
    });
  });

  it('builds Model From Empty Json correctly', () => {
    const emptyJsonObject = {};

    expect.assertions(4);

    let promise = personModel.loadProperties();
    return promise.then(data => {
      personModel.buildModelFromJson(emptyJsonObject);

      expect(personModel.getProjectionGroup()).toBeNull();

      let cg = personModel.getRootConstraintGroup();
      expect(cg.getJunction()).toEqual(JunctionEnum.AND);
      expect(cg.getConstraintList()).toHaveLength(0);
      expect(cg.getConstraintGroupList()).toHaveLength(0);
    });
  });

  it('builds Model From Older Json correctly', () => {
    const olderJsonObject = {
      'constraint': {
        'value': 'c1:eq:val1;c2:eq:val2;c3:eq:val3',    // This is 3 constraints
        'sub1': {                                       // First sub constraint Group
          'value': 'c11:eq:val11;c12:eq:val12',         // Two more constraints
          'sub1': {                                     // First sub constraint Group under previous Constraint group
            'junction': 'or',                          // Defines junction OR instead of default AND
            'value': 'c21:eq:val21;c22:eq:val22'       // Two more constraints which will use the OR junction
          }
        },
        'sub2': {                                       // Second sub constraint group
          'value': 'c31:eq:val31;c32:eq:val32'          // Two more constraints (AND Junction)
        }
      }
    };

    expect.assertions(4);

    let promise = personModel.loadProperties();
    return promise.then(data => {
      personModel.buildModelFromJson(olderJsonObject);

      expect(personModel.getProjectionGroup()).toBeNull();

      let rootCg = personModel.getRootConstraintGroup();
      expect(rootCg.getJunction()).toEqual(JunctionEnum.AND);
      expect(rootCg.getConstraintList()).toHaveLength(3);
      expect(rootCg.getConstraintGroupList()).toHaveLength(2);

      // TODO: More assertions

    });
  });


  it('builds Model From Full Json correctly', () => {
    expect.assertions(7);

    let promise = personModel.loadProperties();
    return promise.then(data => {
      personModel.buildModelFromJson(FULL_JSON_OBJECT);

      let projectionGroup = personModel.getProjectionGroup();
      expect(projectionGroup).not.toBeNull();
      expect(projectionGroup.getProjectionList()).toHaveLength(3);
      expect(projectionGroup.isGrouped()).toBe(false);
      expect(projectionGroup.isProjectionAsMap()).toBe(false);

      let rootCg = personModel.getRootConstraintGroup();
      expect(rootCg.getJunction()).toEqual(JunctionEnum.AND);
      expect(rootCg.getConstraintList()).toHaveLength(3);
      expect(rootCg.getConstraintGroupList()).toHaveLength(2);

      // TODO: More assertions

    });
  });
});


describe('Model simple tests', () => {
  beforeEach(() => {
    let promise = personModel.loadProperties();
    return promise.then(data => {
      personModel.buildModelFromJson(FULL_JSON_OBJECT);
    });

  });

  it('renders syntax correctly', () => {
    const expectedSyntax = '(id,name,age)' +
      '(c1 Equal \'val1\' And c2 Equal \'val2\' And ' +
      'c3 Equal \'val3\' And ' +
      '(c11 Equal \'val11\' And c12 Is Not Null And (Lower(c21) Equal \'val21\' Or c22 Equal \'val22\')) And ' +
      '(c31 Equal \'val31\' And c32 In (\'val32a\', \'val32b\')))';

    expect(personModel.renderSyntax()).toMatch(expectedSyntax);
  });

  it('renders QueryString correctly', () => {
    const expectedQueryString = 'property=id;name;age&grouped=false&projectionAsMap=false' +
      '&constraint[value]=c1:eq:val1;c2:eq:val2;c3:eq:val3' +
      '&constraint[sub1][value]=c11:eq:val11;c12:notnull' +
      '&constraint[sub1][sub1][junction]=or' +
      '&constraint[sub1][sub1][value]=lower(c21):eq:val21;c22:eq:val22' +
      '&constraint[sub2][value]=c31:eq:val31;c32:in:val32a,val32b';

    expect(personModel.renderQueryString()).toMatch(expectedQueryString);
  });

  it('renders simple JSON correctly', () => {
    const simpleJsonObject = {
      'constraintGroup': {
        'constraint': {
          'value': 'c1:eq:val1;c2:eq:val2;c3:eq:val3',
          'sub1': {
            'value': 'c11:eq:val11;c12:notnull',
            'sub1': {
              'junction': 'or',
              'value': 'lower(c21):eq:val21;c22:eq:val22'
            }
          },
          'sub2': {
            'value': 'c31:eq:val31;c32:in:val32a,val32b'
          }
        }
      },
      'projectionGroup': {
        'property': 'id;name;age',
        'grouped': false,
        'projectionAsMap': false
      }
    };

    expect(personModel.renderSimpleJSON()).toMatch(JSON.stringify(simpleJsonObject));
  });


});
