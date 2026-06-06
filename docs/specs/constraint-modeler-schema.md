# ConstraintModeler Data Schema

All data shapes flowing into and out of `<ConstraintModeler>`.

---

## Component Props

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `objectName` | `string` | ✅ | — | Backend class/entity name; passed to every resource call |
| `constraintModelerResource` | `object` | ✅ | `ConstraintModelerResource` | Must implement the four resource methods below |
| `title` | `string` | — | `null` | Header text shown above the modeler |
| `showDebug` | `boolean` | — | `false` | Shows debug render links |
| `exposeProjectionModeler` | `boolean` | — | `false` | Adds the projection section |
| `initialModelJsonObject` | `object` | — | `null` | Pre-loads the modeler state on mount — see formats below |
| `saveFunction` | `function` | — | `null` | Enables the Save button; called as `saveFunction(model, isValid)` |

---

## `initialModelJsonObject` Formats

### Format 2.8 (current — constraintGroup wrapper)

```json
{
  "constraintGroup": {
    "constraint": {
      "value": "status:eq:ENABLED;age:gt:50",
      "sub1": { "junction": "or", "value": "age:lte:35;upper(name):like:*Y" },
      "sub2": { "value": "name:notnull" }
    }
  },
  "projectionGroup": {
    "property": "name;age",
    "grouped": false,
    "projectionAsMap": false
  }
}
```

`projectionGroup` is only meaningful when `expose-projection-modeler` is also set.

### Legacy format (no constraintGroup wrapper)

```json
{
  "constraint": {
    "value": "status:eq:ENABLED",
    "sub1": { "junction": "or", "value": "age:lte:35" }
  }
}
```

### Constraint value syntax

Each `value` is a semicolon-separated list of individual constraints:

```
property:operator:value
function(property):operator:value
```

Examples: `age:gt:50`, `upper(name):like:*Y`, `name:notnull`

Sub-groups are keyed `sub1`, `sub2`, … and are fully recursive. Each sub-group can carry its own `junction` (`"and"` | `"or"`, default `"and"`) and `value`.

---

## `ConstraintModelerResource` Interface

All four methods are required. Each returns a `Promise`.

### `loadProperties(objectName: string)`

Called once on mount to populate the property pickers.

**Response:**

```json
{
  "propertyList": [ /* Property[] — scalar properties */ ],
  "multiPropertyList": [ /* Property[] — object/join properties with nested items */ ]
}
```

At least one array must be non-empty.

**Property object:**

```json
{
  "path": "name",
  "displayName": "Name",
  "simpleDataType": "string",
  "dataType": "java.lang.String",
  "expectedDataMagnitude": null,
  "keyDisplayPropertyPath": null,
  "relationship": false,
  "multiProperty": false,
  "nestedPropertyList": null,
  "nestedMultiPropertyList": null
}
```

| Field | Required | Values / Notes |
|-------|----------|----------------|
| `path` | ✅ | Dot-notation path used in query strings (`alert.contact.email`) |
| `displayName` | ✅ | Label shown in UI dropdowns |
| `simpleDataType` | ✅ | `"string"` · `"number"` · `"enum"` · `"object"` — drives which comparison operators appear |
| `dataType` | ✅ | Server-side type (e.g. `"java.lang.String"`, `"com.xyz.Alert"`) |
| `relationship` | — | `true` for object-type properties that reference another entity |
| `multiProperty` | — | `true` for top-level join/multi-property entries |
| `nestedPropertyList` | — | Recursive `Property[]` — scalar children of an object property |
| `nestedMultiPropertyList` | — | Recursive `Property[]` — object children of an object property |
| `expectedDataMagnitude` | — | Hint for UI (e.g. pagination threshold) |
| `keyDisplayPropertyPath` | — | Display path override for related entity picker |

Nesting can be arbitrarily deep; `PropertyMenuItem` renders it as a recursive flyout submenu.

---

### `loadValueList(serverDataType: string)`

Called when the user selects an `enum` property, to populate the value dropdown.

`serverDataType` is the property's `dataType` field (e.g. `"com.xyz.model.Status"`).

**Response:**

```json
{
  "data": [
    { "identifyingValue": "DISABLED", "displayValue": "Disabled" },
    { "identifyingValue": "ENABLED",  "displayValue": "Enabled"  }
  ]
}
```

---

### `validateConstraintModeler(className: string, constraintList: string)`

Called when the user clicks Apply or Save. `constraintList` is a JSON-serialised array:

```json
[
  { "objectId": 13000, "constraint": "id:gt:4" },
  { "objectId": 14000, "constraint": "name:notnull" }
]
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "objectId": "13000", "constraint": "id:gt:4",    "valid": true,  "invalidReason": null },
    { "objectId": "14000", "constraint": "name:notnull","valid": false, "invalidReason": "No data" }
  ]
}
```

`success: false` or any `valid: false` entry causes the UI to show validation errors inline.

---

### `loadResultWithConstraints(className: string, urlEncodedConstraintQueryString: string)`

Called after successful validation to fetch filtered data.

**Response:**

```json
{
  "success": true,
  "page": 1,
  "totalRows": 8,
  "queryTotalRows": 2,
  "data": [
    { "id": 1, "name": "Bill", "age": 25, "status": "ENABLED" }
  ]
}
```

The full response object is emitted verbatim via `applyConstraintsToData`.

---

## Events

### `applyConstraintsToData`

Emitted after Apply succeeds (validate → load both pass). Payload is the raw `loadResultWithConstraints` response.

```typescript
onApplyConstraintsToData(result: {
  success: boolean;
  page: number;
  totalRows: number;
  queryTotalRows: number;
  data: Record<string, unknown>[];
}) { ... }
```

---

## `saveFunction` Signature

```typescript
saveFunction(model: Model, isValid: boolean): Promise<void>
```

`Model` exposes:

| Method | Returns | Notes |
|--------|---------|-------|
| `renderSyntax()` | `string` | Human-readable constraint syntax |
| `renderQueryString()` | `string` | Decoded query string (`property:op:value&…`) |
| `renderSimpleJSON()` | `string` | JSON string in 2.8 `constraintGroup` format |
| `getRootConstraintGroup()` | `ConstraintGroupModel` | Root of the constraint tree |
| `getProjectionGroup()` | `ProjectionGroupModel \| null` | Projection state |

`ModelPersistence` is a helper class that converts a `Model` into the structured object expected by a typical save endpoint:

```typescript
const mp = new ModelPersistence(yourSaveFn);
// Pass mp.save as the saveFunction prop:
// :saveFunction="mp.save.bind(mp)"
```

The helper calls `yourSaveFn(filterObject, formData)` where:

```typescript
filterObject = {
  rootObject: string,           // objectName
  constraintValue: string,      // JSON of { constraintGroup: … }
  logicalSyntax: string,        // renderSyntax() output
  valid: boolean,
  projectionValue?: string,     // JSON of { projectionGroup: … }  (if projection enabled)
}

formData = {
  id: string | null,            // persistentId, null on first save
}
```
