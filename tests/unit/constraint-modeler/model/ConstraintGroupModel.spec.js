import ConstraintGroupModel, { ROOT_CONSTRAINT_GROUP_ID, resetConstraintGroupIdGenerator } from '@/components/constraint-modeler/model/ConstraintGroupModel';
import { JunctionEnum } from '@/components/constraint-modeler/enum/JunctionEnum';
import { ComparisonTypeEnum } from '@/components/constraint-modeler/enum/ComparisonTypeEnum';
import { resetConstraintIdGenerator } from '@/components/constraint-modeler/model/ConstraintModel';
import Property from '@/components/constraint-modeler/Property';

let pathToPropertyMap;
let rootConstraintGroup;
let constraint1;
let constraint2;
let constraint3;

beforeEach(() => {
  resetConstraintGroupIdGenerator();
  resetConstraintIdGenerator();

  // 'constraint[value]=c1:eq:val1;c2:eq:val2;c3:eq:val3';

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

  rootConstraintGroup = new ConstraintGroupModel(ROOT_CONSTRAINT_GROUP_ID);

  // id 11000
  constraint1 = rootConstraintGroup.addConstraint();
  constraint1.key = 'c1';
  constraint1.setValue('val1');

  // id 12000
  constraint2 = rootConstraintGroup.addConstraint();
  constraint2.key = 'c2';
  constraint2.setValue('val2');

  // id 13000
  constraint3 = rootConstraintGroup.addConstraint();
  constraint3.key = 'c3';
  constraint3.setValue('val3');
});

afterEach(() => {
  pathToPropertyMap = null;
  rootConstraintGroup = null;
  constraint1 = null;
  constraint2 = null;
  constraint3 = null;
});

describe('ConstraintGroupModel simple tests', () => {

  it('constructs correctly', () => {
    expect(rootConstraintGroup.getObjectId()).toEqual(ROOT_CONSTRAINT_GROUP_ID);
  });

  it('finds simple constraint correctly', () => {
    let constraint12000 = rootConstraintGroup.findConstraintById(12000);
    expect(constraint12000).not.toBeUndefined();
    expect(constraint12000).not.toBeNull();

    expect(constraint12000.getObjectId()).toEqual(12000);
    expect(constraint12000.key).toMatch('c2');
    expect(constraint12000.comparisonType).toEqual(ComparisonTypeEnum.EQUAL);
    expect(constraint12000.value).toMatch('val2');
  });

  it('add/remove constraints correctly', () => {
    expect(constraint1.getObjectId()).toEqual(11000);
    expect(constraint2.getObjectId()).toEqual(12000);
    expect(constraint3.getObjectId()).toEqual(13000);

    let expectedSyntax = '(c1 Equal \'val1\' And c2 Equal \'val2\' And c3 Equal \'val3\')';
    expect(rootConstraintGroup.renderSyntax()).toMatch(expectedSyntax);

    rootConstraintGroup.removeConstraint(12000);

    expectedSyntax = '(c1 Equal \'val1\' And c3 Equal \'val3\')';
    expect(rootConstraintGroup.renderSyntax()).toMatch(expectedSyntax);
  });

  it('renders simple queryString correctly', () => {
    let expectedSyntax = 'constraint[value]=c1:eq:val1;c2:eq:val2;c3:eq:val3';
    expect(rootConstraintGroup.renderQueryStringDecoded(false)).toMatch(expectedSyntax);
  });

  it('builds constraint list from simple string token correctly', () => {
    let token = 'c1:eq:val1;c2:eq:val2;c3:eq:val3';
    let constraintGroup = new ConstraintGroupModel();

    constraintGroup.setConstraintList(ConstraintGroupModel.buildConstraintList(constraintGroup, token, pathToPropertyMap));

    let expectedSyntax = '(c1 Equal \'val1\' And c2 Equal \'val2\' And c3 Equal \'val3\')';
    expect(constraintGroup.renderSyntax()).toMatch(expectedSyntax);
  });

});

