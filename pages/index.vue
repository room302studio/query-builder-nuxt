<template>
  <section class="p-5">
    <section>
      <h2 class="text-2xl font-bold">Query builder</h2>

      <h3 class="text-lg font-semibold mt-5">Columns</h3>
      <ul class="flex flex-wrap mt-2">
        <li v-for="col in columns" :key="col.key"
          class="inline-block mr-2 mb-2 font-light bg-gray-200 text-black px-3 py-1 rounded">
          {{ col.label }}
        </li>
      </ul>
      <section class="p-5">
        <h3 class="text-lg font-semibold">Conditions</h3>
        <section class="p-5">
          <h4 class="text-md font-semibold">Add condition</h4>
          <section class="p-5">
            <label for="column" class="text-sm font-medium">Column</label>
            <USelect v-model="conditionColumn" :options="columns" class="mt-1" />
          </section>
          <section class="p-5" v-if="conditionColumn">
            <label for="type" class="text-sm font-medium">Type</label>
            <USelect v-model="conditionType" class="mt-1" :options="[
              { value: '', label: 'Select a type' },
              { value: 'equals', label: 'Equals' },
              { value: 'not-equals', label: 'Not equals' },
              { value: 'contains', label: 'Contains' },
              { value: 'not-contains', label: 'Not contains' }
            ]" />
          </section>
          <section class="p-5" v-if="conditionType">
            <label for="value" class="text-sm font-medium">Value</label>
            <USelect v-model="conditionValue" class="mt-1" :options="columnUniqueValues[conditionColumn]">
              <template #default="{ option }">
                <option :value="option">{{ option }}</option>
              </template>
            </USelect>
          </section>
          <section class="p-5" v-if="conditionColumn && conditionType">
            <UButton @click="addCondition(conditionColumn, conditionType, conditionValue)"
              class="bg-blue-500 text-white px-4 py-2 rounded">Add condition</UButton>
          </section>

          <!-- list all the conditions and let the user modify or delete them -->
          <section class="p-5 border border-gray-500" v-if="conditions.length > 0">
            <h4 class="text-md font-semibold mb-4">Active Conditions</h4>
            <ul>
              <li v-for="(condition, index) in conditions" :key="index" class="flex items-center justify-between my-8">
                <div class="flex flex-col w-3/12">
                  <span class="font-semibold break-words break">{{ condition.columnName }}</span>
                  <span :class="{
                    'text-sm text-gray-500': true,
                    'text-green-500': condition.type === 'equals',
                    'text-red-500': condition.type === 'not-equals'
                  }">
                    {{ condition.type }}
                  </span>
                </div>
                <span class="flex-grow px-4">
                  <span class="font-semibold p-4 border border-gray-500 rounded text-sm">
                    {{ condition.value }}
                  </span>
                </span>
                <UButton @click="removeCondition(index)" color="red">Remove
                </UButton>
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
