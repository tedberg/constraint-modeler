<template>
  <b-table small bordered striped hover
           :fields="fields"
           :items="items">
  </b-table>
</template>

<script>
  export default {
    name: 'ListGrid',
    components: {},
    props: {
      objectName: {
        type: String,
        required: true
      },
      maxRowsPerPage: {
        type: Number,
        default: 100
      },
      name: {
        type: String,
        default: ''
      },
      fields: {
        type: Array,
        default: () => []
      },
      items: {
        type: Array,
        required: true,
        default: () => []
      }
    },
    data: () => {
      return {
        currentPage: 0,
      };
    },
    created() {
       console.log('items', this.items);
    },
    computed: {
      totalRows() {
        return this.items.length;
      }
    },
    methods: {
      onFiltered(filteredItems) {
        // Trigger pagination to update the number of buttons/pages due to filtering
        this.totalRows = filteredItems.length;
        this.currentPage = 1
      }
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
