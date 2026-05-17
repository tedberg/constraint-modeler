<template>
  <div class="navbar navbar-expand-lg navbar-dark bg-dark constraint-bar mb-1 px-2" :id="constraintId" data-test="constraint">
    <div class="collapse navbar-collapse">

      <ul class="navbar-nav">
        <li class="nav-item dropdown" :id="aggregateId" data-test="query-function-menu">
          <query-function-menu :query-function="queryFunctionEnum"
                               :template-prefix="templatePrefix"
                               v-on:setQueryFunction="setQueryFunctionEnum"/>
        </li>

        <li class="nav-item active dropdown" :id="propertyId" data-test="property-menu">
          <property-menu :property="property"
                         :property-list="propertyList"
                         :multi-property-list="multiPropertyList"
                         :template-prefix="templatePrefix"
                         v-on:setProperty="setProperty"/>
        </li>

        <li class="nav-item dropdown" :id="comparisonId" data-test="comparison-menu">
          <comparison-menu :comparison-type="comparisonType"
                           :data-type="dataType"
                           :query-function="queryFunctionEnum"
                           :property="property"
                           :template-prefix="templatePrefix"
                           v-on:setComparator="setComparator"/>
        </li>
      </ul>

      <form class="form-inline navbar-search pull-left" :id="valueEntriesId" data-test="value-input" data-testid="value-input">
        <value-input :property="property"
                     :comparison-type="comparisonType"
                     :value-array="valueArray"
                     :template-prefix="templatePrefix"
                     :object-id="objectId"
                     v-on:updateValueArray="updateValueArray"/>
      </form>

      <ul class="navbar-nav ms-auto">
        <li>
          <div class="validity">
            <div v-if="isValid == null"></div>
            <div v-else-if="isValid" class="valid"><img :src="acceptIcon" alt="valid"/></div>
            <div v-else class="invalid"><img :src="errorIcon" alt="invalid" :title="invalidReason"/></div>
          </div>
        </li>
        <form class="form-inline ms-2">
          <button class="btn btn-sm btn-secondary" @click.prevent="removeConstraint">X</button>
        </form>
      </ul>

    </div>
  </div>
</template>

<script>
  import { toRaw } from 'vue';
  import acceptIcon from '@/assets/images/icons/accept.png';
  import errorIcon from '@/assets/images/icons/error.png';
  import ComparisonMenu from './ComparisonMenu.vue';
  import QueryFunctionMenu from '../shared/QueryFunctionMenu.vue';
  import ValueInput from './ValueInput.vue';

  import PropertyMenu from '../shared/PropertyMenu.vue';
  import ConstraintModel from '../../model/ConstraintModel';

  export default {
    name: 'Constraint',
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
      return { acceptIcon, errorIcon };
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
        return toRaw(this.constraintModel.getDataType());
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
        this.modelListener.emitter.emit('setComparator', [this.constraintModel, comparisonType]);
      },
      setQueryFunctionEnum (enumKey) {
        this.modelListener.emitter.emit('setQueryFunctionEnum', [this.constraintModel, enumKey]);
      },
      setProperty (property) {
        this.modelListener.emitter.emit('setProperty', [this.constraintModel, property]);
      },
      updateValueArray (valueArray) {
        this.modelListener.emitter.emit('updateValueArray', [this.constraintModel, valueArray]);
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
