<template>
  <div>

    <constraint-modeler title="Persistent Constraint Modeler"
                        :objectName="objectName"
                        :initial-model-json-object="initialModel"
                        v-on:applyConstraintsToData="applyDataGrid"
                        :saveFunction="uiSaveFunction"
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

  import ModelPersistence from '@/components/constraint-modeler/model/ModelPersistence';

  export default {
    name: 'persistent',
    components: {
      ConstraintModeler, ListGrid
    },
    data: () => {
      return {
        objectName: 'Persistent',
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
        ],
        initialModel: {
          'constraintGroup': {
            'constraint': {
              'value': 'status:eq:ENABLED;age:gt:50',
              'sub1': {
                'junction': 'or',
                'value': 'age:lte:35;upper(name):like:*Y'
              }
            }
          }
        }
      };
    },
    created () {
      this.constraintModelerResource = new StubConstraintModelerResource();

      this.modelPersistence = new ModelPersistence();
      this.uiSaveFunction = this.modelPersistence.save.bind(this.modelPersistence);

      this.result = {};
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
