<template>
  <div class="constraint-modeler">

    <div v-if="title">
      <div class="title">{{title}}</div>
    </div>

    <div v-if="componentReady">  <!-- else loading animation? -->

      <constraint-group-component :constraint-group-model="rootConstraintGroup"
                                  :templatePrefix="templatePrefix"
                                  :propertyList="propertyList"
                                  :multiPropertyList="multiPropertyList"
                                  :pathToPropertyMap="pathToPropertyMap"/>

      <projection-group-component v-if="exposeProjectionModeler"
                                  :projection-group-model="model.getProjectionGroup()"
                                  :templatePrefix="templatePrefix"
                                  :propertyList="propertyList"
                                  :multiPropertyList="multiPropertyList"
                                  :pathToPropertyMap="pathToPropertyMap"
                                  v-on:addProjection="addProjection"
                                  v-on:removeProjection="removeProjection"/>

      <div v-if="showDebug" style="width: 250px;" class="debug-panel">
        <div class="header" id="toggle-constraintModelerDebug">Debug Options</div>
        <ul class="constraintModelerDebug">
          <li><a @click.prevent="renderQueryString()">Render Query String</a></li>
          <li><a @click.prevent="renderSimpleJSON()">Render JSON</a></li>
          <li><a @click.prevent="renderFlattenedObjectList()">Render Flattened Object List</a></li>
          <li><a @click.prevent="renderStructuredObjectList()">Render Structured Object List</a></li>
        </ul>
      </div>

      <div class="alerts">
        <b-alert variant="dark" dismissible
                 :show="syntaxDisplay !== ''"
                 @dismissed="syntaxDisplay=''">
          <span class="syntaxDisplay">{{syntaxDisplay}}</span>
        </b-alert>

        <b-alert variant="success" dismissible
                 :show="successDisplay !== ''"
                 @dismissed="successDisplay=''">
          {{successDisplay}}
        </b-alert>

        <b-alert variant="danger" dismissible
                 :show="errorDisplay !== ''"
                 @dismissed="errorDisplay=''">
          {{errorDisplay}}
        </b-alert>
      </div>

      <div class="buttons">
        <button class="btn btn-dark btn-sm mt-2 mr-2" type="button" @click.prevent="validateAndApply()">Apply</button>
        <button class="btn btn-dark btn-sm mt-2 mr-2" type="button" @click.prevent="renderSyntax()">Render Syntax</button>
        <button class="btn btn-dark btn-sm mt-2 mr-2" type="button" v-if="isSaveSupported" @click.prevent="save()">Save</button>
      </div>

    </div>

  </div>
</template>

