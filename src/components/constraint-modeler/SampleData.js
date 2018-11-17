export default class SampleData {

  static get syntax () {
    return SYNTAX;
  }

  static get queryString () {
    return QUERY_STRING;
  }

  static get simpleJson () {
    return SIMPLE_JSON_STRING;
  }

  static get simpleJsonObject () {
    return SIMPLE_JSON_OBJECT;
  }

  static get jsonObject () {
    return JSON;
  }

// * Render Flattened Object List
// 1000001 - title:like:super
// 1000002 - docket:in:a,b,c,d,e
// 1000003 - status:eq:DOCKETED
// 1000004 - patentNumber:notnull
// 1000005 - applicationNumber:null
// 1100001 - owner.id:gt:10
// 1100002 - patentType:eq:test
// 1110001 - upper(country.name):eq:USA
// 1110002 - status:eq:GRANTED

// * Render Structured Object List
// 1000001 - title:like:super
// 1000002 - docket:in:a,b,c,d,e
// 1000003 - status:eq:DOCKETED
// 1000004 - patentNumber:notnull
// 1000005 - applicationNumber:null
// 1100001 - owner.id:gt:10
// 1100002 - patentType:eq:test
// 1110001 - upper(country.name):eq:USA
// 1110002 - status:eq:GRANTED

}

const SIMPLE_JSON_STRING = '{"constraint":{"junction":"and","value":"title:like:super;docket:in:a,b,c,d,e;status:eq:DOCKETED;patentNumber:notnull;applicationNumber:null","sub1":{"junction":"or","value":"owner.id:gt:10;patentType:eq:test","sub1":{"value":"upper(country.name):eq:USA;status:eq:GRANTED"}}}}';

const SYNTAX = '(title Like super And docket In (a, b, c, d, e) ' +
  'And status Equal DOCKETED And patentNumber Is Not Null ' +
  'And applicationNumber Is Null ' +
  'And (owner.id Greater Than 10 Or patentType Equal test Or (Upper(country.name) Equal USA And status Equal GRANTED)))';

const QUERY_STRING = 'constraint[junction]=and&constraint[value]=title:like:super;docket:in:a,b,c,d,e;status:eq:DOCKETED;patentNumber:notnull;applicationNumber:null&constraint[sub1][junction]=or&constraint[sub1][value]=owner.id:gt:10;patentType:eq:test&constraint[sub1][sub1][value]=upper(country.name):eq:USA;status:eq:GRANTED';

const SIMPLE_JSON_OBJECT = {
  'constraint': {
    'junction': 'and',
    'value': 'title:like:super;docket:in:a,b,c,d,e;status:eq:DOCKETED;patentNumber:notnull;applicationNumber:null',
    'sub1': {
      'junction': 'or',
      'value': 'owner.id:gt:10;patentType:eq:test',
      'sub1': {
        'value': 'upper(country.name):eq:USA;status:eq:GRANTED'
      }
    }
  }
};
