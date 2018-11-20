<template>
  <div :class="['projection-group']">
    <div class="navbar navbar-expand-lg navbar-dark bg-dark projection-group-bar mb-1" :id="projectionGroupId">

      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <form class="form-inline">
            <button class="btn btn-sm btn-secondary" @click.prevent="addProjection()">+ P</button>
          </form>
        </ul>
      </div>

    </div>
    <!-- Must close the nav bar-->

    <!-- This is a list of many new nav bars -->
    <projection v-for="(projection, index) in projectionList"
                          :key="projection.getObjectId()"
                          :projection-model="projection"
                          :template-prefix="templatePrefix"
                          :propertyList="propertyList"
                          :multiPropertyList="multiPropertyList"
                          :pathToPropertyMap="pathToPropertyMap"
                          v-on:removeSelf="removeProjection(projection, index)"/>
  </div>
</template>

<script>
  import QueryElementGroup from '../shared/QueryElementGroup.vue';
  import Projection from './Projection.vue';
  import ProjectionGroupModel from '../../model/ProjectionGroupModel';

  export default {
    components: { Projection },
    extends: QueryElementGroup,
    name: 'ProjectionGroup',
    props: {
      templatePrefix: {
        type: String,
        default: ''
      },
      projectionGroupModel: {
        type: Object,
        required: true,
        validator: model => {
          return model instanceof ProjectionGroupModel;
        }
      },
      propertyList: {
        type: Array
      },
      multiPropertyList: {
        type: Array
      },
      pathToPropertyMap: {
        type: Object
      }
    },
    computed: {
      projectionList () {
        return this.projectionGroupModel.getProjectionList();
      },
      projectionGroupId () {
        return this.templatePrefix + '_projection-group-bar-' + this.projectionGroupModel.getObjectId();
      }
    },
    methods: {
      addProjection () {
        this.$emit('addProjection');
      },
      removeProjection (projection, index) {
        this.$emit('removeProjection', projection, index);
      }
    }
  };
</script>

<style scoped lang="scss">
  .projection-group-bar {
    width: 225px;
  }
</style>
