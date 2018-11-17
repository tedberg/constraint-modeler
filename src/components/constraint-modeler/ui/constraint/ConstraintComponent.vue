<template>
  <div class="navbar navbar-expand-lg navbar-dark bg-dark constraint-bar mb-1" :id="constraintId">
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

        <li class="nav-item dropdown" :id="comparisonId">
          <comparison-menu :comparison-type="comparisonType"
                           :data-type="dataType"
                           :query-function="queryFunctionEnum"
                           :property="property"
                           :template-prefix="templatePrefix"
                           v-on:setComparator="setComparator"/>
        </li>
      </ul>

      <form class="form-inline navbar-search pull-left" :id="valueEntriesId">
        <value-input :property="property"
                     :comparison-type="comparisonType"
                     :value-array="valueArray"
                     :template-prefix="templatePrefix"
                     :object-id="objectId"
                     v-on:updateValueArray="updateValueArray"/>
        />
      </form>

      <ul class="navbar-nav ml-auto">
        <li>
          <div class="validity">
            <div v-if="isValid == null"></div>
            <div v-else-if="isValid" class="valid"><img src="@/assets/images/icons/accept.png" alt="valid"/></div>
            <div v-else class="invalid"><img src="@/assets/images/icons/error.png" alt="invalid" v-b-tooltip.hover :title="invalidReason"/></div>
          </div>
        </li>
        <form class="form-inline ml-2">
          <button class="btn btn-sm btn-secondary" @click.prevent="removeConstraint">X</button>
        </form>
      </ul>

    </div>
  </div>
</template>

<script>
  import ComparisonMenu from './ComparisonMenu';
  import QueryFunctionMenu from '../shared/QueryFunctionMenu';
  import ValueInput from './ValueInput';

  import PropertyMenu from '../shared/PropertyMenu';
  import ConstraintModel from '../../model/ConstraintModel';

  export default {
    name: 'ConstraintComponent',
    components: { PropertyMenu, ValueInput, QueryFunctionMenu, ComparisonMenu },
    inject: ['modelListener'],
    props: {
      templatePrefix: {
        type: String,
        default: ''
      },
      constraintModel: {
        type: Object,
        required: true,
        validator: model => {
          return model instanceof ConstraintModel;
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
      valueArray () {
        return this.constraintModel.getValueArray();
      },
      comparisonType () {
        return this.constraintModel.getComparisonType();
      },
      property () {
        return this.constraintModel.getProperty() || null;
      },
      dataType () {
        return this.constraintModel.getDataType();
      },
      serverDataType () {
        return this.constraintModel.getServerDataType();
      },
      objectId () {
        return this.constraintModel.getObjectId();
      },
      queryFunctionEnum () {
        return this.constraintModel.getQueryFunction();
      },
      key () {
        return this.constraintModel.getKey();
      },
      isValid () {
        if (this.constraintModel.verifiedValidity === null) {
          return null;
        }

        return this.constraintModel.verifiedValidity.valid;
      },
      invalidReason () {
        if (this.constraintModel.verifiedValidity === null) {
          return null;
        }

        return this.constraintModel.verifiedValidity.reason;
      },
      constraintId () {
        return this.templatePrefix + '_constraint-bar-' + this.objectId;
      },
      aggregateId () {
        return this.templatePrefix + '_aggregate-menu-' + this.objectId;
      },
      propertyId () {
        return this.templatePrefix + '_property-menu-' + this.objectId;
      },
      comparisonId () {
        return this.templatePrefix + '_comparison-menu-' + this.objectId;
      },
      valueEntriesId () {
        return this.templatePrefix + '_valueEntries-menu-' + this.objectId;
      }
    },
    methods: {
      setComparator (comparisonType) {
        this.modelListener.$emit('setComparator', this.constraintModel, comparisonType);
      },
      setQueryFunctionEnum (enumKey) {
        this.modelListener.$emit('setQueryFunctionEnum', this.constraintModel, enumKey);
      },
      setProperty (property) {
        this.modelListener.$emit('setProperty', this.constraintModel, property);
      },
      updateValueArray (valueArray) {
        this.modelListener.$emit('setValueArray', this.constraintModel, valueArray);
      },
      removeConstraint () {
        console.log('removeConstraint');
        this.$emit('removeConstraint', this.constraintModel);
      }
    }
  };
</script>

<style scoped lang="scss">
  div.navbar {
    margin-left: 15px;
  }

  .constraint-bar {
    max-width: 800px;
  }
</style>
