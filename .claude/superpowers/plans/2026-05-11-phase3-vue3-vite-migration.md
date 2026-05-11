# Phase 3: Vue 3.5 + Vite 8 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the project from Vue 2 / Vue CLI 4 / Bootstrap-Vue 2 to Vue 3.5 / Vite 8 / bootstrap-vue-next, keeping Options API throughout, with the Phase 1 Playwright suite as the exit gate.

**Architecture:** Replace `vue.config.js` + Vue CLI with `vite.config.ts`. Keep Options API in all components — no Composition API changes in this phase. Replace the Vue 2 `$on`/`$emit` event bus pattern in `ConstraintModeler.vue` with `mitt`. Bootstrap-Vue 2 components swap to bootstrap-vue-next equivalents; component tag names stay the same in templates (both use `b-` prefix). Library build output (UMD + ESM) preserved via Vite `lib` mode.

**Tech Stack:** Vue 3.5, Vite 8, `@vitejs/plugin-vue`, `@vitejs/plugin-vue-jsx` (ValueInput uses JSX render), `vue-router@4`, `bootstrap@^5.3.0`, `bootstrap-vue-next@^0.45.0`, `mitt`, `vitest`, `@vue/test-utils@2`

**Prerequisite:** Phase 2 expanded Playwright suite must be green before starting.

---

## File Map

| Action | File |
|--------|------|
| Create | `vite.config.ts` |
| Create | `index.html` (moved from `public/index.html`, updated for Vite) |
| Delete | `vue.config.js` |
| Delete | `babel.config.js` |
| Modify | `package.json` |
| Modify | `src/main.js` |
| Modify | `src/demo/router.js` |
| Modify | `src/components/entry.js` |
| Modify | `src/components/constraint-modeler/ui/ConstraintModeler.vue` |
| Modify | `src/components/constraint-modeler/ui/constraint/JunctionMenu.vue` |
| Modify | `src/components/constraint-modeler/ui/constraint/ComparisonMenu.vue` |
| Modify | `src/components/constraint-modeler/ui/shared/PropertyMenu.vue` |
| Modify | `src/components/constraint-modeler/ui/constraint/Constraint.vue` |
| Modify | `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue` |
| Modify | `src/components/constraint-modeler/ui/projection/Projection.vue` |
| Modify | `src/components/constraint-modeler/ui/projection/ProjectionGroup.vue` |
| Modify | `src/demo/App.vue` |
| Modify | `src/demo/views/ListGrid.vue` |
| Modify | `src/demo/views/Simple.vue`, `Debug.vue`, `WithProjection.vue`, `Persistent.vue`, `Everything.vue` |
| Delete | `jest.config.js`, `babel.config.js` |
| Create | `vitest.config.ts` |
| Modify | All `tests/unit/**/*.spec.js` — update imports for Vitest |

---

## Bootstrap-Vue 2 → bootstrap-vue-next Component Map

Template tag names stay the same (both use `b-` prefix). Changes are in registration and a few props/slots:

| BV2 | BVN | Notes |
|-----|-----|-------|
| `b-navbar` | `b-navbar` | Same |
| `b-navbar-brand` | `b-navbar-brand` | Same |
| `b-navbar-toggle` | `b-navbar-toggle` | Same |
| `b-collapse is-nav` | `b-navbar-collapse` | Different component in BVN |
| `b-navbar-nav` | `b-navbar-nav` | Remove `pills` prop (not in BVN) |
| `b-nav-item` | `b-nav-item` | Same |
| `b-nav-item-dropdown` | `b-nav-item-dropdown` | Same |
| `b-dropdown-item` | `b-dropdown-item` | Same |
| `b-alert` | `b-alert` | `show` prop renamed to `model-value`; `@dismissed` → `@closed` |
| `b-table` | `b-table` | Same (verify `formatter` field option still works) |
| `v-b-tooltip` | `v-b-tooltip` | Register via `app.directive('b-tooltip', vBTooltip)` |

