<template>
  <div>

    <constraint-modeler title="Projection Constraint Modeler"
                        :objectName="objectName"
                        :expose-projection-modeler="true"
                        v-on:applyConstraintsToData="applyDataGrid"
                        :constraintModelerResource="constraintModelerResource"/>

    <list-grid :objectName="objectName"
               :fields="fields"
               :items="queryResultData"/>

  </div>
</template>

<script>
  import ConstraintModeler from '@/components/constraint-modeler/ui/ConstraintModeler.vue';
  import StubConstraintModelerResource from '@/components/constraint-modeler/StubConstraintModelerResource';
  import ListGrid from './ListGrid.vue';

  export default {
    name: 'withProjection',
    components: {
      ConstraintModeler, ListGrid
    },
    data: () => {
      return {
        objectName: 'Projection',
        result: {},
        fields: [
          {
            key: 'id',
            sortable: true
          },
          {
            key: 'name',
            sortable: true
          },
          {
            key: 'age',
            sortable: true
          },
          {
            key: 'status',
            sortable: false,
            formatter: (value, key, item) => {
              return value === 'ENABLED' ? 'Yep' : 'Nope';
            }
          }
        ]
      };
    },
    created () {
      this.result = {};
      this.constraintModelerResource = new StubConstraintModelerResource();
    },
    computed: {
      queryResultData () {
        return this.result.data;
      }
    },
    methods: {
      applyDataGrid (result) {
        this.result = result;
      }
    }
  };
</script>