describe('ConstraintGroup with subgroups', () => {

  let subConstraintGroup1;
  let cg1Constraint1;
  let cg1Constraint2;

  let subConstraintGroup2;
  let cg2Constraint1;
  let cg2Constraint2;

  let subConstraintGroup3;
  let cg3Constraint1;
  let cg3Constraint2;

  let rootExpectedSyntax;
  let complexQueryString;

  beforeEach(() => {
    // id 1100000
    subConstraintGroup1 = rootConstraintGroup.addConstraintGroup();

    // id 14000
    cg1Constraint1 = subConstraintGroup1.addConstraint();
    cg1Constraint1.key = 'c11';
    cg1Constraint1.setValue('val11');

    // id 15000
    cg1Constraint2 = subConstraintGroup1.addConstraint();
    cg1Constraint2.key = 'c12';
    cg1Constraint2.setValue('val12');

    // id 1200000
    subConstraintGroup2 = subConstraintGroup1.addConstraintGroup();
    subConstraintGroup2.junction = JunctionEnum.OR;

    // id 16000
    cg2Constraint1 = subConstraintGroup2.addConstraint();
    cg2Constraint1.key = 'c21';
    cg2Constraint1.setValue('val21');

    // id 17000
    cg2Constraint2 = subConstraintGroup2.addConstraint();
    cg2Constraint2.key = 'c22';
    cg2Constraint2.setValue('val22');

    // id 1300000
    subConstraintGroup3 = rootConstraintGroup.addConstraintGroup();

    // id 18000
    cg3Constraint1 = subConstraintGroup3.addConstraint();
    cg3Constraint1.key = 'c31';
    cg3Constraint1.setValue('val31');

    // id 19000
    cg3Constraint2 = subConstraintGroup3.addConstraint();
    cg3Constraint2.key = 'c32';
    cg3Constraint2.setValue('val32');

    rootExpectedSyntax = '(c1 Equal \'val1\' And c2 Equal \'val2\' And c3 Equal \'val3\' And (c11 Equal \'val11\' And c12 Equal \'val12\' And (c21 Equal \'val21\' Or c22 Equal \'val22\')) And (c31 Equal \'val31\' And c32 Equal \'val32\'))';

    complexQueryString = 'constraint[value]=c1:eq:val1;c2:eq:val2;c3:eq:val3&constraint[sub1][value]=c11:eq:val11;c12:eq:val12&constraint[sub1][sub1][junction]=or&constraint[sub1][sub1][value]=c21:eq:val21;c22:eq:val22&constraint[sub2][value]=c31:eq:val31;c32:eq:val32';
  });

  afterEach(() => {
    subConstraintGroup1 = null;
    cg1Constraint1 = null;
    cg1Constraint2 = null;

    subConstraintGroup2 = null;
    cg2Constraint1 = null;
    cg2Constraint2 = null;

    subConstraintGroup3 = null;
    cg3Constraint1 = null;
    cg3Constraint2 = null;

    rootExpectedSyntax = null;
    complexQueryString = null;
  });

  it('determines root comnstraint group correctly', () => {
    expect(rootConstraintGroup.isRoot()).toBe(true);
    expect(subConstraintGroup1.isRoot()).toBe(false);
    expect(subConstraintGroup2.isRoot()).toBe(false);
    expect(subConstraintGroup3.isRoot()).toBe(false);
  });

  it('makes constraint counts correctly', () => {
    expect(rootConstraintGroup.getConstraintCount()).toEqual(3);
    expect(rootConstraintGroup.getNestedConstraintCount()).toEqual(6);
    expect(rootConstraintGroup.getTotalConstraintCount()).toEqual(9);
  });

  it('adds SubGroups and SubConstraints correctly', () => {
    expect(subConstraintGroup1.getObjectId()).toEqual(1100000);
    expect(cg1Constraint1.getObjectId()).toEqual(14000);
    expect(cg1Constraint2.getObjectId()).toEqual(15000);

    expect(subConstraintGroup2.getObjectId()).toEqual(1200000);
    expect(cg2Constraint1.getObjectId()).toEqual(16000);
    expect(cg2Constraint2.getObjectId()).toEqual(17000);

    expect(subConstraintGroup3.getObjectId()).toEqual(1300000);
    expect(cg3Constraint1.getObjectId()).toEqual(18000);
    expect(cg3Constraint2.getObjectId()).toEqual(19000);

    let expectedSyntax = '(c11 Equal \'val11\' And c12 Equal \'val12\' And (c21 Equal \'val21\' Or c22 Equal \'val22\'))';
    expect(subConstraintGroup1.renderSyntax()).toMatch(expectedSyntax);

    expectedSyntax = '(c21 Equal \'val21\' Or c22 Equal \'val22\')';
    expect(subConstraintGroup2.renderSyntax()).toMatch(expectedSyntax);

    expectedSyntax = '(c31 Equal \'val31\' And c32 Equal \'val32\')';
    expect(subConstraintGroup3.renderSyntax()).toMatch(expectedSyntax);

    expectedSyntax = '(c1 Equal \'val1\' And c2 Equal \'val2\' And c3 Equal \'val3\' And (c11 Equal \'val11\' And c12 Equal \'val12\' And (c21 Equal \'val21\' Or c22 Equal \'val22\')) And (c31 Equal \'val31\' And c32 Equal \'val32\'))';
    expect(rootConstraintGroup.renderSyntax()).toMatch(expectedSyntax);
  });

  it('renders complex queryString correctly', () => {
    expect(rootConstraintGroup.renderQueryStringDecoded(false)).toMatch(complexQueryString);
  });

  // TODO: Do I want to bother with query string support now?
  // it('inits from complex queryString correctly', () => {
  //   let constraintGroup = new ConstraintGroupModel();
  //   constraintGroup.setConstraintList(ConstraintGroupModel.buildConstraintList(constraintGroup, complexQueryString, {}));
  //   expect(constraintGroup.renderSyntax()).toMatch(rootExpectedSyntax);
  // });

  it('finds nested nodes correctly', () => {
    expect(rootConstraintGroup.getConstraintCount()).toEqual(3);
    expect(rootConstraintGroup.renderSyntax()).toMatch(rootExpectedSyntax);
    expect(rootConstraintGroup.isValid()).toEqual(true);

    // TODO: Do not have this implemented in new Model
    // let subCg1 = rootConstraintGroup.findSubconstraintGroup(1110000);
    // expect(subCg1).not.toBeUndefined();
    // expect(subCg1).not.toBeNull();
    // expect(subCg1.getConstraintCount()).toEqual(2);

    let constraint12 = rootConstraintGroup.findConstraintById(17000);
    expect(constraint12).not.toBeUndefined();
    expect(constraint12).not.toBeNull();
    expect(constraint12.renderSyntax()).toMatch('c22 Equal \'val22\'');

    expect(constraint12.key).toMatch('c22');
    expect(constraint12.getComparisonType()).toEqual(ComparisonTypeEnum.EQUAL);
    expect(constraint12.value).toMatch('val22');
    expect(constraint12.getValueArray()[0]).toMatch('val22');
  });

  it('deletes nested nodes correctly', () => {
    const SUB_CG1_ID = 1100000;

    expect(rootConstraintGroup.getConstraintCount()).toEqual(3);
    expect(rootConstraintGroup.getTotalConstraintCount()).toEqual(9);
    expect(rootConstraintGroup.renderSyntax()).toMatch(rootExpectedSyntax);
    expect(rootConstraintGroup.isValid()).toEqual(true);

    let subCg1 = rootConstraintGroup.findConstraintGroupById(SUB_CG1_ID);
    expect(subCg1).not.toBeUndefined();
    expect(subCg1).not.toBeNull();
    expect(subCg1.getConstraintCount()).toEqual(2);

    subConstraintGroup2.removeConstraint(17000);
    expect(rootConstraintGroup.getTotalConstraintCount()).toEqual(8);

    let deletedConstraint = rootConstraintGroup.findConstraintById(17000);
    expect(deletedConstraint).toBeUndefined();

    // expect(subCg1).not.toBeUndefined();
    // expect(subCg1).not.toBeNull();
    // expect(subCg1.getConstraintCount()).toEqual(1);

    subCg1 = rootConstraintGroup.removeConstraintGroup(SUB_CG1_ID);
    let deletedConstraintGroup = rootConstraintGroup.findConstraintGroupById(SUB_CG1_ID);
    expect(deletedConstraintGroup).toBeUndefined();

    expect(rootConstraintGroup.getTotalConstraintCount()).toEqual(5);
  });

});

