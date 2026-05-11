<template>
  <div class="constraint-modeler">

    <div v-if="title">
      <div class="title">{{title}}</div>
    </div>

    <div v-if="componentReady">  <!-- else loading animation? -->

      <constraint-group :constraint-group-model="rootConstraintGroup"
                        :templatePrefix="templatePrefix"
                        :propertyList="propertyList"
                        :multiPropertyList="multiPropertyList"
                        :pathToPropertyMap="pathToPropertyMap"/>

      <projection-group v-if="exposeProjectionModeler"
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
                 :model-value="syntaxDisplay !== ''"
                 @closed="syntaxDisplay=''">
          <span class="syntaxDisplay">{{syntaxDisplay}}</span>
        </b-alert>

        <b-alert variant="success" dismissible
                 :model-value="successDisplay !== ''"
                 @closed="successDisplay=''">
          {{successDisplay}}
        </b-alert>

        <b-alert variant="danger" dismissible
                 :model-value="errorDisplay !== ''"
                 @closed="errorDisplay=''">
          {{errorDisplay}}
        </b-alert>
      </div>

      <div class="buttons">
        <button class="btn btn-dark btn-sm mt-2 me-2" type="button" @click.prevent="validateAndApply()">Apply</button>
        <button class="btn btn-dark btn-sm mt-2 me-2" type="button" @click.prevent="renderSyntax()">Render Syntax</button>
        <button class="btn btn-dark btn-sm mt-2 me-2" type="button" v-if="isSaveSupported" @click.prevent="save()">Save</button>
      </div>

    </div>

  </div>
</template>

<script>
  import mitt from 'mitt';
  import ConstraintGroup from './constraint/ConstraintGroup.vue';
  import ProjectionGroup from './projection/ProjectionGroup.vue';
  import Model from '../model/Model';
  import ConstraintModelerResource from '../ConstraintModelerResource';
  import AbstractConstraintModelerResource from '../AbstractConstraintModelerResource';

  export default {
    name: 'ConstraintModeler',
    components: { ProjectionGroup, ConstraintGroup },
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
          return AbstractConstraintModelerResource.isValidImplementation(model);
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

        emitter: mitt(),

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

      // From constraint groups

      this.emitter.on('apply', () => {
        this.validateAndApply();
      });

      this.emitter.on('setJunction', ([constraintGroupModel, junctionEnum]) => {
        constraintGroupModel.setJunction(junctionEnum);
      });

      this.emitter.on('addConstraint', (constraintGroupModel) => {
        constraintGroupModel.addConstraint();
      });

      this.emitter.on('addConstraintGroup', (constraintGroupModel) => {
        constraintGroupModel.addConstraintGroup();
      });

      this.emitter.on('removeConstraintGroup', (constraintGroupModel) => {
        this.rootConstraintGroup.removeConstraintGroupRecursively(constraintGroupModel.getObjectId());
      });

      // From constraints

      this.emitter.on('setQueryFunctionEnum', ([constraintModel, enumKey]) => {
        constraintModel.setQueryFunction(enumKey);
      });

      this.emitter.on('setProperty', ([constraintModel, property]) => {
        constraintModel.setProperty(property);
      });

      this.emitter.on('setComparator', ([constraintModel, comparisonType]) => {
        constraintModel.setComparisonType(comparisonType);
      });

      this.emitter.on('updateValueArray', ([constraintModel, valueArray]) => {
        constraintModel.setValueArray(valueArray);
      });

      this.emitter.on('removeConstraint', ([constraintGroupModel, constraintModel]) => {
        constraintGroupModel.removeConstraint(constraintModel.getObjectId());
      });

      // From projections

      this.emitter.on('setProjectionQueryFunctionEnum', ([projectionModel, enumKey]) => {
        projectionModel.setQueryFunction(enumKey);
      });

      this.emitter.on('setProjectionProperty', ([projectionModel, property]) => {
        projectionModel.setProperty(property);
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
        const projectionGroup = this.model.getProjectionGroup();
        projectionGroup.addProjection();
      },
      removeProjection (projection, index) {
        const projectionGroup = this.model.getProjectionGroup();
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

  :deep(div.nest) {
    margin-left: 25px;
  }

  div.constraint-modeler {

    :deep(.navbar .btn),
    :deep(.navbar .btn-group .btn) {
      padding: 1px 4px;
    }

    :deep(.nav-link) {
      padding-top: 0;
      padding-bottom: 0;
    }

    :deep(div.navbar) {
      border-radius: 7px;
    }

    :deep(input[type='text']) {
      width: 100px;
    }

    :deep(.buttons) {
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
