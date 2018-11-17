<template>
  <div id="app">
    <nav id="nav">
      <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
        <b-navbar-brand href="#">Constraint Modeler Demo</b-navbar-brand>

        <b-collapse is-nav id="nav_collapse">

          <b-navbar-nav class="nav nav-pills">
            <b-nav-item to="/" exact>Home</b-nav-item>
            <b-nav-item to="/simple">Simple</b-nav-item>
            <b-nav-item to="/debug">Debug</b-nav-item>
            <b-nav-item to="/projection">Projection</b-nav-item>
            <b-nav-item to="/persistent">Persistent</b-nav-item>
            <b-nav-item to="/everything">Everything</b-nav-item>
          </b-navbar-nav>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">

            <b-nav-item-dropdown right>
              <!-- Using button-content slot -->
              <template slot="button-content">
                <em>User</em>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item href="#">Signout</b-dropdown-item>
            </b-nav-item-dropdown>

          </b-navbar-nav>

        </b-collapse>
      </b-navbar>
    </nav>

    <div class="container-fluid">
      <router-view/>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'App',
    components: {},
    data: () => {
      return {
      };
    },
    created() {
    },
    methods: {
    }
  };
</script>

<style lang="scss">
  #app {
    /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  nav {
    a {
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }

  body {
    overflow-y: scroll;
  }

  .constraint-modeler {
    border-radius: 7px;
    font-size: 0.9em;
    padding: 10px;
    margin: 0 0 15px;
    background-color: #EEE;
    width: fit-content;
    height: fit-content;
    min-width: 400px;

    .title {
      color: #444;
      border-radius: 7px;
      background-color: #ccc;
      font-size: 1.2em;
      font-weight: bold;
      padding: 5px 0 6px;
      margin: 0 0 5px;
      text-align: center;
    }

  }
</style>
