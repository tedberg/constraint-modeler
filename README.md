# Constraint Modeler

> A visual component used for building constraints and/or projections, to be used
with a database.  Implemented with Vue and modern Javascript.

## Demo

[View Demo](https://tedberg.github.io/constraint-modeler/index.html)

## Usage

### Directly in the browser

Drop the library in with a `<script>` tag alongside Vue to globally install all components:

```html
<div id="app">
  <constraint-modeler :objectName="objectName"></constraint-modeler>
</div>

<script src="https://unpkg.com/vue"></script>
<script src="https://unpkg.com/@tedberg/constraint-modeler"></script>
<script>
  new Vue({ el: '#app' })
</script>
```

### In a module system

Install the library with NPM:

```bash
npm install @tedberg/constraint-modeler
```

Then register the library as a plugin to globally install all components:

```js
import ConstraintModeler from '@tedberg/constraint-modeler';
import '@tedberg/constraint-modeler/dist/constraint-modeler.css';

Vue.use(ConstraintModeler);
```

### Simple Example

Here is a basic example, creating a simple constraint and displaying the logical syntax:
![alt text][simple]

### Adding Projections Example

This example adds a projection while displaying the logical syntax:
![alt text][projection]

### Full Example

Here is a full example, showing a more complex constraint, with projection and displaying the logical syntax:
![alt text][everything]


[simple]: docs/images/simple_with_syntax.png "Simple example"
[projection]: docs/images/projection_with_syntax.png "Projection example"
[everything]: docs/images/everything_with_syntax.png "Fully populated"
