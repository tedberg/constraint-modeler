<template>
  <b-nav-item-dropdown :text="comparisonType.label" extra-toggle-classes="nav-link-custom">
    <b-dropdown-item v-for="item in comparisonTypeArray" :key="item.key" @click.prevent="setComparator(item.key)">{{item.label}}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
  import { ComparisonTypeEnum } from '../../enum/ComparisonTypeEnum';
  import { DataTypeEnum } from '../../enum/DataTypeEnum';
  import { QueryFunctionEnum } from '../../enum/QueryFunctionEnum';
  import { PropertyTypeEnum } from '../../enum/PropertyTypeEnum';
  import Property from '../../Property';

  // TODO: Constraint and ConstraintModeler render this with differing logic

  // Implementing for Constraint first

  // // If currently selected comparator is no longer in the updated comparisonMenu, reset it to first choice in menu.
  // if (valueArray[0] && valueArray.indexOf(this.comparisonType) < 0) {
  //   this.comparisonType = valueArray[0];
  // }

  export default {
    name: 'ComparisonMenu',
    props: {
      templatePrefix: {
        type: String,
        required: true
      },
      dataType: {
        type: Object,
        required: true,
        validator: model => {
          return DataTypeEnum.checkInstanceOf(model);
        }
      },
      queryFunction: {
        type: Object,
        required: false,
        validator: model => {
          return QueryFunctionEnum.checkInstanceOf(model);
        }
      },
      property: {
        type: Object,
        required: false,
        validator: model => {
          return model instanceof Property;
        }
      },
      comparisonType: {
        type: Object,
        required: true,
        validator: model => {
          return ComparisonTypeEnum.checkInstanceOf(model);
        }
      }
    },
    data: () => {
      return {};
    },
    computed: {
      comparisonTypeArray () {
        console.log('comparisonTypeArray recompute');

        console.log('recompute dataType', this.dataType);
        console.log('recompute queryFunction', this.queryFunction);
        console.log('recompute property', this.property);

        let valueArray;

        // Show all comparison choices if datatype is unknown.
        if (this.dataType === undefined || this.dataType === null) {
          valueArray = ComparisonTypeEnum.enumToValueList();
        } else {
          // Added check for function because sometimes queryFunction is set to GeneralEnum.NONE.
          if (this.queryFunction && this.queryFunction.getOutputDataType) {
            // Functions have a return type that may not match the data type.  All functions return a single value.
            valueArray = ComparisonTypeEnum.getAllForDataType(this.queryFunction.getOutputDataType(), PropertyTypeEnum.SINGLE);
          } else {
            if (this.property) {
              if (this.property.multiProperty) {
                valueArray = ComparisonTypeEnum.getAllForDataType(this.dataType, PropertyTypeEnum.MULTI);
              } else {
                valueArray = ComparisonTypeEnum.getAllForDataType(this.dataType, PropertyTypeEnum.SINGLE);
              }
            } else { // constraint.property is unknown
              valueArray = ComparisonTypeEnum.getAllForDataType(this.dataType, PropertyTypeEnum.ALL);
            }
          }
        }

        console.log('recompute valueArray', valueArray);

        return valueArray;
      }
    },
    methods: {
      setComparator (enumKey) {
        console.log('setComparator', enumKey);
        this.$emit('setComparator', ComparisonTypeEnum.getType(enumKey));
      }
    },
    watch: {
      dataType (newValue, oldValue) {
        console.log('dataType changed', this.dataType);
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
