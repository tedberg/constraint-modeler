import QueryElementGroupModel from '@/components/constraint-modeler/model/QueryElementGroupModel';

describe('QueryElementGroup.js', () => {
  it('constructs correctly', () => {
    const queryElementGroup = new QueryElementGroupModel(123);
    expect(queryElementGroup.getObjectId()).toEqual(123);
  });

});
