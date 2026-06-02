# Phase 1: TypeScript + Composition API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all `.js` files to TypeScript and all Options API components to `<script setup lang="ts">` with zero visual changes, keeping all 74 unit + 13 Playwright tests green throughout.

**Architecture:** Lint/format tooling is installed first so violations surface immediately. JS to TS renames come before Vue component conversions. The provide/inject refactor centralises around typed `emitterKey` / `resourceKey` injection keys instead of the current `modelListener: this` pattern. `ValueInput.vue` JSX render function becomes a `<template>`.

**Tech Stack:** TypeScript 5, Vue 3.5, `<script setup lang="ts">`, mitt typed events, Vitest 4, Playwright

---

## File Map

**Created:**
- `tsconfig.json`
- `eslint.config.js`
- `src/components/constraint-modeler/events.ts`
- `src/components/constraint-modeler/keys.ts`
- `tests/unit/ApiResource.spec.ts`

**Renamed (`.js` to `.ts`):**
- `src/common/ApiResource.js`
- `src/common/LoggingFacade.js`
- `src/components/constraint-modeler/Property.js`
- `src/components/constraint-modeler/AbstractConstraintModelerResource.js`
- `src/components/constraint-modeler/ConstraintModelerResource.js`
- `src/components/constraint-modeler/StubConstraintModelerResource.js`
- `src/components/constraint-modeler/enum/*.js` (7 files)
- `src/components/constraint-modeler/model/*.js` (8 files)
- `src/components/entry.js`
- `src/demo/router.js`
- `vite.config.js`
- `src/main.js`

**Modified (script block converted):**
All `.vue` files under `src/components/constraint-modeler/ui/` and `src/demo/`.

**Deleted:**
- `src/components/constraint-modeler/ui/shared/QueryElementGroup.vue`

---

## Task 1: ESLint + TypeScript tooling baseline

**Files:**
- Create: `tsconfig.json`
- Create: `eslint.config.js`
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: Install ESLint dependencies**

```bash
npm install --save-dev eslint eslint-plugin-vue @typescript-eslint/parser eslint-plugin-oxlint @vitest/eslint-plugin
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,
    "noImplicitAny": false,
    "jsx": "preserve",
    "lib": ["ESNext", "DOM"],
    "paths": { "@/*": ["./src/*"] },
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `eslint.config.js`**

```javascript
import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import pluginOxlint from 'eslint-plugin-oxlint';
import pluginVitest from '@vitest/eslint-plugin';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'vue/prefer-use-template-ref': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  { ...pluginOxlint.configs['flat/recommended'] },
  {
    files: ['tests/**/*.{ts,js}'],
    plugins: { vitest: pluginVitest },
    rules: { ...pluginVitest.configs.recommended.rules },
  },
  {
    files: ['src/components/ui/**/*.vue'],
    rules: { 'vue/require-default-prop': 'off' },
  },
];
```

- [ ] **Step 4: Update `package.json` lint script**

Change `"lint": "oxlint src"` to `"lint": "oxlint src && eslint src"`.

- [ ] **Step 5: Run baseline lint and fix pre-existing violations**

```bash
npm run lint
```

Expected: lists any pre-existing violations. Fix each before proceeding. Common hits on `.js` files: unused variables, `no-console` warnings.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json eslint.config.js package.json package-lock.json
git commit -m "chore: add ESLint + TypeScript tooling baseline"
```

---

## Task 2: ApiResource.ts -- TDD then fetch migration

**Files:**
- Create: `tests/unit/ApiResource.spec.ts`
- Rename + rewrite: `src/common/ApiResource.js` to `src/common/ApiResource.ts`

The current `paramsSerializer` silently drops all query params (the commented-out `Qs.stringify` confirms it was never meant to stay). The new fetch implementation corrects this intentionally.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/ApiResource.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ApiResource from '@/common/ApiResource';

describe('ApiResource', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no params -- /api prefix added, no ? appended', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJson('/users');
    expect(fetchMock).toHaveBeenCalledWith('/api/users', { headers: { Accept: 'application/json' } });
  });

  it('non-null params -- serialized as query string', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJsonWithParams('/users', { name: 'Bill', age: '25' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users?name=Bill&age=25',
      { headers: { Accept: 'application/json' } }
    );
  });

  it('URL already starting with /api -- prefix not doubled', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJson('/api/users');
    expect(fetchMock).toHaveBeenCalledWith('/api/users', { headers: { Accept: 'application/json' } });
  });

  it('non-ok response -- throws with HTTP status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    const resource = new ApiResource();
    await expect(resource.getJson('/missing')).rejects.toThrow('HTTP 404');
  });

  it('URL already has query string -- & separator used, not ?', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const resource = new ApiResource();
    await resource.getJsonWithParams('/users?active=true', { page: '2' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users?active=true&page=2',
      { headers: { Accept: 'application/json' } }
    );
  });
});
```

- [ ] **Step 2: Run tests -- expect FAIL**

```bash
npx vitest run tests/unit/ApiResource.spec.ts
```

Expected: 5 failures -- `fetch` is never called because current code uses axios.

- [ ] **Step 3: Rename and rewrite**

```bash
git mv src/common/ApiResource.js src/common/ApiResource.ts
```

Replace the entire content of `src/common/ApiResource.ts`:

```typescript
const API_PREFIX = '/api';

export default class ApiResource {

  getJson(url: string): Promise<unknown> {
    return this.getJsonWithParams(url, null);
  }

