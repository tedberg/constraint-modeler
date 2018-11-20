<template>
  <div :class="['constraint-group', {'root': isRoot}]">
    <div class="navbar navbar-expand-lg navbar-dark bg-dark constraint-group-bar mb-1" :id="constraintGroupId">

      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="nav-item active dropdown" :id="junctionMenuId">
            <junction-menu :junction="junction" v-on:setJunction="setJunction"/>
          </li>

          <li class="nav-item btn-group btn-group-sm">
            <button class="btn btn-sm btn-secondary" @click.prevent="addConstraint">+ C</button>
            <button class="btn btn-sm btn-secondary" @click.prevent="addConstraintGroup">+ CG</button>
          </li>
        </ul>

        <ul class="navbar-nav ml-auto">
          <form class="form-inline">
            <button v-if="isRoot" class="btn btn-sm btn-secondary" @click.prevent="apply">Apply</button>
            <button v-else class="btn btn-sm btn-secondary" @click.prevent="removeSelf">X</button>
          </form>
        </ul>

      </div>

    </div>
    <!-- Must close the nav bar-->


    <!-- This is a list of many new nav bars -->
    <constraint v-for="constraint in constraintList"
                          :key="constraint.getObjectId()"
                          :constraint-model="constraint"
                          :template-prefix="templatePrefix"
                          :propertyList="propertyList"
                          :multiPropertyList="multiPropertyList"
                          :pathToPropertyMap="pathToPropertyMap"
                          v-on:removeConstraint="removeConstraint"/>

    <!-- This is a list of many new nav bars -->
    <constraint-group v-for="constraintGroup in constraintGroupList"
                                :key="constraintGroup.getObjectId()"
                                :constraint-group-model="constraintGroup"
                                :template-prefix="templatePrefix"
                                :propertyList="propertyList"
                                :multiPropertyList="multiPropertyList"
                                :pathToPropertyMap="pathToPropertyMap"/>

  </div>
</template>

<script>
  import QueryElementGroup from '../shared/QueryElementGroup.vue';

  import JunctionMenu from './JunctionMenu.vue';
  import Constraint from './Constraint.vue';
  import ConstraintGroupModel from '../../model/ConstraintGroupModel';

  export default {
    extends: QueryElementGroup,
    name: 'ConstraintGroup',
    components: { Constraint, JunctionMenu },
    inject: ['modelListener'],
    props: {
      templatePrefix: {
        type: String,
        default: ''
      },
      constraintGroupModel: {
        type: Object,
        required: true,
        validator: model => {
          return model instanceof ConstraintGroupModel;
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
    created () {
    },
    computed: {
      junction () {
        return this.constraintGroupModel.getJunction();
      },
      constraintList () {
        return this.constraintGroupModel.getConstraintList();
      },
      constraintGroupList () {
        return this.constraintGroupModel.getConstraintGroupList();
      },
      objectId () {
        return this.constraintGroupModel.getObjectId();
      },
      isRoot () {
        return this.constraintGroupModel.isRoot();
      },
      constraintGroupId () {
        return this.templatePrefix + '_constraint-group-bar-' + this.objectId;
      },
      junctionMenuId () {
        return this.templatePrefix + '_junction-menu-' + this.objectId;
      },
      propertyId () {
        return this.templatePrefix + '_property-menu-' + this.objectId;
      }
    },
    methods: {
      setJunction (junctionEnum) {
        this.modelListener.$emit('setJunction', this.constraintGroupModel, junctionEnum);
      },
      addConstraint () {
        this.modelListener.$emit('addConstraint', this.constraintGroupModel);
      },
      removeConstraint (constraintModel) {
        this.modelListener.$emit('removeConstraint', this.constraintGroupModel, constraintModel);
      },
      addConstraintGroup () {
        this.modelListener.$emit('addConstraintGroup', this.constraintGroupModel);
      },
      apply () {
        this.modelListener.$emit('apply');
      },
      removeSelf () {
        this.modelListener.$emit('removeConstraintGroup', this.constraintGroupModel);
      }
    }
  };
</script>

<style scoped lang="scss">
  div.constraint-group:not(.root) {
    margin-left: 15px;
  }

  .constraint-group-bar {
    width: 225px;
  }
</style>