Bootstrap 4 → 5 spacing class renames (update in all templates):
- `ml-auto` → `ms-auto`
- `mr-2` → `me-2`
- `mt-2` → `mt-2` (unchanged)
- `mb-1` → `mb-1` (unchanged)

---

### Task 1: Update package.json dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove Vue 2 / Vue CLI packages**

```bash
npm uninstall vue vue-router bootstrap-vue @vue/cli-service @vue/cli-plugin-babel @vue/cli-plugin-eslint @vue/cli-plugin-e2e-cypress @vue/cli-plugin-unit-jest vue-template-compiler node-sass sass-loader rollup rollup-plugin-babel rollup-plugin-uglify-es rollup-plugin-vue vue-cli-plugin-test-attrs babel-jest babel-eslint babel-plugin-jsx-v-model @vue/test-utils @babel/core
```

- [ ] **Step 2: Install Vue 3 core**

```bash
npm install vue@^3.5 vue-router@^4
```

- [ ] **Step 3: Install Vite and plugins**

```bash
npm install --save-dev vite@^8 @vitejs/plugin-vue @vitejs/plugin-vue-jsx
```

- [ ] **Step 4: Install Bootstrap / bootstrap-vue-next**

```bash
npm install bootstrap@^5.3.0 bootstrap-vue-next@^0.45.0
npm uninstall bootstrap  # remove old BV2 bootstrap peer dep first if needed
```

- [ ] **Step 5: Install mitt (replaces Vue 2 event bus)**

```bash
npm install mitt
```

- [ ] **Step 6: Install Vitest and test utils**

```bash
npm install --save-dev vitest @vue/test-utils@^2 @vitejs/plugin-vue jsdom
```

- [ ] **Step 7: Install dart sass (replaces node-sass)**

```bash
npm install --save-dev sass
```

- [ ] **Step 8: Update scripts in package.json**

Replace the `scripts` block with:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:lib": "vite build --mode lib",
  "preview": "vite preview",
  "test:unit": "vitest run",
  "test:unit:watch": "vitest",
  "test:e2e:pw": "playwright test",
  "lint": "eslint src --ext .vue,.js,.ts"
}
```

- [ ] **Step 9: Update engines field**

In `package.json`, update:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: update dependencies for Vue 3 + Vite 8 migration"
```

---

### Task 2: Create Vite config and move index.html

**Files:**
- Create: `vite.config.ts`
- Create: `index.html` (at project root)
- Delete: `vue.config.js`
- Delete: `babel.config.js`

- [ ] **Step 1: Read the current public/index.html**

Open `public/index.html` and note its content. It will look something like:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>constraint-modeler</title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but constraint-modeler doesn't work properly without JavaScript enabled.</strong>
    </noscript>
    <div id="app"></div>
  </body>
</html>
```

- [ ] **Step 2: Create root index.html for Vite**

Create `index.html` at the project root with a module script tag pointing to `src/main.js`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Constraint Modeler Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [vue(), vueJsx()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/components/entry.js'),
          name: 'ConstraintModeler',
          formats: ['umd', 'es'],
          fileName: (format) =>
            format === 'umd'
              ? 'constraint-modeler.umd.js'
              : 'constraint-modeler.common.js',
        },
        rollupOptions: {
          external: ['vue', 'vue-router', 'bootstrap-vue-next', 'axios'],
          output: {
            globals: {
              vue: 'Vue',
              'bootstrap-vue-next': 'BootstrapVueNext',
            },
          },
        },
        outDir: 'dist',
        cssCodeSplit: false,
      },
    };
  }

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    base: process.env.NODE_ENV === 'production' ? '/constraint-modeler/' : '/',
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:8088',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
```

- [ ] **Step 4: Delete vue.config.js and babel.config.js**

```bash
git rm vue.config.js babel.config.js
```