  async getJsonWithParams(url: string, params?: Record<string, string> | null): Promise<unknown> {
    let apiUrl = url.startsWith(API_PREFIX) ? url : API_PREFIX + url;
    if (params) {
      const sep = apiUrl.includes('?') ? '&' : '?';
      apiUrl += sep + new URLSearchParams(params).toString();
    }
    const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

}
```

- [ ] **Step 4: Run tests -- expect PASS**

```bash
npx vitest run tests/unit/ApiResource.spec.ts
```

Expected: 5 passing.

- [ ] **Step 5: Run full unit suite**

```bash
npm run test:unit
```

Expected: 79 passing (74 original + 5 new).

- [ ] **Step 6: Commit**

```bash
git add tests/unit/ApiResource.spec.ts src/common/ApiResource.ts
git commit -m "feat: replace axios with native fetch in ApiResource, add contract tests"
```

---

## Task 3: Rename enum files `.js` to `.ts`

TypeScript with `strict: false` + `noImplicitAny: false` accepts the old `var Enum = function()` constructor-function patterns without changes. Rename only.

- [ ] **Step 1: Rename all enum files**

```bash
git mv src/components/constraint-modeler/enum/Enum.js src/components/constraint-modeler/enum/Enum.ts
git mv src/components/constraint-modeler/enum/ComparisonTypeEnum.js src/components/constraint-modeler/enum/ComparisonTypeEnum.ts
git mv src/components/constraint-modeler/enum/DataTypeEnum.js src/components/constraint-modeler/enum/DataTypeEnum.ts
git mv src/components/constraint-modeler/enum/JunctionEnum.js src/components/constraint-modeler/enum/JunctionEnum.ts
git mv src/components/constraint-modeler/enum/MessageTypeEnum.js src/components/constraint-modeler/enum/MessageTypeEnum.ts
git mv src/components/constraint-modeler/enum/PropertyTypeEnum.js src/components/constraint-modeler/enum/PropertyTypeEnum.ts
git mv src/components/constraint-modeler/enum/QueryFunctionEnum.js src/components/constraint-modeler/enum/QueryFunctionEnum.ts
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing. If a Vitest transform error appears on a specific file, add `// @ts-nocheck` at the top of that file -- these constructor-function patterns are valid with our loose config but occasionally need the escape hatch.

- [ ] **Step 3: Commit**

```bash
git add src/components/constraint-modeler/enum/
git commit -m "refactor: rename enum files to .ts"
```

---

## Task 4: Rename model files `.js` to `.ts`

- [ ] **Step 1: Rename all model files**

```bash
git mv src/components/constraint-modeler/model/QueryElementModel.js src/components/constraint-modeler/model/QueryElementModel.ts
git mv src/components/constraint-modeler/model/QueryElementGroupModel.js src/components/constraint-modeler/model/QueryElementGroupModel.ts
git mv src/components/constraint-modeler/model/ConstraintModel.js src/components/constraint-modeler/model/ConstraintModel.ts
git mv src/components/constraint-modeler/model/ConstraintGroupModel.js src/components/constraint-modeler/model/ConstraintGroupModel.ts
git mv src/components/constraint-modeler/model/ProjectionModel.js src/components/constraint-modeler/model/ProjectionModel.ts
git mv src/components/constraint-modeler/model/ProjectionGroupModel.js src/components/constraint-modeler/model/ProjectionGroupModel.ts
git mv src/components/constraint-modeler/model/Model.js src/components/constraint-modeler/model/Model.ts
git mv src/components/constraint-modeler/model/ModelPersistence.js src/components/constraint-modeler/model/ModelPersistence.ts
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 3: Commit**

```bash
git add src/components/constraint-modeler/model/
git commit -m "refactor: rename model files to .ts"
```

---

## Task 5: Rename utility + resource files; Playwright checkpoint 1

**Files:** 5 files

- [ ] **Step 1: Rename files**

```bash
git mv src/common/LoggingFacade.js src/common/LoggingFacade.ts
git mv src/components/constraint-modeler/Property.js src/components/constraint-modeler/Property.ts
git mv src/components/constraint-modeler/AbstractConstraintModelerResource.js src/components/constraint-modeler/AbstractConstraintModelerResource.ts
git mv src/components/constraint-modeler/ConstraintModelerResource.js src/components/constraint-modeler/ConstraintModelerResource.ts
git mv src/components/constraint-modeler/StubConstraintModelerResource.js src/components/constraint-modeler/StubConstraintModelerResource.ts
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 3: Run Playwright (checkpoint 1 -- all model/enum/JS conversions done)**

Ensure dev server is running in another terminal (`npm run dev`), then:

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 4: Commit**

```bash
git add src/common/LoggingFacade.ts src/components/constraint-modeler/Property.ts src/components/constraint-modeler/Abstract*.ts src/components/constraint-modeler/Constraint*.ts src/components/constraint-modeler/Stub*.ts
git commit -m "refactor: rename utility and resource files to .ts"
```

---

## Task 6: Create `events.ts` + `keys.ts`

These two files replace the `modelListener: this` provide/inject pattern with typed keys.

- [ ] **Step 1: Create `src/components/constraint-modeler/events.ts`**

```typescript
import type ConstraintGroupModel from './model/ConstraintGroupModel';
import type ConstraintModel from './model/ConstraintModel';
import type ProjectionModel from './model/ProjectionModel';
import type Property from './Property';

export type Events = {
  apply: void;
  setJunction: [ConstraintGroupModel, unknown];
  addConstraint: ConstraintGroupModel;
  addConstraintGroup: ConstraintGroupModel;
  removeConstraintGroup: ConstraintGroupModel;
  setQueryFunctionEnum: [ConstraintModel, string];
  setProperty: [ConstraintModel, Property];
  setComparator: [ConstraintModel, unknown];
  updateValueArray: [ConstraintModel, unknown[]];
  removeConstraint: [ConstraintGroupModel, ConstraintModel];
  setProjectionQueryFunctionEnum: [ProjectionModel, string];
  setProjectionProperty: [ProjectionModel, Property];
};
```

- [ ] **Step 2: Create `src/components/constraint-modeler/keys.ts`**

```typescript
import type { InjectionKey } from 'vue';
import type { Emitter } from 'mitt';
import type { Events } from './events';
import type AbstractConstraintModelerResource from './AbstractConstraintModelerResource';

export const emitterKey: InjectionKey<Emitter<Events>> = Symbol('emitter');
export const resourceKey: InjectionKey<AbstractConstraintModelerResource> = Symbol('constraintModelerResource');
```

- [ ] **Step 3: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/events.ts src/components/constraint-modeler/keys.ts
git commit -m "feat: add typed mitt Events map and injection keys"
```

---

## Task 7: Convert `ConstraintModeler.vue`

**Files:**
- Modify: `src/components/constraint-modeler/ui/ConstraintModeler.vue`

Replace the entire `<script>` block with `<script setup lang="ts">`. The `<template>` is unchanged.

- [ ] **Step 1: Replace `<script>` block**

```typescript
import { ref, computed, provide, onMounted, reactive } from 'vue';
import mitt from 'mitt';
import ConstraintGroup from './constraint/ConstraintGroup.vue';
import ProjectionGroup from './projection/ProjectionGroup.vue';
import Model from '../model/Model';
import ConstraintModelerResource from '../ConstraintModelerResource';
import AbstractConstraintModelerResource from '../AbstractConstraintModelerResource';
import { emitterKey, resourceKey } from '../keys';
import type { Events } from '../events';

const props = defineProps({
  title: { type: String, default: null },
  objectName: { type: String, required: true },
  showDebug: { type: Boolean, default: false },
  exposeProjectionModeler: { type: Boolean, default: false },
  initialModelJsonObject: { type: Object, default: () => null },
  constraintModelerResource: {
    type: Object,
    default: () => new ConstraintModelerResource(),
    validator: (m: unknown) => AbstractConstraintModelerResource.isValidImplementation(m)
  },
  saveFunction: { type: Function, default: null }
});

const emit = defineEmits(['applyConstraintsToData']);

const emitter = mitt<Events>();
const model = reactive(new Model(props.objectName, props.constraintModelerResource));

provide(emitterKey, emitter);
provide(resourceKey, props.constraintModelerResource);
// backward-compat string provides for unconverted children — removed in Task 11
provide('modelListener', { emitter });
provide('constraintModelerResource', props.constraintModelerResource);

const componentReady = ref(false);
const syntaxDisplay = ref('');
const successDisplay = ref('');
const errorDisplay = ref('');
const templatePrefix = ref('test');

// replaces created()
model.loadProperties().then(() => {
  model.buildModelFromJson(props.initialModelJsonObject);
  if (props.exposeProjectionModeler) {
    model.addProjectionGroup();
  }
  console.log('Finished Model...', model);
  componentReady.value = true;
});

onMounted(() => {
  emitter.on('apply', () => { validateAndApply(); });
  emitter.on('setJunction', ([constraintGroupModel, junctionEnum]) => {
    constraintGroupModel.setJunction(junctionEnum);
  });
  emitter.on('addConstraint', (constraintGroupModel) => {
    constraintGroupModel.addConstraint();
  });
  emitter.on('addConstraintGroup', (constraintGroupModel) => {
    constraintGroupModel.addConstraintGroup();
  });
  emitter.on('removeConstraintGroup', (constraintGroupModel) => {
    rootConstraintGroup.value.removeConstraintGroupRecursively(constraintGroupModel.getObjectId());
  });
  emitter.on('setQueryFunctionEnum', ([constraintModel, enumKey]) => {
    constraintModel.setQueryFunction(enumKey);
  });
  emitter.on('setProperty', ([constraintModel, property]) => {
    constraintModel.setProperty(property);
  });
  emitter.on('setComparator', ([constraintModel, comparisonType]) => {
    constraintModel.setComparisonType(comparisonType);
  });
  emitter.on('updateValueArray', ([constraintModel, valueArray]) => {
    constraintModel.setValueArray(valueArray);
  });
  emitter.on('removeConstraint', ([constraintGroupModel, constraintModel]) => {
    constraintGroupModel.removeConstraint(constraintModel.getObjectId());
  });
  emitter.on('setProjectionQueryFunctionEnum', ([projectionModel, enumKey]) => {
    projectionModel.setQueryFunction(enumKey);
  });
  emitter.on('setProjectionProperty', ([projectionModel, property]) => {
    projectionModel.setProperty(property);
  });
});

const rootConstraintGroup = computed(() => model.getRootConstraintGroup());
const propertyList = computed(() => model.getPropertyList());
const multiPropertyList = computed(() => model.getMultiPropertyList());
const pathToPropertyMap = computed(() => model.getPathToPropertyMap());
const isSaveSupported = computed(() => typeof props.saveFunction === 'function');

function validateAndApply() {
  console.log('validateAndApply');
  return model.validate().then((result: any) => {
    if (result?.success) {
      return model.apply().then((applyResult: any) => {
        emit('applyConstraintsToData', applyResult);
      });
    }
  });
}

function addProjection() {
  model.getProjectionGroup().addProjection();
}

function removeProjection(projection: any) {
  model.getProjectionGroup().removeProjection(projection.getObjectId());
}

function save() {
  if (isSaveSupported.value) {
    return model.validate().then((result: any) => {
      if (result?.success) {
        return props.saveFunction(model, true).then(() => {
          successDisplay.value = 'This constraint model was saved.';
        });
      } else {
        errorDisplay.value = 'This filter has failed validation.';
      }
    });
  } else {
    errorDisplay.value = 'Save functionality is not supported.';
  }
}

function renderSyntax() { syntaxDisplay.value = model.renderSyntax(); return syntaxDisplay.value; }
function renderQueryString() { syntaxDisplay.value = model.renderQueryString(); return syntaxDisplay.value; }
function renderSimpleJSON() { syntaxDisplay.value = model.renderSimpleJSON(); return syntaxDisplay.value; }
function renderFlattenedObjectList() { syntaxDisplay.value = model.renderFlattenedObjectList(); return syntaxDisplay.value; }
function renderStructuredObjectList() { syntaxDisplay.value = model.renderStructuredObjectList(); return syntaxDisplay.value; }
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 3: Commit**

```bash
git add src/components/constraint-modeler/ui/ConstraintModeler.vue
git commit -m "refactor: convert ConstraintModeler.vue to script setup, provide emitter via typed key"
```

---

## Task 8: Convert `ConstraintGroup.vue` + Playwright checkpoint 2

Remove `extends: QueryElementGroup` -- that shell is deleted in Task 11.

- [ ] **Step 1: Replace `<script>` block in `ConstraintGroup.vue`**

```typescript
import { computed, inject } from 'vue';
import JunctionMenu from './JunctionMenu.vue';
import Constraint from './Constraint.vue';
import ConstraintGroupModel from '../../model/ConstraintGroupModel';
import { emitterKey } from '../../keys';

const props = defineProps({
  templatePrefix: { type: String, default: '' },
  constraintGroupModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ConstraintGroupModel
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object }
});

const emitter = inject(emitterKey)!;

const junction = computed(() => props.constraintGroupModel.getJunction());
const constraintList = computed(() => props.constraintGroupModel.getConstraintList());
const constraintGroupList = computed(() => props.constraintGroupModel.getConstraintGroupList());
const objectId = computed(() => props.constraintGroupModel.getObjectId());
const isRoot = computed(() => props.constraintGroupModel.isRoot());
const constraintGroupId = computed(() => `${props.templatePrefix}_constraint-group-bar-${objectId.value}`);
const junctionMenuId = computed(() => `${props.templatePrefix}_junction-menu-${objectId.value}`);

function setJunction(junctionEnum: any) {
  emitter.emit('setJunction', [props.constraintGroupModel as ConstraintGroupModel, junctionEnum]);
}
function addConstraint() {
  emitter.emit('addConstraint', props.constraintGroupModel as ConstraintGroupModel);
}
function removeConstraint(constraintModel: any) {
  emitter.emit('removeConstraint', [props.constraintGroupModel as ConstraintGroupModel, constraintModel]);
}
function addConstraintGroup() {
  emitter.emit('addConstraintGroup', props.constraintGroupModel as ConstraintGroupModel);
}
function apply() {
  emitter.emit('apply', undefined);
}
function removeSelf() {
  emitter.emit('removeConstraintGroup', props.constraintGroupModel as ConstraintGroupModel);
}
```

- [ ] **Step 2: Run Playwright (checkpoint 2)**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 3: Commit**

```bash
git add src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue
git commit -m "refactor: convert ConstraintGroup.vue to script setup, inject emitter"
```

---

## Task 9: Convert `Constraint.vue`

- [ ] **Step 1: Replace `<script>` block in `Constraint.vue`**

```typescript
import { computed, inject } from 'vue';
import { toRaw } from 'vue';
import acceptIcon from '@/assets/images/icons/accept.png';
import errorIcon from '@/assets/images/icons/error.png';
import ComparisonMenu from './ComparisonMenu.vue';
import QueryFunctionMenu from '../shared/QueryFunctionMenu.vue';
import ValueInput from './ValueInput.vue';
import PropertyMenu from '../shared/PropertyMenu.vue';
import ConstraintModel from '../../model/ConstraintModel';
import { emitterKey } from '../../keys';

const props = defineProps({
  templatePrefix: { type: String, default: '' },
  constraintModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ConstraintModel
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object }
});

const emit = defineEmits(['removeConstraint']);

const emitter = inject(emitterKey)!;

const valueArray = computed(() => props.constraintModel.getValueArray());
const comparisonType = computed(() => props.constraintModel.getComparisonType());
const property = computed(() => props.constraintModel.getProperty() || null);
const dataType = computed(() => toRaw(props.constraintModel.getDataType()));
const objectId = computed(() => props.constraintModel.getObjectId());
const queryFunctionEnum = computed(() => props.constraintModel.getQueryFunction());
const isValid = computed(() => {
  if (props.constraintModel.verifiedValidity === null) return null;
  return props.constraintModel.verifiedValidity.valid;
});
const invalidReason = computed(() => {
  if (props.constraintModel.verifiedValidity === null) return null;
  return props.constraintModel.verifiedValidity.reason;
});
const constraintId = computed(() => `${props.templatePrefix}_constraint-bar-${objectId.value}`);
const aggregateId = computed(() => `${props.templatePrefix}_aggregate-menu-${objectId.value}`);
const propertyId = computed(() => `${props.templatePrefix}_property-menu-${objectId.value}`);
const comparisonId = computed(() => `${props.templatePrefix}_comparison-menu-${objectId.value}`);
const valueEntriesId = computed(() => `${props.templatePrefix}_valueEntries-menu-${objectId.value}`);

function setComparator(ct: any) {
  emitter.emit('setComparator', [props.constraintModel as ConstraintModel, ct]);
}
function setQueryFunctionEnum(enumKey: string) {
  emitter.emit('setQueryFunctionEnum', [props.constraintModel as ConstraintModel, enumKey]);
}
function setProperty(property: any) {
  emitter.emit('setProperty', [props.constraintModel as ConstraintModel, property]);
}
function updateValueArray(va: unknown[]) {
  emitter.emit('updateValueArray', [props.constraintModel as ConstraintModel, va]);
}
function removeConstraint() {
  console.log('removeConstraint');
  emit('removeConstraint', props.constraintModel);
}
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 3: Commit**

```bash
git add src/components/constraint-modeler/ui/constraint/Constraint.vue
git commit -m "refactor: convert Constraint.vue to script setup"
```

---

## Task 10: Convert `ValueInput.vue` -- JSX render to template + Playwright checkpoint 3

This is the most complex conversion. The JSX `render()` function is replaced by a `<template>` with `v-for` + `v-if` branches. `resourceKey` is injected instead of the string `'constraintModelerResource'`.

- [ ] **Step 1: Replace entire `ValueInput.vue` content**

```vue
<template>
  <div>
    <template v-for="(_, i) in numberOfObjects" :key="i">
      <span v-if="i === 1 && numberOfObjects === 2" style="color: white;">AND</span>
      <select v-if="useSelectField"
              :id="getIdAttribute(i)"
              :name="getNameAttribute(i)"
              :class="inputClass"
              v-model="valueArray[i]"
              @change="updateValueArray">
        <option value=""></option>
        <option v-for="opt in selectableValueList"
                :key="findChoiceId(opt)"
                :value="findChoiceId(opt)">{{ findChoiceLabel(opt) }}</option>
      </select>
      <input v-else-if="isNumber" type="number"
             :id="getIdAttribute(i)" :name="getNameAttribute(i)" :class="inputClass"
             v-model="valueArray[i]" @input="updateValueArray" />
      <input v-else-if="isDate" type="date"
             :id="getIdAttribute(i)" :name="getNameAttribute(i)" :class="inputClass"
             v-model="valueArray[i]" @input="updateValueArray" />
      <input v-else-if="isUrl" type="url"
             :id="getIdAttribute(i)" :name="getNameAttribute(i)" :class="inputClass"
             v-model="valueArray[i]" @input="updateValueArray" />
      <input v-else type="text"
             :id="getIdAttribute(i)" :name="getNameAttribute(i)" :class="inputClass"
             v-model="valueArray[i]" @input="updateValueArray" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue';
import { ComparisonTypeEnum } from '../../enum/ComparisonTypeEnum';
import { DataTypeEnum } from '../../enum/DataTypeEnum';
import Property from '../../Property';
import { resourceKey } from '../../keys';

const AUTOCOMPLETE_DATAMAGNITUDE_THRESHOLD = 25;

const props = defineProps({
  objectId: { type: Number, required: true },
  templatePrefix: { type: String, default: '' },
  comparisonType: {
    type: Object,
    required: true,
    validator: (m: unknown) => ComparisonTypeEnum.checkInstanceOf(m)
  },
  property: {
    type: Object,
    required: false,
    validator: (m: unknown) => m instanceof Property
  },
  queryFunction: { type: Function },
  valueCustomObject: { type: Object },
  valueArray: { type: Array, required: true, default: () => [] }
});

const emit = defineEmits(['updateValueArray']);

const constraintModelerResource = inject(resourceKey)!;
const selectableValueList = ref<any[]>([]);

const numberOfObjects = computed(() =>
  props.comparisonType ? (props.comparisonType as any).expectedNumberOfObjectValues : 0
);
const dataType = computed(() => props.property ? (props.property as any).getSimpleDataTypeEnum() : null);
const serverDataType = computed(() => props.property ? (props.property as any).getServerDataType() : null);

const useSelectField = computed(() => {
  let dt = dataType.value;
  if (props.queryFunction) dt = (props.queryFunction as any).getOutputDataType();
  if (dt === DataTypeEnum.ENUM || dt === DataTypeEnum.BOOLEAN) return true;
  if (dt === DataTypeEnum.OBJECT) {
    return !(props.property &&
      (props.property as any).expectedDataMagnitude > AUTOCOMPLETE_DATAMAGNITUDE_THRESHOLD &&
      (props.property as any).keyDisplayPropertyPath);
  }
  return false;
});

const isNumber = computed(() => dataType.value?.alias === DataTypeEnum.NUMBER.alias);
const isDate = computed(() => dataType.value?.alias === DataTypeEnum.DATE.alias);
const isUrl = computed(() => dataType.value?.alias === DataTypeEnum.URL.alias);

const inputClass = computed(() => {
  let cls = dataType.value ? dataType.value.alias : '';
  if (numberOfObjects.value > 2) cls += ' in_clause_value';
  return cls;
});

function updateValueArray() {
  emit('updateValueArray', props.valueArray);
}

function loadValueList() {
  if (serverDataType.value === 'boolean') {
    selectableValueList.value = [
      { identifyingValue: 'true', displayValue: 'True' },
      { identifyingValue: 'false', displayValue: 'False' }
    ];
    return Promise.resolve();
  }
  return (constraintModelerResource as any)
    .loadValueList(serverDataType.value)
    .then((response: any) => { selectableValueList.value = response.data; });
}

function findChoiceId(choice: any): string | null {
  if (choice.identifyingValue !== undefined) return choice.identifyingValue;
  if (choice.id !== undefined) return choice.id !== null ? choice.id.toString() : null;
  return choice;
}

function findChoiceLabel(choice: any): string {
  if (choice.displayValue !== undefined) return choice.displayValue;
  if (choice.name !== undefined) return choice.name;
  return choice;
}

function getIdAttribute(fieldIndex: number) {
  return `${props.templatePrefix}_valueEntry-${fieldIndex}-${props.objectId}`;
}

function getNameAttribute(fieldIndex: number) {
  return `valueEntry-${fieldIndex}-${props.objectId}`;
}

// replaces created()
if (useSelectField.value) {
  loadValueList();
}

watch(serverDataType, () => {
  if (useSelectField.value) loadValueList();
});
</script>

<style scoped>
input {
  width: 250px;
}
input.number {
  width: 125px;
}
input.date {
  width: 100px;
}
div.in_clause {
  width: 515px;
  margin-bottom: 5px;
}
input.in_clause_value {
  width: 96px;
}
input.in_clause_value.date {
  width: 80px;
}
</style>
```

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 3: Run Playwright (checkpoint 3)**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/ui/constraint/ValueInput.vue
git commit -m "refactor: convert ValueInput.vue from JSX render function to template"
```

---

## Task 11: Convert `Projection.vue` + `ProjectionGroup.vue`, delete `QueryElementGroup.vue` + Playwright checkpoint 4

- [ ] **Step 1: Replace `<script>` block in `Projection.vue`**

```typescript
import { computed, inject } from 'vue';
import QueryFunctionMenu from '../shared/QueryFunctionMenu.vue';
import PropertyMenu from '../shared/PropertyMenu.vue';
import ProjectionModel from '../../model/ProjectionModel';
import { emitterKey } from '../../keys';

const props = defineProps({
  templatePrefix: { type: String, default: '' },
  projectionModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ProjectionModel
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object }
});

const emit = defineEmits(['removeSelf']);

const emitter = inject(emitterKey)!;

const property = computed(() => props.projectionModel.getProperty() || null);
const objectId = computed(() => props.projectionModel.getObjectId());
const queryFunctionEnum = computed(() => props.projectionModel.getQueryFunction());
const projectionId = computed(() => `${props.templatePrefix}_projection-bar-${objectId.value}`);
const aggregateId = computed(() => `${props.templatePrefix}_aggregate-menu-${objectId.value}`);
const propertyId = computed(() => `${props.templatePrefix}_property-menu-${objectId.value}`);

function setQueryFunctionEnum(enumKey: string) {
  emitter.emit('setProjectionQueryFunctionEnum', [props.projectionModel as ProjectionModel, enumKey]);
}
function setProperty(property: any) {
  emitter.emit('setProjectionProperty', [props.projectionModel as ProjectionModel, property]);
}
function removeProjection() {
  emit('removeSelf');
}
```

- [ ] **Step 2: Replace `<script>` block in `ProjectionGroup.vue`**

```typescript
import { computed } from 'vue';
import Projection from './Projection.vue';
import ProjectionGroupModel from '../../model/ProjectionGroupModel';

const props = defineProps({
  templatePrefix: { type: String, default: '' },
  projectionGroupModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ProjectionGroupModel
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object }
});

const emit = defineEmits(['addProjection', 'removeProjection']);

const projectionList = computed(() => props.projectionGroupModel.getProjectionList());
const projectionGroupId = computed(() =>
  `${props.templatePrefix}_projection-group-bar-${props.projectionGroupModel.getObjectId()}`
);

function addProjection() { emit('addProjection'); }
function removeProjection(projection: any, index: number) { emit('removeProjection', projection, index); }
```

- [ ] **Step 3: Remove backward-compat string provides from `ConstraintModeler.vue`**

All projection and constraint children now use typed injection keys — the compat provides are no longer needed. Open `src/components/constraint-modeler/ui/ConstraintModeler.vue` and delete these two lines from the `<script setup>` block:

```typescript
provide('modelListener', { emitter });
provide('constraintModelerResource', props.constraintModelerResource);
```

- [ ] **Step 4: Delete `QueryElementGroup.vue`**

```bash
git rm src/components/constraint-modeler/ui/shared/QueryElementGroup.vue
```

- [ ] **Step 5: Run Playwright (checkpoint 4)**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 6: Commit**

```bash
git add src/components/constraint-modeler/ui/ConstraintModeler.vue src/components/constraint-modeler/ui/projection/
git commit -m "refactor: convert Projection + ProjectionGroup to script setup, remove compat provides, delete QueryElementGroup"
```

---

## Task 12: Convert shared menu components + Playwright checkpoint 5

Convert all 5 shared/menu components. Full code shown for each.

- [ ] **Step 1: Replace `<script>` block in `JunctionMenu.vue`**

```typescript
import { ref } from 'vue';
import { JunctionEnum } from '../../enum/JunctionEnum';

const props = defineProps({
  junction: {
    type: Object,
    required: true,
    validator: (m: unknown) => JunctionEnum.checkInstanceOf(m)
  }
});

const emit = defineEmits(['setJunction']);
const typesArray = ref(JunctionEnum.enumToValueList());

function setJunction(enumKey: string) {
  emit('setJunction', JunctionEnum.getType(enumKey));
}
```

- [ ] **Step 2: Replace `<script>` block in `ComparisonMenu.vue`**

```typescript
import { computed, watch } from 'vue';
import { ComparisonTypeEnum } from '../../enum/ComparisonTypeEnum';
import { DataTypeEnum } from '../../enum/DataTypeEnum';
import { QueryFunctionEnum } from '../../enum/QueryFunctionEnum';
import { PropertyTypeEnum } from '../../enum/PropertyTypeEnum';
import Property from '../../Property';

const props = defineProps({
  templatePrefix: { type: String, required: true },
  dataType: {
    type: Object,
    required: true,
    validator: (m: unknown) => DataTypeEnum.checkInstanceOf(m)
  },
  queryFunction: { type: Object, required: false },
  property: { type: Object, required: false },
  comparisonType: {
    type: Object,
    required: true,
    validator: (m: unknown) => ComparisonTypeEnum.checkInstanceOf(m)
  }
});

const emit = defineEmits(['setComparator']);

const comparisonTypeArray = computed(() => {
  if (!props.dataType) return ComparisonTypeEnum.enumToValueList();
  if (props.queryFunction && (props.queryFunction as any).getOutputDataType) {
    return ComparisonTypeEnum.getAllForDataType((props.queryFunction as any).getOutputDataType(), PropertyTypeEnum.SINGLE);
  }
  if (props.property) {
    return (props.property as any).multiProperty
      ? ComparisonTypeEnum.getAllForDataType(props.dataType, PropertyTypeEnum.MULTI)
      : ComparisonTypeEnum.getAllForDataType(props.dataType, PropertyTypeEnum.SINGLE);
  }
  return ComparisonTypeEnum.getAllForDataType(props.dataType, PropertyTypeEnum.ALL);
});

watch(() => props.dataType, () => { /* trigger recompute */ });

function setComparator(enumKey: string) {
  emit('setComparator', ComparisonTypeEnum.getType(enumKey));
}
```

- [ ] **Step 3: Replace `<script>` block in `QueryFunctionMenu.vue`**

```typescript
import { ref, computed } from 'vue';
import { QueryFunctionEnum } from '../../enum/QueryFunctionEnum';
import { DataTypeEnum } from '../../enum/DataTypeEnum';
import { GeneralEnum } from '../../enum/Enum';
import Property from '../../Property';

const props = defineProps({
  templatePrefix: { type: String, required: true },
  property: { type: Object },
  queryFunction: { type: Object }
});

const emit = defineEmits(['setQueryFunction']);

const queryFunctionArray = ref<any[]>([]);
const aggregateArray = ref<any[]>([]);

// replaces created()
if (props.property) {
  const p = props.property as any;
  if (p.multiProperty) {
    queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.COLLECTION);
    aggregateArray.value = [];
  } else {
    const inputType = DataTypeEnum.getTypeFromAlias(p.simpleDataType);
    queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueListForInputType(inputType);
    aggregateArray.value = QueryFunctionEnum.getAggregateFunctionValueListForInputType(inputType);
  }
} else {
  queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueList();
  aggregateArray.value = QueryFunctionEnum.getAggregateFunctionValueList();
}
aggregateArray.value.unshift((GeneralEnum as any).NONE);

const queryFunctionDisplay = computed(() =>
  props.queryFunction ? (props.queryFunction as any).label : 'None'
);

function setQueryFunction(enumKey: string) {
  emit('setQueryFunction', enumKey);
}
```

- [ ] **Step 4: Replace `<script>` block in `PropertyMenu.vue`**

```typescript
import { computed } from 'vue';
import PropertyMenuPartial from './PropertyMenuPartial.vue';
import Property from '../../Property';

const props = defineProps({
  templatePrefix: { type: String, required: true },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  property: { type: Object }
});

const emit = defineEmits(['setProperty']);

const propertyDisplay = computed(() =>
  (props.property as any)?.displayName ?? 'Chosen Value'
);

function setProperty(property: any) {
  emit('setProperty', property);
}
```

- [ ] **Step 5: Replace `<script>` block in `PropertyMenuPartial.vue`**

```typescript
import { computed } from 'vue';

const props = defineProps({
  templatePrefix: { type: String, required: true },
  property: { type: Object, required: true },
  nestedPropertyList: { type: Array, default: () => [] },
  nestedMultiPropertyList: { type: Array, default: () => [] }
});

const hasNestedList = computed(() =>
  (Array.isArray(props.nestedPropertyList) && props.nestedPropertyList.length > 0) ||
  (Array.isArray(props.nestedMultiPropertyList) && props.nestedMultiPropertyList.length > 0)
);

function propertyDisplay(property: any) {
  return property.displayName + ' ' + (typeof property.simpleDataType === 'object' ? '»' : '');
}
```

- [ ] **Step 6: Run Playwright (checkpoint 5 -- all components converted)**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 7: Commit**

```bash
git add src/components/constraint-modeler/ui/
git commit -m "refactor: convert all shared menu components to script setup"
```

---

## Task 13: Convert demo views + config files

**Files:** `main.js`, `router.js`, `entry.js`, `vite.config.js` renames; all 8 demo `.vue` files converted.

- [ ] **Step 1: Rename config/entry files**

```bash
git mv src/main.js src/main.ts
git mv src/demo/router.js src/demo/router.ts
git mv src/components/entry.js src/components/entry.ts
git mv vite.config.js vite.config.ts
```

- [ ] **Step 2: Update `entry.ts` to use named type import**

Replace the `import` in `entry.ts`:

```typescript
import ConstraintModeler from './constraint-modeler/ui/ConstraintModeler.vue';
import type { App } from 'vue';

const plugin = {
  install(app: App) {
    app.component('ConstraintModeler', ConstraintModeler);
  }
};

export { ConstraintModeler };
export default plugin;
```

- [ ] **Step 3: Convert `Simple.vue` (full example -- repeat pattern for remaining views)**

Replace `<script>` with `<script setup lang="ts">`:

```typescript
import { ref, computed } from 'vue';
import ConstraintModeler from '@/components/constraint-modeler/ui/ConstraintModeler.vue';
import StubConstraintModelerResource from '@/components/constraint-modeler/StubConstraintModelerResource';
import ListGrid from './ListGrid.vue';

const objectName = 'Simple';
const result = ref<any>({});
const constraintModelerResource = new StubConstraintModelerResource();

const fields = [
  { key: 'id', sortable: true },
  { key: 'name', sortable: true },
  { key: 'age', sortable: true },
  { key: 'status', sortable: false, formatter: (value: string) => value === 'ENABLED' ? 'Yep' : 'Nope' }
];

const queryResultData = computed(() => result.value.data);

function applyDataGrid(res: any) {
  result.value = res;
}
```

- [ ] **Step 4: Convert remaining demo files**

Apply the same Options API to `<script setup lang="ts">` pattern to each of these files. For each: remove `export default { ... }`, replace `data()` refs with `ref()`, `computed` with `computed()`, methods with functions. Remove `components:` registration (not needed in `<script setup>`).

Files to convert:
- `src/demo/App.vue`
- `src/demo/views/Debug.vue`
- `src/demo/views/Everything.vue`
- `src/demo/views/Home.vue`
- `src/demo/views/ListGrid.vue`
- `src/demo/views/NotFound.vue`
- `src/demo/views/Persistent.vue`
- `src/demo/views/WithProjection.vue`

- [ ] **Step 5: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 6: Run Playwright**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 7: Commit**

```bash
git add src/main.ts src/demo/ src/components/entry.ts vite.config.ts
git commit -m "refactor: convert demo views and config files to TypeScript + script setup"
```

---

## Task 14: SASS to plain CSS

The `.vue` files use SCSS nesting only -- no variables, no mixins. Convert by removing `lang="scss"` and replacing SCSS-style nesting with CSS nesting (`& selector`).

- [ ] **Step 1: Convert `ConstraintModeler.vue` styles (full example)**

Change `<style scoped lang="scss">` to `<style scoped>`:

```css
<style scoped>
:deep(div.nest) {
  margin-left: 25px;
}

div.constraint-modeler {
  & :deep(.navbar .btn),
  & :deep(.navbar .btn-group .btn) {
    padding: 1px 4px;
  }
  & :deep(.nav-link) {
    padding-top: 0;
    padding-bottom: 0;
  }
  & :deep(div.navbar) {
    border-radius: 7px;
  }
  & :deep(input[type='text']) {
    width: 100px;
  }
  & :deep(.buttons) {
    text-align: center;
  }
}

ul.constraintModelerDebug {
  & a {
    text-decoration: #0000cc;
    text-decoration-line: underline;
    cursor: pointer;
  }
}
</style>
```

- [ ] **Step 2: Convert remaining component styles**

For each file below, just remove `lang="scss"` from the `<style>` tag. These have no nesting -- the attribute removal is the only change:
- `ConstraintGroup.vue`
- `Constraint.vue`
- `Projection.vue`
- `ProjectionGroup.vue`
- `PropertyMenu.vue`
- `PropertyMenuPartial.vue`
- `JunctionMenu.vue`
- `ComparisonMenu.vue`
- `QueryFunctionMenu.vue`

(`ValueInput.vue` was already converted to plain CSS in Task 10.)

- [ ] **Step 3: Remove `sass` devDependency**

```bash
npm uninstall sass
```

- [ ] **Step 4: Run Playwright**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: convert SCSS to plain CSS, remove sass devDependency"
```

---

## Task 15: Remove `axios` + final cleanup

- [ ] **Step 1: Remove axios from dependencies**

```bash
npm uninstall axios
```

- [ ] **Step 2: Remove axios from `peerDependencies` in `package.json`**

Edit `package.json` manually -- `npm uninstall` only removes from `dependencies`. Delete the `"axios": "^1.0.0"` line from `peerDependencies`.

- [ ] **Step 3: Remove axios from `vite.config.ts` rollup externals**

In the lib build config, change:
```typescript
external: ['vue', 'vue-router', 'bootstrap-vue-next', 'axios'],
output: {
  globals: {
    vue: 'Vue',
    'bootstrap-vue-next': 'BootstrapVueNext',
    axios: 'axios',
  },
},
```
to:
```typescript
external: ['vue', 'vue-router', 'bootstrap-vue-next'],
output: {
  globals: {
    vue: 'Vue',
    'bootstrap-vue-next': 'BootstrapVueNext',
  },
},
```

- [x] **Step 4: Final full test pass**

```bash
npm run test:unit
```
Expected: 79 passing.

```bash
npm run test:e2e:pw
```
Expected: 13/13 passing.

```bash
npm run lint
```
Expected: clean.

- [x] **Step 5: Stage files**

```bash
git add package.json package-lock.json vite.config.ts eslint.config.js \
  src/components/constraint-modeler/ui/constraint/ValueInput.vue
```

---

## Post-Plan Fixes (applied during execution)

Issues discovered after the plan tasks completed, resolved before final commit:

**ESLint parser not applied to `.ts` files (parse errors in IDE):**
- Root cause: `eslint.config.js` used `parserOptions.parser: tsParser` which is the vue-eslint-parser inner-parser pattern — only works for `.vue` script blocks, not standalone `.ts` files.
- Fix: split into two blocks — `files: ["src/**/*.ts", "tests/**/*.ts"]` with `languageOptions.parser: tsParser`, and `files: ["src/**/*.vue"]` with `languageOptions.parserOptions.parser: tsParser`.

**449 Vue formatting warnings:**
- Root cause: `eslint-plugin-vue/flat/recommended` enables formatting rules (`vue/html-indent`, `vue/max-attributes-per-line`, etc.) that conflict with `oxfmt`.
- Fix: turned off all formatting-only Vue rules in `eslint.config.js`; `oxfmt` owns formatting.

**`no-this-alias` warnings in enum files:**
- Root cause: pre-ES2015 `const self = this` pattern in `Enum.ts`, `DataTypeEnum.ts`, `ComparisonTypeEnum.ts`, `QueryFunctionEnum.ts`.
- Fix: converted `this.method = function()` to arrow functions so `this` is captured lexically.

**`no-unused-vars` warnings for abstract method stubs:**
- Affected: `AbstractConstraintModelerResource.ts`, `StubConstraintModelerResource.ts`, `QueryElementModel.ts`, `QueryElementGroupModel.ts`, `ProjectionModel.ts`.
- Fix: prefixed unused params with `_`.

**`vue/no-mutating-props` errors in `ValueInput.vue`:**
- Root cause: `v-model="valueArray[i]"` directly mutated the `valueArray` prop.
- Fix: introduced `localValues` ref synced from prop via `watch`; `v-model` binds to `localValues[i]`.

**`tsconfig.json` improvements:**
- Changed `target` from `ESNext` to `ES2022` (stable, matches Node 24 + modern browsers).
- Changed `lib` from `["ESNext", "DOM"]` to `["ES2022", "DOM"]` (conservative for a library — avoids accidentally using APIs consumers may not have).
- Removed `"jsx": "preserve"` (no JSX files remain after Task 10).
- Added `"tests/**/*"` to `include` so `@/` alias resolves in test files.
- Added `"type": "module"` to `package.json` (suppresses Node ESM warning from `eslint.config.js`).

**`router.ts` type error:**
- `to.meta.title` is typed `unknown` in Vue Router 4's `RouteMeta`. Fix: `(to.meta.title as string) || 'Constraint Modeler'`.

**`ApiResource.spec.ts` type:**
- `ReturnType<typeof vi.fn>` caused IDE parse error. Fix: `import { type MockInstance } from 'vitest'` and type as `MockInstance`.

---

## Self-Review

- Lint/format tooling installed first (Task 1) -- matches spec requirement
- ApiResource tests written before migration (Task 2) -- TDD satisfied
- All Playwright checkpoints: Tasks 5, 8, 10, 11, 12 -- matches spec batches
- `provide/inject` refactored via `emitterKey`/`resourceKey` (Tasks 6-8) -- no more `modelListener: this`
- `extends: QueryElementGroup` dropped in Tasks 8, 11 -- `QueryElementGroup.vue` deleted Task 11
- JSX render replaced with template (Task 10)
- SASS removed (Task 14), axios removed (Task 15)
- `vite.config.js`, `entry.js`, `router.js`, `main.js` all renamed to `.ts` (Task 13)
- `@vitejs/plugin-vue-jsx` remains until Phase 2 (JSX is gone after Task 10 but Phase 2 plan removes the plugin)