<script>
  import ConstraintGroupComponent from './constraint/ConstraintGroupComponent';
  import ProjectionGroupComponent from './projection/ProjectionGroupComponent';
  import Model from '../model/Model';
  import ConstraintModelerResource from '../ConstraintModelerResource';
  import AbstractConstraintModelerResource from '../AbstractConstraintModelerResource';

  export default {
    name: 'ConstraintModelerComponent',
    components: { ProjectionGroupComponent, ConstraintGroupComponent },
    props: {
      title: {
        type: String,
        default: null
      },
      objectName: {
        type: String,
        required: true
      },
      showDebug: {
        type: Boolean,
        default: false
      },
      exposeProjectionModeler: {
        type: Boolean,
        default: false
      },
      initialModelJsonObject: {
        type: Object,
        default: () => {
          return null;
        }
      },
      constraintModelerResource: {
        type: Object,
        default: () => {
          return new ConstraintModelerResource();
        },
        validator: model => {
          return model instanceof AbstractConstraintModelerResource;
        }
      },
      saveFunction: {
        type: Function,
        default: null
      }
    },
    provide: function () {
      return {
        modelListener: this,
        constraintModelerResource: this.constraintModelerResource
      };
    },
    data: function () {
      return {
        componentReady: false,

        model: new Model(this.objectName, this.constraintModelerResource),

        syntaxDisplay: '',
        successDisplay: '',
        errorDisplay: '',

        templatePrefix: 'test',
        objectId: 'objId'
      };
    },
    created () {
      this.model.loadProperties().then(() => {
        this.model.buildModelFromJson(this.initialModelJsonObject);

        if (this.exposeProjectionModeler) {
          this.model.addProjectionGroup();
        }

        console.log('Finished Model...', this.model);
        this.componentReady = true;
      });
    },
    mounted () {
      // Setup data mutation listeners
      // TODO: Ok to change this reference to my data directly here?

      // From constraint groups

      this.$on('apply', function () {
        this.validateAndApply();
      });

      this.$on('setJunction', function (constraintGroupModel, junctionEnum) {
        console.log('setJunction called', constraintGroupModel, junctionEnum);
        constraintGroupModel.setJunction(junctionEnum);
      });

      this.$on('addConstraint', function (constraintGroupModel) {
        console.log('addConstraint called', constraintGroupModel);
        constraintGroupModel.addConstraint();
      });

      this.$on('addConstraintGroup', function (constraintGroupModel) {
        console.log('addConstraintGroup called', constraintGroupModel);
        constraintGroupModel.addConstraintGroup();
      });

      this.$on('removeConstraintGroup', function (constraintGroupModel) {
        console.log('removeConstraintGroup called', constraintGroupModel);
        this.rootConstraintGroup.removeConstraintGroupRecursively(constraintGroupModel.getObjectId());
      });

      // From constraints

      this.$on('setQueryFunctionEnum', function (constraintModel, enumKey) {
        console.log('setQueryFunctionEnum called', constraintModel, enumKey);
        constraintModel.setQueryFunction(enumKey);
      });

      this.$on('setProperty', function (constraintModel, property) {
        console.log('setProperty called', constraintModel, property);
        constraintModel.setProperty(property);

        console.log('after setProperty called', constraintModel);
      });

      this.$on('setComparator', function (constraintModel, comparisonType) {
        console.log('setComparator called', constraintModel, comparisonType);
        constraintModel.setComparisonType(comparisonType);
      });

      this.$on('updateValueArray', function (constraintModel, valueArray) {
        console.log('updateValueArray called', constraintModel, valueArray);
        constraintModel.setValueArray(valueArray);
      });

      this.$on('removeConstraint', function (constraintGroupModel, constraintModel) {
        console.log('removeConstraint called', constraintModel);
        constraintGroupModel.removeConstraint(constraintModel.getObjectId());
      });

      // From projections

      this.$on('setProjectionQueryFunctionEnum', function (projectionModel, enumKey) {
        console.log('setProjectionQueryFunctionEnum called', projectionModel, enumKey);
        projectionModel.setQueryFunction(enumKey);
      });

      this.$on('setProjectionProperty', function (projectionModel, property) {
        console.log('setProjectionProperty called', projectionModel, property);
        projectionModel.setProperty(property);

        console.log('after setProperty called', projectionModel);
      });

    },
    computed: {
      rootConstraintGroup () {
        return this.model.getRootConstraintGroup();
      },
      propertyList () {
        return this.model.getPropertyList();
      },
      multiPropertyList () {
        return this.model.getMultiPropertyList();
      },
      pathToPropertyMap () {
        return this.model.getPathToPropertyMap();
      },
      isSaveSupported () {
        return typeof this.saveFunction === 'function';
      }
    },
    methods: {
      validateAndApply () {
        console.log('validateAndApply');
        return this.model.validate().then(result => {
          console.log('validate finished', result);
          if (result.success) {
            return this.model.apply().then(result => {
              console.log('apply finished', result);
              this.$emit('applyConstraintsToData', result);
            });
          } else {
            console.warn('Result from validate did not indicate success.');
          }
        });
      },
      addProjection () {
        let projectionGroup = this.model.getProjectionGroup();
        projectionGroup.addProjection();
      },
      removeProjection (projection, index) {
        let projectionGroup = this.model.getProjectionGroup();
        projectionGroup.removeProjection(projection.getObjectId());
      },
      save () {
        if (this.isSaveSupported) {
          return this.model.validate().then(result => {
            if (result.success) {
              return this.saveFunction(this.model, true).then(result => {
                this.successDisplay = 'This constraint model was saved.';
              });
            } else {
              this.errorDisplay = 'This filter has failed validation.';
            }
          });
        } else {
          this.errorDisplay = 'Save functionality is not supported.';
        }
      },
      renderSyntax () {
        this.syntaxDisplay = this.model.renderSyntax();
        return this.syntaxDisplay;
      },
      // Debugging methods
      renderQueryString () {
        this.syntaxDisplay = this.model.renderQueryString();
        return this.syntaxDisplay;
      },
      renderSimpleJSON () {
        this.syntaxDisplay = this.model.renderSimpleJSON();
        return this.syntaxDisplay;
      },
      renderFlattenedObjectList () {
        this.syntaxDisplay = this.model.renderFlattenedObjectList();
        return this.syntaxDisplay;
      },
      renderStructuredObjectList () {
        this.syntaxDisplay = this.model.renderStructuredObjectList();
        return this.syntaxDisplay;
      }
    }
  };
</script>

<style scoped lang="scss">

  /deep/ div.nest {
    margin-left: 25px;
  }

  div.constraint-modeler {

    /deep/ .navbar .btn,
    /deep/ .navbar .btn-group .btn {
      padding: 1px 4px;
    }

    /deep/ .nav-link {
      padding-top: 0;
      padding-bottom: 0;
    }

    /deep/ div.navbar {
      border-radius: 7px;
    }

    /deep/ input[type='text'] {
      width: 100px;
    }

    /deep/ .buttons {
      text-align: center;
    }

  }

  ul.constraintModelerDebug {
    a {
      text-decoration: #0000cc;
      text-decoration-line: underline;
      cursor: pointer;
    }
  }

</style>
