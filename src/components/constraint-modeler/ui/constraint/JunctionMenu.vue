<template>
  <b-nav-item-dropdown :text="junction.label" extra-toggle-classes="nav-link-custom">
    <b-dropdown-item v-for="item in typesArray" :key="item.key" @click.prevent="setJunction(item.key)">{{item.label}}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
  import { JunctionEnum } from '../../enum/JunctionEnum';

  export default {
    name: 'JunctionMenu',
    props: {
      junction: {
        type: Object,
        required: true,
        validator: model => {
          return JunctionEnum.checkInstanceOf(model);
        }
      }
    },
    data: () => {
      return {
        typesArray: JunctionEnum.enumToValueList()
      };
    },
    computed: {},
    methods: {
      setJunction (enumKey) {
        console.log('setJunction', enumKey);
        this.$emit('setJunction', JunctionEnum.getType(enumKey));
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
