<template>
  <b-nav-item-dropdown :text="propertyDisplay" extra-toggle-classes="nav-link-custom">

    <b-dropdown-item v-for="prop in propertyList" :key="prop.path" @click.prevent="setProperty(prop)">
      {{prop.displayName}} {{(typeof prop.simpleDataType === 'object') ? '&raquo;' : ''}}
      <!--<property-menu-partial :property="prop" :template-prefix="templatePrefix" :object-id="objectId"/>-->
    </b-dropdown-item>

    <div v-if="multiPropertyList" class="dropdown-divider"></div>
    <h6 v-if="multiPropertyList" class="dropdown-header">Multi Properties</h6>

    <b-dropdown-item v-for="prop in multiPropertyList" :key="prop.path" @click.prevent="setProperty(prop)">
      {{prop.displayName}} {{prop.isObjectType() ? '&raquo;' : ''}}
      <property-menu-partial :property="prop" :template-prefix="templatePrefix"/>
    </b-dropdown-item>

  </b-nav-item-dropdown>
</template>

<script>
  import PropertyMenuPartial from './PropertyMenuPartial';
  import Property  from '../../Property';

  export default {
    name: 'PropertyMenu',
    components: {PropertyMenuPartial},
    props: {
      templatePrefix: {
        type: String,
        required: true
      },
      propertyList: {
        type: Array
      },
      multiPropertyList: {
        type: Array
      },
      property: {
        type: Object,
        validator: model => {
          return model instanceof Property;
        }
      }
    },
    computed: {
      propertyDisplay() {
        return this.property ? this.property.displayName : 'Chosen Value';
      },
    },
    methods: {
      setProperty(property) {
        console.log('setProperty', property);
        this.$emit('setProperty', property);
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
