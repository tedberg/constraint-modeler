<template>
  <div class="cm:max-w-2xl">
    <div class="cm:bg-blue-50 cm:border cm:border-blue-300 cm:text-blue-800 cm:rounded cm:px-4 cm:py-3 cm:mb-4 cm:text-sm">
      This is a demonstration site for the Constraint Modeler Vue component.
    </div>

    <p class="cm:mb-3 cm:text-sm cm:text-zinc-700">
      Use the navigation above to try out the component in various states:
    </p>

    <ul class="cm:list-disc cm:list-inside cm:mb-4 cm:space-y-1 cm:text-sm cm:text-zinc-700">
      <li>
        <strong>Simple</strong> — Simple case, add a constraint or two, check the syntax and apply.
      </li>
      <li>
        <strong>Debug</strong> — Like simple case, but exposes some extra links to use for
        debugging.
      </li>
      <li>
        <strong>Projection</strong> — Like simple case, but adds the ability to specify a simple
        projection.
      </li>
      <li>
        <strong>Persistent</strong> — Demonstrates ability to restore a previously defined
        constraint model with save button.
      </li>
      <li><strong>Everything</strong> — Exposes all options.</li>
    </ul>

    <div class="cm:bg-yellow-50 cm:border cm:border-yellow-300 cm:text-yellow-800 cm:rounded cm:px-4 cm:py-3 cm:text-sm">
      This demo is a static site, not running against a database. The normal API which would make
      calls to a server is implemented as a stub, responding with canned responses wrapped in
      promises. The data which appears in the grid is only a simulation and not actually filtered by
      the constraints.
    </div>
  </div>
</template>

<script setup lang="ts"></script>
