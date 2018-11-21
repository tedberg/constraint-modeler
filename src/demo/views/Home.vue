<template>
  <div class="container">

    <div class="alert alert-primary mt-3" role="alert">
      This is a demonstration site for the Constraint Modeler Vue component.
    </div>

    <p>
      Use the navigation above to try out the component in various states:
    </p>

    <ul>
      <li>Simple - Simple case, add a constraint or two, check the syntax and apply.</li>
      <li>Debug - Like simple case, but exposes some extra links to use for debugging.</li>
      <li>Projection - Like simple case, but adds the ability to specify a simple projection.</li>
      <li>Persistent - Demonstrates ability to restore a previously defined constraint model with save button.</li>
      <li>Everything - Exposes all options.</li>
    </ul>

    <div class="alert alert-warning mt-3" role="alert">
      This demo is a static site, not running against a database. The normal API which would make calls to a server is implemented as a stub,
      responding with canned responses wrapped in promises. The data which appears in the grid is only a simulation and not actually filtered by
      the constraints.
    </div>

  </div>
</template>

<script>

  export default {
    name: 'home',
    components: {}
  };
</script>

