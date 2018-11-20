import ProjectionGroupModel from '@/components/constraint-modeler/model/ProjectionGroupModel';
import { resetProjectionIdGenerator } from '@/components/constraint-modeler/model/ProjectionModel';
import Property from '@/components/constraint-modeler/Property';

let pathToPropertyMap;
let projectionGroup;
let projection1;
let projection2;
let projection3;

describe('ProjectionGroupModel.js', () => {

  beforeEach(() => {
    resetProjectionIdGenerator();

    pathToPropertyMap = {
      c1: new Property({ path: 'c1', displayName: 'c1', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c2: new Property({ path: 'c2', displayName: 'c2', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c3: new Property({ path: 'c3', displayName: 'c3', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c11: new Property({ path: 'c11', displayName: 'c11', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c12: new Property({ path: 'c12', displayName: 'c12', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c21: new Property({ path: 'c21', displayName: 'c21', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c22: new Property({ path: 'c22', displayName: 'c22', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c31: new Property({ path: 'c31', displayName: 'c31', simpleDataType: 'string', dataType: 'java.lang.String' }),
      c32: new Property({ path: 'c32', displayName: 'c32', simpleDataType: 'string', dataType: 'java.lang.String' })
    };

    let settings = { projectionAsMap: true };
    projectionGroup = new ProjectionGroupModel(settings);

    projection1 = projectionGroup.addProjection();
    projection1.key = 'c1';
    projection2 = projectionGroup.addProjection();
    projection2.key = 'c2';
    projection3 = projectionGroup.addProjection();
    projection3.key = 'c3';

  });

  afterEach(() => {
    pathToPropertyMap = null;
    projectionGroup = null;
    projection1 = null;
    projection2 = null;
    projection3 = null;
  });

  it('constructs correctly', () => {
    expect(projectionGroup.getObjectId()).toEqual(1000);
  });

  it('finds simple projection correctly', () => {
    let projection1200 = projectionGroup.findProjectionById(1200);
    expect(projection1200).not.toBeUndefined();
    expect(projection1200).not.toBeNull();
    expect(projection1200.getObjectId()).toEqual(1200);
    expect(projection1200.key).toMatch('c2');
  });

  it('add/remove projections correctly', () => {
    expect(projection1.getObjectId()).toEqual(1100);
    expect(projection2.getObjectId()).toEqual(1200);
    expect(projection3.getObjectId()).toEqual(1300);

    let expectedSyntax = '(c1,c2,c3)';
    expect(projectionGroup.renderSyntax()).toMatch(expectedSyntax);

    projectionGroup.removeProjection(1200);

    expectedSyntax = '(c1,c3)';
    expect(projectionGroup.renderSyntax()).toMatch(expectedSyntax);
  });

  it('renders simple queryString correctly', () => {
    let expectedSyntax = 'property=c1;c2;c3&grouped=false&projectionAsMap=true';
    expect(projectionGroup.renderQueryStringDecoded(false)).toMatch(expectedSyntax);
  });

  it('init from simple json correctly', () => {
    let projectionGroupJsonObject = {
      'property': 'c1;c2;c3',
      'grouped': false,
      'projectionAsMap': true
    };

    let projectionGroup = new ProjectionGroupModel();

    projectionGroup.buildModelFromJson(projectionGroupJsonObject, pathToPropertyMap);

    let expectedSyntax = '(c1,c2,c3)';
    expect(projectionGroup.renderSyntax()).toMatch(expectedSyntax);
  });

});

/*



module("ProjectionGroup QueryStrings", {
    setup: function () {
        this.projectionGroupId = 100;
        this.settings = {};
        this.projectionGroup = new ProjectionGroup(this.projectionGroupId, this.settings);

        this.projectionCount = 4;
        this.queryStringProjectionParam = "property=id;size(version);max(averageRating);name";
        this.expectedSyntax = "(id,Size(version),Max(averageRating),name)";
        this.projectionGroup.initFromQueryString(this.queryStringProjectionParam, {});
    },
    teardown: function () {
        delete this.projectionGroupId;
        delete this.settings;
        delete this.projectionGroup;
        delete this.projectionCount;
        delete this.queryStringProjectionParam;
        delete this.expectedSyntax;
    }
});

test("initFromQueryString", function () {
    equal(this.projectionGroup.getQueryElementCount(), this.projectionCount, "Number of projections did not match expectation.");
    deepEqual(this.projectionGroup.renderSyntax(), this.expectedSyntax, "Syntax did not match expectation.");
    ok(this.projectionGroup.isValid(), "Was not determined to be Valid.");
    var projection2 = this.projectionGroup.findProjection(102);
    deepEqual(projection2.renderSyntax(), "Size(version)", "Syntax did not match expectation.");
    deepEqual(projection2.key, "version", "Projection key did not match expected value.");
    deepEqual(projection2.queryFunction, QueryFunctionEnum.SIZE, "Projection queryFunction did not match expected value.");
});

 */
