<template>
  <section class="p-5">
    <section>
      <h2>Query builder</h2>

      <h3>Columns</h3>
      <ul>
        <li v-for="col in columns" :key="col.key">
          {{ col.label }}
        </li>
      </ul>

      <!-- based on /**
 * Add a condition to the query builder
 * @param {string} columnName - the name of the column
 * @param {string} type - the type of condition
 * @param {string} value - the value to compare
 */
function addCondition(columnName, type, value) {
  conditions.value.push({ columnName, type, value })
}

function removeCondition(index) {
  conditions.value.splice(index, 1)
}

function modifyCondition(index, columnName, type, value) {
  conditions.value[index] = { columnName, type, value }
}

build the interface for a query builder that allows adding unlimited stacked conditions -->
      <section class="p-5">
        <h3>Conditions</h3>
        <section class="p-5">
          <h4>Add condition</h4>
          <section class="p-5">
            <label for="column">Column</label>
            <select name="column" id="column" v-model="conditionColumn">
              <option value="">Select a column</option>
              <option v-for="col in columns" :key="col.key" :value="col.key">
                {{ col.label }}
              </option>
            </select>
          </section>
          <section class="p-5" v-if="conditionColumn">
            <label for="type">Type</label>
            <select name="type" id="type" v-model="conditionType">
              <option value="">Select a type</option>
              <option value="equals">Equals</option>
              <option value="not-equals">Not equals</option>
              <option value="contains">Contains</option>
              <option value="not-contains">Not contains</option>
              <!-- <option value="greater-than">Greater than</option>
              <option value="less-than">Less than</option> -->
            </select>
          </section>
          <section class="p-5" v-if="conditionType">
            <label for="value">Value</label>
            <!-- <input type="text" name="value" id="value" /> -->
            <select name="value" id="value" v-model="conditionValue">
              <option value="">Select a value</option>
              <option v-for="value in columnUniqueValues[conditionColumn]" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </section>
          <section class="p-5" v-if="conditionColumn && conditionType">
            <button @click="addCondition(conditionColumn, conditionType, conditionValue)">Add condition</button>
          </section>

          <!-- list all the conditions and let the user modify or delete them -->
          <section class="p-5 border border-gray-500" v-if="conditions.length > 0">
            <h4>Active Conditions</h4>
            <ul>
              <li v-for="(condition, index) in conditions" :key="index">
                {{ condition.columnName }} {{ condition.type }} {{ condition.value }}
                <button @click="removeCondition(index)">Remove</button>
              </li>
            </ul>
          </section>
        </section>
      </section>

    </section>
    <section class="p-10">
      <UTable :rows="filteredData" :columns="columns" />
    </section>

  </section>
</template>

<script setup>
/*
// Use the global state in this component
const store = useAppStore()
// Access the state variables and functions
const { activeItem, itemList, setActiveItem, addItem, removeItem } = store
*/

// fetch our data from /apu/data
const { data } = await $fetch('/api/data')

const columns = ref([])

const columnUniqueValues = ref({})

// when data changes, we need to compute columns based on the data
// we will also need to modify the columns based on the column type
// columns are objects with a 'key' and a 'label'
// the key is the name of the column in the data
// the label is the name of the column in the table

function computeColumns(data) {
  // get the keys from the first row
  const keys = Object.keys(data[0])
  // create an array of objects with the key and label
  const cols = keys.map((key) => {
    return { key, label: key }
  })
  // return the columns
  return cols
}

// watch the data for changes
watchEffect(() => {
  // compute the columns
  columns.value = computeColumns(data)
})

// compute the unique values for each column
function computeColumnUniqueValues(data) {
  // create an object to hold the unique values
  const uniqueValues = {}
  // loop through the columns
  for (const col of columns.value) {
    // get the unique values for the column
    const values = data.map((row) => row[col.key])
    // get the unique values
    const unique = [...new Set(values)]
    // add the unique values to the object
    uniqueValues[col.key] = unique
  }
  // return the unique values
  return uniqueValues
}

watchEffect(() => {
  columnUniqueValues.value = computeColumnUniqueValues(data)
})


// for the query builder, the user will be able to build up one or many conditions
// conditions and be inclusive or exclusive and stacked with AND or OR
// conditions will be based on the columns
const conditions = ref([])

// this will be the data that is filtered based on the conditions
const filteredData = ref([])

function filterDataWithConditions(data) {
  // if there are no conditions, return the data
  if (conditions.value.length === 0) return data

  // otherwise, filter the data
  return data.filter((row) => {
    // loop through the conditions
    for (const condition of conditions.value) {
      // get the value from the row
      const value = row[condition.columnName]
      // console.log(value)
      // compare the value to the condition
      switch (condition.type) {
        case 'equals':
          if (value !== condition.value) return false
          break
        case 'not-equals':
          if (value === condition.value) return false
          break
        case 'contains':
          if (!value.includes(condition.value)) return false
          break
        case 'not-contains':
          if (value.includes(condition.value)) return false
          break
        case 'greater-than':
          if (value <= condition.value) return false
          break
        case 'less-than':
          if (value >= condition.value) return false
          break
        default:
          break
      }
    }
    // if we get here, all conditions passed
    return true
  })
}

// when the data OR the filters change, we need to filter the data
watch([data, conditions], () => {
  console.log('filtering data')
  filteredData.value = filterDataWithConditions(data)
}, { immediate: true, deep: true })

const conditionColumn = ref('') // when making a ref, you need to give it a default value
const conditionTypeDefault = 'equals'
const conditionType = ref(conditionTypeDefault)
const conditionValue = ref(null)

/**
 * Add a condition to the query builder
 * @param {string} columnName - the name of the column
 * @param {string} type - the type of condition
 * @param {string} value - the value to compare
 */
function addCondition(columnName, type, value) {
  conditions.value.push({ columnName, type, value })
  // reset the condition values
  resetConditionValues()

}

function removeCondition(index) {
  conditions.value.splice(index, 1)
}

function modifyCondition(index, columnName, type, value) {
  conditions.value[index] = { columnName, type, value }
}

function resetConditionValues() {
  conditionColumn.value = ''
  conditionType.value = conditionTypeDefault
  conditionValue.value = null
}

</script>

<style></style>