/*






module("ConstraintGroup QueryStrings", {
    setup: function () {
        this.rootConstraintGroupId = 1000000;
        this.settings = {};
        this.rootConstraintGroup = new ConstraintGroup(this.rootConstraintGroupId, this.settings);

        this.constraintCount = 6;
        this.queryStringConstraintParam = "constraint[junction]=and&constraint[value]=contact.lastname:eq:Simpson;count(alert):gt:0;contact.address.city:eq:Springfield;contact.address.zipcode:notnull;status:notnull;contact.firstname:in:homer,bart,lisa";
        this.expectedSyntax = "(contact.lastname Equal Simpson And Count(alert) Greater Than 0 And contact.address.city Equal Springfield And contact.address.zipcode Is Not Null And status Is Not Null And contact.firstname In (homer, bart, lisa))";
        this.rootConstraintGroup.initFromQueryString(this.queryStringConstraintParam);
    },
    teardown: function () {
        delete this.rootConstraintGroupId;
        delete this.settings;
        delete this.rootConstraintGroup;
        delete this.constraintCount;
        delete this.queryStringConstraintParam;
        delete this.expectedSyntax;
    }
});

test("initFromQueryString", function () {
    equal(this.rootConstraintGroup.getConstraintCount(), this.constraintCount, "Number of constraints did not match expectation.");
    deepEqual(this.rootConstraintGroup.renderSyntax(), this.expectedSyntax, "Syntax did not match expectation.");
    ok(this.rootConstraintGroup.isValid(), "Was not determined to be Valid.");
    var constraint2 = this.rootConstraintGroup.findConstraint(1000002);
    deepEqual(constraint2.renderSyntax(), "Count(alert) Greater Than 0", "Syntax did not match expectation.");
    deepEqual(constraint2.key, "alert", "Constraint key did not match expected value.");
    deepEqual(constraint2.queryFunction, QueryFunctionEnum.COUNT, "Constraint queryFunction did not match expected value.");
    deepEqual(constraint2.comparisonType, ComparisonTypeEnum.GT, "Constraint comparisonType did not match expected value.");
    deepEqual(constraint2.value, "0", "Constraint value did not match expected value.");
    deepEqual(constraint2.valueArray, ["0"], "Constraint valueArray did not match expected value.");
});

test("initFromQueryString2", function () {
    this.queryStringConstraintParam = "constraint[junction]=or&constraint[value]=contact.lastname:eq:Simpson;count(alert):gt:0;contact.address.city:eq:Springfield;contact.address.zipcode:notnull;status:notnull;contact.firstname:in:homer,bart,lisa";
    this.expectedSyntax = "(contact.lastname Equal Simpson Or Count(alert) Greater Than 0 Or contact.address.city Equal Springfield Or contact.address.zipcode Is Not Null Or status Is Not Null Or contact.firstname In (homer, bart, lisa))";

    this.rootConstraintGroup = new ConstraintGroup(this.rootConstraintGroupId, this.settings);

    this.rootConstraintGroup.initFromQueryString(this.queryStringConstraintParam);
    equal(this.rootConstraintGroup.getConstraintCount(), this.constraintCount, "Number of constraints did not match expectation.");
    deepEqual(this.rootConstraintGroup.renderSyntax(), this.expectedSyntax, "Syntax did not match expectation.");
    ok(this.rootConstraintGroup.isValid(), "Was not determined to be Valid.");
    var constraint6 = this.rootConstraintGroup.findConstraint(1000006);
    deepEqual(constraint6.renderSyntax(), "contact.firstname In (homer, bart, lisa)", "Syntax did not match expectation.");
    deepEqual(constraint6.key, "contact.firstname", "Constraint key did not match expected value.");
    deepEqual(constraint6.queryFunction, null, "Constraint queryFunction did not match expected value.");
    deepEqual(constraint6.comparisonType, ComparisonTypeEnum.IN, "Constraint comparisonType did not match expected value.");
    deepEqual(constraint6.value, "homer", "Constraint value did not match expected value.");
    deepEqual(constraint6.valueArray, ["homer", "bart", "lisa"], "Constraint valueArray did not match expected value.");
});

test("add SubGroups and SubConstraints after query string", function () {
    var subConstraintGroup1 = this.rootConstraintGroup.addConstraintGroup();
    var cg1Constraint1 = subConstraintGroup1.addConstraint({key: "c11", value: "val11"});
    var cg1Constraint2 = subConstraintGroup1.addConstraint({key: "c12", value: "val12"});

    var subConstraintGroup2 = subConstraintGroup1.addConstraintGroup();
    var cg2Constraint1 = subConstraintGroup2.addConstraint({key: "c21", value: "val21"});
    var cg2Constraint2 = subConstraintGroup2.addConstraint({key: "c22", value: "val22"});

    var subConstraintGroup3 = this.rootConstraintGroup.addConstraintGroup();
    var cg3Constraint1 = subConstraintGroup3.addConstraint({key: "c31", value: "val31"});
    var cg3Constraint2 = subConstraintGroup3.addConstraint({key: "c32", value: "val32"});

    deepEqual(subConstraintGroup1.objectId, 1100000, "subConstraintGroup1.objectId did not match expected value.");
    deepEqual(cg1Constraint1.objectId, 1100001, "cg1Constraint1.objectId did not match expected value.");
    deepEqual(cg1Constraint2.objectId, 1100002, "cg1Constraint2.objectId did not match expected value.");

    deepEqual(subConstraintGroup2.objectId, 1110000, "subConstraintGroup2.objectId did not match expected value.");
    deepEqual(cg2Constraint1.objectId, 1110001, "cg2Constraint1.objectId did not match expected value.");
    deepEqual(cg2Constraint2.objectId, 1110002, "cg2Constraint2.objectId did not match expected value.");

    deepEqual(subConstraintGroup3.objectId, 1200000, "subConstraintGroup3.objectId did not match expected value.");
    deepEqual(cg3Constraint1.objectId, 1200001, "cg3Constraint1.objectId did not match expected value.");
    deepEqual(cg3Constraint2.objectId, 1200002, "cg3Constraint2.objectId did not match expected value.");
});


 */