- [ ] **Step 5: Verify Vite starts**

```bash
npm run dev
```
Expected: dev server starts on `http://localhost:8080` (app may be broken until remaining tasks complete — that's OK)

- [ ] **Step 6: Commit**

```bash
git add index.html vite.config.ts
git commit -m "feat: add Vite config and root index.html, remove vue.config.js"
```

---

### Task 3: Update src/main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Rewrite main.js for Vue 3 createApp + bootstrap-vue-next**

```javascript
import { createApp } from 'vue';
import App from './demo/App.vue';
import router from './demo/router';
import { createBootstrap } from 'bootstrap-vue-next';
import { vBTooltip } from 'bootstrap-vue-next';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

const app = createApp(App);

app.use(router);
app.use(createBootstrap());
app.directive('b-tooltip', vBTooltip);

app.mount('#app');
```

- [ ] **Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: update main.js for Vue 3 createApp + bootstrap-vue-next"
```

---

### Task 4: Update src/demo/router.js

**Files:**
- Modify: `src/demo/router.js`

- [ ] **Step 1: Rewrite router.js for Vue Router 4**

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Simple from './views/Simple.vue';
import Debug from './views/Debug.vue';
import WithProjection from './views/WithProjection.vue';
import Persistent from './views/Persistent.vue';
import Everything from './views/Everything.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home, meta: { title: 'Home' } },
    { path: '/simple', name: 'simple', component: Simple, meta: { title: 'Simple' } },
    { path: '/debug', name: 'debug', component: Debug, meta: { title: 'Debug' } },
    { path: '/projection', name: 'projection', component: WithProjection, meta: { title: 'Projection' } },
    { path: '/persistent', name: 'persistent', component: Persistent, meta: { title: 'Persistent' } },
    { path: '/everything', name: 'everything', component: Everything, meta: { title: 'Everything' } },
    { path: '/:pathMatch(.*)*', component: Home, meta: { title: 'Home' } },
  ],
});

router.beforeEach((to) => {
  document.title = to.meta.title;
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add src/demo/router.js
git commit -m "feat: update router for Vue Router 4"
```

---

### Task 5: Update src/components/entry.js

**Files:**
- Modify: `src/components/entry.js`

- [ ] **Step 1: Rewrite for Vue 3 plugin API**

```javascript
import ConstraintModeler from './constraint-modeler/ui/ConstraintModeler.vue';

const plugin = {
  install (app) {
    app.component('ConstraintModeler', ConstraintModeler);
  }
};

export { ConstraintModeler };
export default plugin;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/entry.js
git commit -m "feat: update entry.js for Vue 3 plugin API"
```

---

### Task 6: Update ConstraintModeler.vue — replace $on event bus with mitt

**Files:**
- Modify: `src/components/constraint-modeler/ui/ConstraintModeler.vue`

The core Vue 2 → Vue 3 breaking change: `$on`/`$off`/`$once` removed. This component uses `this.$on(...)` in `mounted()` to handle events from child components (via `this.modelListener.$emit(...)` in children). Replace with `mitt`.

- [ ] **Step 1: Update the script section**

Replace the entire `<script>` block with:

```javascript
import ConstraintGroup from './constraint/ConstraintGroup.vue';
import ProjectionGroup from './projection/ProjectionGroup.vue';
import Model from '../model/Model';
import ConstraintModelerResource from '../ConstraintModelerResource';
import AbstractConstraintModelerResource from '../AbstractConstraintModelerResource';
import mitt from 'mitt';

export default {
  name: 'ConstraintModeler',
  components: { ProjectionGroup, ConstraintGroup },
  props: {
    title: { type: String, default: null },
    objectName: { type: String, required: true },
    showDebug: { type: Boolean, default: false },
    exposeProjectionModeler: { type: Boolean, default: false },
    initialModelJsonObject: { type: Object, default: () => null },
    constraintModelerResource: {
      type: Object,
      default: () => new ConstraintModelerResource(),
      validator: model => AbstractConstraintModelerResource.isValidImplementation(model)
    },
    saveFunction: { type: Function, default: null }
  },
  provide () {
    return {
      modelListener: this
    };
  },
  data () {
    return {
      componentReady: false,
      model: new Model(this.objectName, this.constraintModelerResource),
      syntaxDisplay: '',
      successDisplay: '',
      errorDisplay: '',
      templatePrefix: 'test',
      objectId: 'objId',
      emitter: mitt()
    };
  },
  created () {
    this.model.loadProperties().then(() => {
      this.model.buildModelFromJson(this.initialModelJsonObject);
      if (this.exposeProjectionModeler) {
        this.model.addProjectionGroup();
      }
      this.componentReady = true;
    });
  },
  mounted () {
    this.emitter.on('apply', () => this.validateAndApply());
    this.emitter.on('setJunction', (constraintGroupModel, junctionEnum) => {
      constraintGroupModel.setJunction(junctionEnum);
    });
    this.emitter.on('addConstraint', (constraintGroupModel) => {
      constraintGroupModel.addConstraint();
    });
    this.emitter.on('addConstraintGroup', (constraintGroupModel) => {
      constraintGroupModel.addConstraintGroup();
    });
    this.emitter.on('removeConstraintGroup', (constraintGroupModel) => {
      this.rootConstraintGroup.removeConstraintGroupRecursively(constraintGroupModel.getObjectId());
    });
    this.emitter.on('setQueryFunctionEnum', (constraintModel, enumKey) => {
      constraintModel.setQueryFunction(enumKey);
    });
    this.emitter.on('setProperty', (constraintModel, property) => {
      constraintModel.setProperty(property);
    });
    this.emitter.on('setComparator', (constraintModel, comparisonType) => {
      constraintModel.setComparisonType(comparisonType);
    });
    this.emitter.on('updateValueArray', (constraintModel, valueArray) => {
      constraintModel.setValueArray(valueArray);
    });
    this.emitter.on('removeConstraint', (constraintGroupModel, constraintModel) => {
      constraintGroupModel.removeConstraint(constraintModel.getObjectId());
    });
    this.emitter.on('setProjectionQueryFunctionEnum', (projectionModel, enumKey) => {
      projectionModel.setQueryFunction(enumKey);
    });
    this.emitter.on('setProjectionProperty', (projectionModel, property) => {
      projectionModel.setProperty(property);
    });
  },
  computed: {
    rootConstraintGroup () { return this.model.getRootConstraintGroup(); },
    propertyList () { return this.model.getPropertyList(); },
    multiPropertyList () { return this.model.getMultiPropertyList(); },
    pathToPropertyMap () { return this.model.getPathToPropertyMap(); },
    isSaveSupported () { return typeof this.saveFunction === 'function'; }
  },
  methods: {
    validateAndApply () {
      return this.model.validate().then(result => {
        if (result.success) {
          return this.model.apply().then(result => {
            this.$emit('applyConstraintsToData', result);
          });
        }
      });
    },
    addProjection () {
      this.model.getProjectionGroup().addProjection();
    },
    removeProjection (projection) {
      this.model.getProjectionGroup().removeProjection(projection.getObjectId());
    },
    save () {
      if (this.isSaveSupported) {
        return this.model.validate().then(result => {
          if (result.success) {
            return this.saveFunction(this.model, true).then(() => {
              this.successDisplay = 'This constraint model was saved.';
            });
          } else {
            this.errorDisplay = 'This filter has failed validation.';
          }
        });
      } else {
        this.errorDisplay = 'Save functionality is not supported.';
      }
    },
    renderSyntax () {
      this.syntaxDisplay = this.model.renderSyntax();
      return this.syntaxDisplay;
    },
    renderQueryString () {
      this.syntaxDisplay = this.model.renderQueryString();
      return this.syntaxDisplay;
    },
    renderSimpleJSON () {
      this.syntaxDisplay = this.model.renderSimpleJSON();
      return this.syntaxDisplay;
    },
    renderFlattenedObjectList () {
      this.syntaxDisplay = this.model.renderFlattenedObjectList();
      return this.syntaxDisplay;
    },
    renderStructuredObjectList () {
      this.syntaxDisplay = this.model.renderStructuredObjectList();
      return this.syntaxDisplay;
    }
  }
};
```

- [ ] **Step 2: Update the template — fix b-alert for bootstrap-vue-next**

In the template, update the `b-alert` usage. BVN uses `model-value` instead of `:show` and `@closed` instead of `@dismissed`:

```html
<b-alert variant="dark" dismissible
         :model-value="syntaxDisplay !== ''"
         @closed="syntaxDisplay=''">
  <span class="syntaxDisplay">{{syntaxDisplay}}</span>
</b-alert>

<b-alert variant="success" dismissible
         :model-value="successDisplay !== ''"
         @closed="successDisplay=''">
  {{successDisplay}}
</b-alert>

<b-alert variant="danger" dismissible
         :model-value="errorDisplay !== ''"
         @closed="errorDisplay=''">
  {{errorDisplay}}
</b-alert>
```

Also update spacing class in the buttons div: `mr-2` → `me-2`.

- [ ] **Step 3: Update style — replace ::v-deep with :deep()**

In the `<style scoped>` block, Vue 3 replaces `::v-deep` with `:deep()`:

```scss
:deep(div.nest) {
  margin-left: 25px;
}

div.constraint-modeler {
  :deep(.navbar .btn),
  :deep(.navbar .btn-group .btn) {
    padding: 1px 4px;
  }
  :deep(.nav-link) {
    padding-top: 0;
    padding-bottom: 0;
  }
  :deep(div.navbar) {
    border-radius: 7px;
  }
  :deep(input[type='text']) {
    width: 100px;
  }
  :deep(.buttons) {
    text-align: center;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/ui/ConstraintModeler.vue
git commit -m "feat: update ConstraintModeler for Vue 3 - replace \$on with mitt, update BVN alerts"
```

---

### Task 7: Update child components — replace $emit to modelListener with emitter

All child components that call `this.modelListener.$emit(...)` must change to `this.modelListener.emitter.emit(...)`.

**Files:**
- Modify: `src/components/constraint-modeler/ui/constraint/Constraint.vue`
- Modify: `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue`
- Modify: `src/components/constraint-modeler/ui/projection/Projection.vue`

- [ ] **Step 1: Update Constraint.vue methods**

In `src/components/constraint-modeler/ui/constraint/Constraint.vue`, replace all `this.modelListener.$emit(` with `this.modelListener.emitter.emit(`:

```javascript
methods: {
  setComparator (comparisonType) {
    this.modelListener.emitter.emit('setComparator', this.constraintModel, comparisonType);
  },
  setQueryFunctionEnum (enumKey) {
    this.modelListener.emitter.emit('setQueryFunctionEnum', this.constraintModel, enumKey);
  },
  setProperty (property) {
    this.modelListener.emitter.emit('setProperty', this.constraintModel, property);
  },
  updateValueArray (valueArray) {
    this.modelListener.emitter.emit('updateValueArray', this.constraintModel, valueArray);
  },
  removeConstraint () {
    this.$emit('removeConstraint', this.constraintModel);
  }
}
```

Also remove `v-b-tooltip` directive usage in the template (tooltip on the validity icon). Replace with a plain `title` attribute for now:

```html
<div v-else class="invalid">
  <img src="@/assets/images/icons/error.png" alt="invalid" :title="invalidReason"/>
</div>
```

- [ ] **Step 2: Update ConstraintGroup.vue methods**

In `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue`, read the full file and find all `this.modelListener.$emit(` calls and replace with `this.modelListener.emitter.emit(`.

The typical calls are in `setJunction`, `addConstraint`, `addConstraintGroup`, `removeConstraintGroup` methods.

- [ ] **Step 3: Update Projection.vue methods**

In `src/components/constraint-modeler/ui/projection/Projection.vue`:

```javascript
methods: {
  setQueryFunctionEnum (enumKey) {
    this.modelListener.emitter.emit('setProjectionQueryFunctionEnum', this.projectionModel, enumKey);
  },
  setProperty (property) {
    this.modelListener.emitter.emit('setProjectionProperty', this.projectionModel, property);
  },
  removeProjection () {
    this.$emit('removeSelf');
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/ui/constraint/Constraint.vue \
        src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue \
        src/components/constraint-modeler/ui/projection/Projection.vue
git commit -m "feat: update child components to use emitter instead of \$emit on modelListener"
```

---

### Task 8: Update dropdown components for bootstrap-vue-next

`JunctionMenu`, `ComparisonMenu`, and `PropertyMenu` all use `b-nav-item-dropdown` + `b-dropdown-item`. These component names are the same in BVN but confirm the slot API for `button-content` vs `text` prop.

**Files:**
- Modify: `src/components/constraint-modeler/ui/constraint/JunctionMenu.vue`
- Modify: `src/components/constraint-modeler/ui/constraint/ComparisonMenu.vue`
- Modify: `src/components/constraint-modeler/ui/shared/PropertyMenu.vue`
- Modify: `src/components/constraint-modeler/ui/shared/QueryFunctionMenu.vue`

- [ ] **Step 1: Update JunctionMenu.vue template**

`b-nav-item-dropdown :text="..."` still works in BVN. Verify the template compiles by running `npm run dev` and checking the browser console. If `extra-toggle-classes` prop is not recognized, remove it (BVN may not support it):

```html
<template>
  <b-nav-item-dropdown :text="junction.label">
    <b-dropdown-item v-for="item in typesArray" :key="item.key" @click.prevent="setJunction(item.key)">
      {{item.label}}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>
```

- [ ] **Step 2: Apply same pattern to ComparisonMenu.vue and PropertyMenu.vue**

Remove `extra-toggle-classes` prop if present. Verify templates are otherwise unchanged.

- [ ] **Step 3: Check QueryFunctionMenu.vue**

Read `src/components/constraint-modeler/ui/shared/QueryFunctionMenu.vue` and apply same `extra-toggle-classes` removal if present.

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/ui/constraint/JunctionMenu.vue \
        src/components/constraint-modeler/ui/constraint/ComparisonMenu.vue \
        src/components/constraint-modeler/ui/shared/PropertyMenu.vue \
        src/components/constraint-modeler/ui/shared/QueryFunctionMenu.vue
git commit -m "feat: update dropdown components for bootstrap-vue-next"
```

---

### Task 9: Update App.vue for bootstrap-vue-next

**Files:**
- Modify: `src/demo/App.vue`

The navbar uses BV2-specific components. Key change: `b-collapse is-nav` → `b-navbar-collapse` (BVN renamed this).

- [ ] **Step 1: Rewrite App.vue template**

```html
<template>
  <div id="app">
    <nav id="nav">
      <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-brand href="#">Constraint Modeler Demo</b-navbar-brand>
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-navbar-collapse id="nav_collapse">
          <b-navbar-nav class="nav">
            <b-nav-item to="/" exact>Home</b-nav-item>
            <b-nav-item to="/simple">Simple</b-nav-item>
            <b-nav-item to="/debug">Debug</b-nav-item>
            <b-nav-item to="/projection">Projection</b-nav-item>
            <b-nav-item to="/persistent">Persistent</b-nav-item>
            <b-nav-item to="/everything">Everything</b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ms-auto">
            <b-nav-item-dropdown right>
              <template #button-content>
                <em>User</em>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item href="#">Signout</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-navbar-collapse>
      </b-navbar>
    </nav>

    <div class="container-fluid">
      <router-view/>
    </div>
  </div>
</template>
```

The script block is unchanged. Update `ml-auto` → `ms-auto` in style if present.

- [ ] **Step 2: Commit**

```bash
git add src/demo/App.vue
git commit -m "feat: update App.vue navbar for bootstrap-vue-next"
```

---

### Task 10: Update ListGrid.vue

**Files:**
- Modify: `src/demo/views/ListGrid.vue`

`b-table` in BVN has the same API. Verify `formatter` in field definitions still works (it does in BVN).

- [ ] **Step 1: Verify b-table compiles**

Start `npm run dev`, navigate to `/everything`, click Apply. Confirm the table renders.
If there are prop warnings in the console about `b-table`, check BVN docs for the exact prop names (`small` → `sm`, `bordered`, `striped`, `hover` are all still valid).

- [ ] **Step 2: Fix any b-table prop warnings**

If `small` prop is not recognized, rename to `sm`:
```html
<b-table sm bordered striped hover :fields="fields" :items="items" />
```

- [ ] **Step 3: Commit**

```bash
git add src/demo/views/ListGrid.vue
git commit -m "feat: verify and update ListGrid b-table for bootstrap-vue-next"
```

---

### Task 11: Migrate Jest → Vitest

**Files:**
- Delete: `jest.config.js`
- Create: `vitest.config.ts`
- Modify: `tests/unit/setup.js` and all unit spec files (import changes)

- [ ] **Step 1: Delete jest.config.js**

```bash
git rm jest.config.js
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.js'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

- [ ] **Step 3: Update tests/unit/setup.js**

Read the current `tests/unit/setup.js`. Replace any Jest-specific imports. If it uses `jest.mock` or similar, update to Vitest equivalents. The typical change:

```javascript
import { config } from '@vue/test-utils';
// Any custom matchers from tests/unit/matchers.js still apply
```

- [ ] **Step 4: Run unit tests**

```bash
npm run test:unit
```
Expected: tests run (some may fail due to Vue 3 API changes — fix failures before moving on)

- [ ] **Step 5: Fix any Vue 3 breaking changes in unit tests**

Common issues:
- `shallowMount` from `@vue/test-utils` v2 has slightly different shallow behavior
- `wrapper.vm.$set` is gone — use direct assignment
- `createLocalVue` is gone — use `config.global.plugins` instead

For each failing test, read the test, apply the fix, re-run.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/unit/
git commit -m "feat: migrate Jest to Vitest, update unit tests for Vue 3"
```

---

### Task 12: Run Playwright suite — exit gate

**Files:** none

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```
Expected: Vite starts on port 8080 without errors

- [ ] **Step 2: Run all Playwright specs**

In a separate terminal:
```bash
npm run test:e2e:pw
```
Expected: 5 tests pass

If tests fail, use the Playwright HTML report to diagnose:
```bash
npx playwright show-report
```

Common failure causes and fixes:
- If `div.alerts` selector fails: inspect the rendered BVN alert and update the selector to match BVN's rendered HTML (`div.alert` wrapping structure may differ)
- If dropdown items aren't clickable: check that BVN dropdowns open on click (may need `await page.locator('[data-test="property-menu"] button').click()` to target the toggle button specifically)
- If `syntaxDisplay` is empty: check browser console for JS errors in the model initialization

- [ ] **Step 3: Fix any failures and re-run until green**

Commit fixes individually with descriptive messages.

- [ ] **Step 4: Final Phase 2 commit**

```bash
git add .
git commit -m "feat: Phase 2 complete — Vue 3.5 + Vite 8 migration, Playwright suite green"
```

---

## Exit Gate

All 5 Playwright specs pass against `npm run dev` (Vite dev server on port 8080).

**Next:** Phase 3 plan — `.claude/superpowers/plans/2026-05-11-phase3-test-expansion.md`