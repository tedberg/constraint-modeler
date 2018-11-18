<template>
  <ul v-if="hasNestedList" class="dropdown-menu">
    <li v-for="nestedProperty in nestedPropertyList" :key="nestedProperty.path">
      <a @click.prevent="setProperty">{{propertyDisplay(nestedProperty)}}</a>

      <!--{{#$$ ../objectId ../templatePrefix }}-->

      <!--{{! Recursive call here. Since JSON limits to 4, don't have to check level, if block above takes care of infinite loop. TODO, don't show >> if at max level.}}-->
      <!--{{> propertyMenuPartial}}-->

      <!--{{/$$}}-->

    </li>

    <li v-if="nestedMultiPropertyList" class="divider"></li>
    <li v-if="nestedMultiPropertyList" class="nav-header">Multi Properties</li>
    <li v-for="nestedProperty in nestedMultiPropertyList" :key="nestedProperty.path">
      <a @click.prevent="setMultiProperty">{{propertyDisplay(nestedProperty)}}</a>

      <!--{{#$$ ../objectId ../templatePrefix }}-->

      <!--{{! Recursive call here. Since JSON limits to 4, don't have to check level, if block above takes care of infinite loop.}}-->
      <!--{{> propertyMenuPartial}}-->

      <!--{{/$$}}-->

    </li>
  </ul>
</template>

<script>
  import { ComparisonTypeEnum } from '../../enum/ComparisonTypeEnum';
  import { PropertyTypeEnum } from '../../enum/PropertyTypeEnum';

  export default {
    name: 'PropertyMenuPartial',
    props: {
      templatePrefix: {
        type: String,
        required: true
      },
      property: {
        type: Object,
        required: true
      },
      nestedPropertyList: {
        type: Array,
        default: () => []
      },
      nestedMultiPropertyList: {
        type: Array,
        default: () => []
      }
    },
    data: () => {
      return {};
    },
    computed: {
      hasNestedList () {
        return (this.nestedPropertyList !== null && this.nestedPropertyList.length > 0) ||
          (this.nestedMultiPropertyList !== null && this.nestedMultiPropertyList.length > 0);
      }
    },
    methods: {
      propertyDisplay (property) {
        return property.displayName + ' ' + typeof property.simpleDataType === 'object' ? '&raquo;' : '';
      },
      setProperty () {

        // TODO: javascript:{{../templatePrefix}}ConstraintModeler.setProperty({{../objectId}}, '{{path}}');
      },
      setMultiProperty () {

        // TODO: javascript:{{../templatePrefix}}ConstraintModeler.setMultiProperty({{../objectId}}, '{{path}}');
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
