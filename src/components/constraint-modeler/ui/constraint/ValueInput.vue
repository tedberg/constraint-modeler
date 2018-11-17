<script>
  import { ComparisonTypeEnum } from '../../enum/ComparisonTypeEnum';
  import { DataTypeEnum } from '../../enum/DataTypeEnum';
  import Property from '../../Property';

  // Preferences.constraintModeler.autocompleteDataMagnitudeThreshold
  const AUTOCOMPLETE_DATAMAGNITUDE_THRESHOLD = 25;

  export default {
    name: 'ValueInput',
    components: {},
    inject: ['constraintModelerResource'],
    props: {
      objectId: {
        type: Number,
        required: true
      },
      templatePrefix: {
        type: String,
        default: ''
      },
      comparisonType: {
        type: Object,
        required: true,
        validator: model => {
          return ComparisonTypeEnum.checkInstanceOf(model);
        }
      },
      property: {
        type: Object,
        required: false,
        validator: model => {
          return model instanceof Property;
        }
      },
      queryFunction: {
        type: Function
      },
      valueCustomObject: {
        type: Object
      },
      valueArray: {
        type: Array,
        required: true,
        default: () => {
          return [];
        }
      }
    },
    data: () => {
      return {
        defaultValue: null,
        defaultValue2: null,
        selectableValueList: []
      };
    },
    created () {
      this.setDefaultValues();

      if (this.useSelectField) {
        this.loadValueList().then(result => {
          // this.selectableValueList is now populated

        });
      }
    },
    render (h) {
      let params = {
        id: `${this.templatePrefix}_valueEntry-${this.objectId}`,
        name: `valueEntry-${this.objectId}`,
        inputClass: 'inputClass',
        fieldIndex: 0,
        defaultValue: this.defaultValue,
        onchange: null,
        dataAttribute: null
      };

      // TODO: Had this code also, need to remember how it is used
      // let dataAttribute = '';
      // if (this.valueCustomObject) {
      //   let customString = JSON.stringify(this.valueCustomObject);
      //   dataAttribute = ` data-customvalue='${customString}'`;
      // }

      let inputArray = [];

      if (this.numberOfObjects === 1) {
        inputArray.push(this.renderWithJSX(params));
      } else if (this.numberOfObjects === 2) {
        params.id = this.getIdAttribute(0);
        params.name = this.getNameAttribute(0);
        inputArray.push(this.renderWithJSX(params));
        inputArray.push((<span style="color: white;">AND</span>));
        params.id = this.getIdAttribute(1);
        params.name = this.getNameAttribute(1);
        params.fieldIndex = 1;
        params.defaultValue = this.defaultValue2;
        inputArray.push(this.renderWithJSX(params));
      } else {
        // Used to wrap in totalInputs += '<div class="in_clause">';
        console.log('render this.numberOfObjects', this.numberOfObjects);
        for (let i = 0; i < this.numberOfObjects; i++) {
          console.log('render Loop iteration i', i);
          let defaultValue = '';
          if (this.valueArray.length > 0) {
            defaultValue = this.valueArray[i] || '';
          }
          params.id = this.getIdAttribute(i);
          params.name = this.getNameAttribute(i);
          params.fieldIndex = i;
          params.defaultValue = defaultValue;
          inputArray.push(this.renderWithJSX(params));
        }
      }

      console.log('render inputArray', inputArray);

      return (
        <div>
          {inputArray}
        </div>
      );
    },
    computed: {
      numberOfObjects () {
        let numberOfObjects = 0;
        if (this.comparisonType) {
          numberOfObjects = this.comparisonType.expectedNumberOfObjectValues;
        } else {
          console.log('In valueInput numberOfObjects, this.comparisonType is null.');
        }
        return numberOfObjects;
      },
      dataType () {
        return this.property ? this.property.getSimpleDataTypeEnum() : null;
      },
      serverDataType () {
        return this.property ? this.property.getServerDataType() : null;
      },
      useSelectField () {
        let useSelectField = false;

        let dataType = this.dataType;
        if (this.queryFunction) { // Functions have a return type that may not match the data type.  All functions return a single value.
          // Setting value on local copy, not computed field
          dataType = this.queryFunction.getOutputDataType();
        }

        if (dataType === DataTypeEnum.ENUM || dataType === DataTypeEnum.BOOLEAN) {
          useSelectField = true;
        } else if (dataType === DataTypeEnum.OBJECT) {
          // If this property has a large magnitude of data and a human readable unique property exists for the dataset,
          // then don't use a select field.  An autocomplete widget is best here.
          useSelectField = !(typeof this.property !== 'undefined' && this.property !== null &&
            (this.property.expectedDataMagnitude > AUTOCOMPLETE_DATAMAGNITUDE_THRESHOLD && this.property.keyDisplayPropertyPath)
          );
        }
        return useSelectField;
      },
      inputClass () {
        let inputClass = '';
        if (this.dataType !== null) {
          inputClass = this.dataType.alias;
        }

        if (this.numberOfObjects > 2) {
          inputClass += ' in_clause_value';
        }
        return inputClass;
      }
    },
    methods: {
      debug () {
        console.log('debug', this.valueArray);
        console.log('debug', this.defaultValue, this.defaultValue2);
      },
      // TODO: Methods are from Constraint -> have to pass in needed variables
      updateValueArray () {
        console.log('updateValueArray', this.valueArray);
        this.$emit('updateValueArray', this.valueArray);
      },
      // TODO: Good design to have call here or emit need, have parent run this and change bound values?
      loadValueList () {
        console.log('loadValueList', this.serverDataType);
        if (this.serverDataType === 'boolean') {
          this.selectableValueList = [
            { identifyingValue: 'true', displayValue: 'True' }, { identifyingValue: 'false', displayValue: 'False' }
          ];
          return Promise.resolve();
        } else {
          return this.constraintModelerResource
            .loadValueList(this.serverDataType)
            .then(response => { this.selectableValueList = response.data; });
          // Axios gives result.data, which is Spring response with has meta and another data object with our values.
        }

      },
      setDefaultValues () {
        this.defaultValue = '';
        this.defaultValue2 = '';

        if (this.valueArray.length > 0) {
          if (this.defaultValue === '') {
            this.defaultValue = this.valueArray[0];
          }
          if (this.defaultValue2 === '') {
            this.defaultValue2 = this.valueArray[1];
          }
        } else {
          if (this.numberOfObjects === 2) {
            // TODO: Not allowed, have to emit to top if this is needed
            // this.valueArray = [this.defaultValue, this.defaultValue2];
          } else if (this.numberOfObjects > 2) {
            // this.valueArray = [this.defaultValue];
          }
        }
      },
      getIdAttribute (fieldIndex) {
        if (fieldIndex === null) {
          return `${this.templatePrefix}_valueEntry-${this.objectId}`;
        } else {
          return `${this.templatePrefix}_valueEntry-${fieldIndex}-${this.objectId}`;
        }
      },
      getNameAttribute (fieldIndex) {
        if (fieldIndex === null) {
          return `valueEntry-${this.objectId}`;
        } else {
          return `valueEntry-${fieldIndex}-${this.objectId}`;
        }
      },
      renderWithJSX (params) {
        if (this.useSelectField) {
          return this.renderSelectWithJSX(params);
        } else {
          return this.renderInputWithJSX(params);
        }
      },
      renderInputWithJSX ({ id, name, defaultValue, fieldIndex, onchange, dataAttribute }) {
        //       dataAttribute = ` data-customvalue='${customString}'`;

        // this.dataType values:
        // this.STRING = new DataType('STRING', 'String', 'string');                    text
        // this.NUMBER = new DataType('NUMBER', 'Number', 'number');                    number
        // this.BOOLEAN = new DataType('BOOLEAN', 'Boolean', 'boolean');                checkbox
        // this.DATE = new DataType('DATE', 'Date', 'date');                            date
        // this.ENUM = new DataType('ENUM', 'Enum', 'enum');
        // this.URL = new DataType('URL', 'Url', 'url');                                url
        // this.OBJECT = new DataType('OBJECT', 'Object', 'object');
        // this.LOB = new DataType('LOB', 'Lob', 'lob');
        // this.COLLECTION = new DataType('COLLECTION', 'Collection', 'collection');

        // Vue cannot handle dynamic type properties for input as v-model includes logic based on the type.
        if (this.dataType !== null) {
          switch (this.dataType.alias) {
            case DataTypeEnum.NUMBER.alias:
              return (
                <input type="number"
                       id={id} name={name} class={this.inputClass}
                       v-model={this.valueArray[fieldIndex]}
                       onInput={this.updateValueArray}>
                </input>
              );
            case DataTypeEnum.DATE.alias:
              return (
                <input type="date"
                       id={id} name={name} class={this.inputClass}
                       v-model={this.valueArray[fieldIndex]}
                       onInput={this.updateValueArray}>
                </input>
              );
            case DataTypeEnum.URL.alias:
              return (
                <input type="url"
                       id={id} name={name} class={this.inputClass}
                       v-model={this.valueArray[fieldIndex]}
                       onInput={this.updateValueArray}>
                </input>
              );
          }
        }

        return (
          <input type="text"
                 id={id} name={name} class={this.inputClass}
                 v-model={this.valueArray[fieldIndex]}
                 onInput={this.updateValueArray}>
          </input>
        );
      },
      renderSelectWithJSX ({ id, name, fieldIndex, onchange, dataAttribute }) {
        //       dataAttribute = ` data-customvalue='${customString}'`;

        // TODO: className or class?
        return (
          <select size="1"
                  class={this.inputClass}
                  id={id}
                  name={name}
                  onChange={onchange}
                  v-model={this.valueArray[fieldIndex]}
                  onInput={this.updateValueArray}>
            {this.renderSelectOptionsWithJSX()}
          </select>
        );
      },
      findChoiceIdFromChoice (choice) {
        let choiceId;
        if (choice.identifyingValue !== undefined) {
          choiceId = choice.identifyingValue;  // string
        } else if (choice.id !== undefined) {
          if (choice.id !== null) {
            choiceId = choice.id.toString();  // json id is a number, other sources such as defaultValue are string.
          } else {
            choiceId = null;
          }
        } else {
          choiceId = choice;
        }

        return choiceId;
      },
      findChoiceLabelFromChoice (choice) {
        let choiceLabel;
        if (choice.displayValue !== undefined) {
          choiceLabel = choice.displayValue;
        } else if (choice.name !== undefined) {
          choiceLabel = choice.name;
        } else {
          choiceLabel = choice;
        }

        return choiceLabel;
      },
      renderSelectOptionsWithJSX () {
        console.log('this.selectableValueList', this.selectableValueList);

        // TODO: When choosing alert comparison, server response has asset object nested one level deeper than expected.

        const listItems = this.selectableValueList.map(choice => {
          // choice is an object with identifyingValue and displayValue properties.

          let selected = false;
          let choiceId = this.findChoiceIdFromChoice(choice);
          let choiceLabel = this.findChoiceLabelFromChoice(choice);
          if (String(choiceId) === String(this.defaultValue)) {
            selected = true;
          }

          console.log('choice', choice);
          console.log('choiceId', choiceId);
          console.log('choiceLabel', choiceLabel);

          if (selected) {
            return (
              <option value={choiceId} selected="selected">{choiceLabel}</option>
            );
          } else {
            return (
              <option value={choiceId}>{choiceLabel}</option>
            );
          }
        });

        listItems.unshift(
          (
            <option value=""></option>
          )
        );

        console.log('renderSelectOptionsWithJSX', listItems);
        return listItems;
      }
    },
    watch: {
      // whenever serverDataType changes, this function will run
      // watch this not property, as user can change between properties having the same type.
      serverDataType: function (newServerDataType, oldServerDataType) {
        console.log('ValueInput serverDataType changed', this.serverDataType);

        this.setDefaultValues();

        if (this.useSelectField) {
          this.loadValueList().then(result => {
            // this.selectableValueList is now populated

          });
        } else {

        }

      }
    }
  };
</script>

<style scoped lang="scss">
  input {
    width: 250px;
  }

  input.number {
    width: 125px;
  }

  input.date {
    width: 100px;
  }

  div.in_clause {
    width: 515px;
    margin-bottom: 5px;
  }

  input.in_clause_value {
    width: 96px;
  }

  input.in_clause_value.date {
    width: 80px;
  }
</style>
