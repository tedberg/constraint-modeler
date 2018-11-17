import QueryElementGroup from '@/components/constraint-modeler/model/QueryElementGroup';

describe('QueryElementGroup.js', () => {
  it('constructs correctly', () => {
    const queryElementGroup = new QueryElementGroup(123);
    expect(queryElementGroup.getObjectId()).toEqual(123);
  });

});
