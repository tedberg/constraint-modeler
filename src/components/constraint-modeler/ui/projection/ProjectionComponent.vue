<template>
  <div class="navbar navbar-expand-lg navbar-dark bg-dark projection-bar mb-1" :id="projectionId">
    <div class="collapse navbar-collapse">

      <ul class="navbar-nav">
        <li class="nav-item dropdown" :id="aggregateId">
          <query-function-menu :query-function="queryFunctionEnum"
                               :template-prefix="templatePrefix"
                               v-on:setQueryFunction="setQueryFunctionEnum"/>
        </li>

        <li class="nav-item active dropdown" :id="propertyId">
          <property-menu :property="property"
                         :property-list="propertyList"
                         :multi-property-list="multiPropertyList"
                         :template-prefix="templatePrefix"
                         v-on:setProperty="setProperty"/>
        </li>
      </ul>

      <ul class="navbar-nav ml-auto">
        <li>
          <div class="validity"></div>
        </li>

        <form class="form-inline">
          <button class="btn btn-sm btn-secondary" @click.prevent="removeProjection">X</button>
        </form>

      </ul>
    </div>
  </div>
</template>

<script>
  import QueryFunctionMenu from '../shared/QueryFunctionMenu';
  import PropertyMenu from '../shared/PropertyMenu';
  import ProjectionModel from '../../model/ProjectionModel';

  export default {
    name: 'ProjectionComponent',
    components: { PropertyMenu, QueryFunctionMenu },
    inject: ['modelListener'],
    props: {
      templatePrefix: {
        type: String,
        default: ''
      },
      projectionModel: {
        type: Object,
        required: true,
        validator: model => {
          return model instanceof ProjectionModel;
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
    data: () => {
      return {};
    },
    computed: {
      property () {
        console.error('this.projectionModel.getProperty()', this.projectionModel.getProperty());
        return this.projectionModel.getProperty() || null;
      },
      objectId () {
        return this.projectionModel.getObjectId();
      },
      queryFunctionEnum () {
        return this.projectionModel.getQueryFunction();
      },
      projectionId () {
        return this.templatePrefix + '_projection-bar-' + this.objectId;
      },
      aggregateId () {
        return this.templatePrefix + '_aggregate-menu-' + this.objectId;
      },
      propertyId () {
        return this.templatePrefix + '_property-menu-' + this.objectId;
      }
    },
    methods: {
      setQueryFunctionEnum (enumKey) {
        this.modelListener.$emit('setProjectionQueryFunctionEnum', this.projectionModel, enumKey);
      },
      setProperty (property) {
        this.modelListener.$emit('setProjectionProperty', this.projectionModel, property);
      },
      removeProjection () {
        this.$emit('removeSelf');
      }
    }
  };
</script>

<style scoped lang="scss">
  div.navbar {
    margin-left: 15px;
  }

  .projection-bar {
    width: 400px;
  }
</style>
