<template>
  <b-nav-item-dropdown :text="queryFunctionDisplay" extra-toggle-classes="nav-link-custom">
    <h6 class="dropdown-header">Aggregates</h6>

    <b-dropdown-item v-for="item in aggregateArray" :key="item.key" @click.prevent="setQueryFunction(item.key)">{{item.label}}</b-dropdown-item>

    <div class="dropdown-divider"></div>
    <h6 class="dropdown-header">Functions</h6>

    <b-dropdown-item v-for="item in queryFunctionArray" :key="item.key" @click.prevent="setQueryFunction(item.key)">{{item.label}}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
  import { QueryFunctionEnum } from '../../enum/QueryFunctionEnum';
  import { DataTypeEnum } from '../../enum/DataTypeEnum';
  import { GeneralEnum } from '../../enum/Enum';
  import Property from '../../Property';

  // TODO: Constraint and ConstraintModeler render this with differing logic

  // Implementing for Constraint first

  // // If currently selected comparator is no longer in the updated comparisonMenu, reset it to first choice in menu.
  // if (valueArray[0] && valueArray.indexOf(this.comparisonType) < 0) {
  //   this.comparisonType = valueArray[0];
  // }

  export default {
    name: 'QueryFunctionMenu',
    props: {
      templatePrefix: {
        type: String,
        required: true
      },
      property: {
        type: Object,
        validator: model => {
          return model instanceof Property;
        }
      },
      queryFunction: {
        type: Object
      }
    },
    data: () => {
      return {
        queryFunctionArray: QueryFunctionEnum.getQueryFunctionValueList(),
        aggregateArray: QueryFunctionEnum.getAggregateFunctionValueList()
      };
    },
    // TODO: May need this when props change or later in lifecycle
    created () {
      if (this.property) {
        if (this.property.multiProperty) {
          this.queryFunctionArray = QueryFunctionEnum.getQueryFunctionValueListForInputType(DataTypeEnum.COLLECTION);
          this.aggregateArray = [];
        } else {
          let inputType = DataTypeEnum.getTypeFromAlias(this.property.simpleDataType);
          this.queryFunctionArray = QueryFunctionEnum.getQueryFunctionValueListForInputType(inputType);
          this.aggregateArray = QueryFunctionEnum.getAggregateFunctionValueListForInputType(inputType);
        }
      } else {
        this.queryFunctionArray = QueryFunctionEnum.getQueryFunctionValueList();
        this.aggregateArray = QueryFunctionEnum.getAggregateFunctionValueList();
      }

      this.aggregateArray.unshift(GeneralEnum.NONE);
    },
    computed: {
      queryFunctionDisplay () {
        return this.queryFunction ? this.queryFunction.label : 'None';
      }
    },
    methods: {
      // Have to set my own info and fire event as old code called ConstraintModeler, which then found this element
      // and called its function.

      setQueryFunction (enumKey) {
        this.$emit('setQueryFunction', enumKey);
      }
    }
  };
</script>

<style scoped lang="scss">

</style>

