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
            <USelect v-model="conditionType" class="mt-1" :options="conditionTypes" />
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
import { ref, watchEffect } from 'vue'

// Props
const props = defineProps({
  dataSource: Array
})

// Computed columns and unique values from data source
const columns = ref([])
const columnUniqueValues = ref({})
const conditionTypes = ref([
  { value: '', label: 'Select a type' },
  { value: 'equals', label: 'Equals' },
  { value: 'not-equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not-contains', label: 'Not contains' }
])

watchEffect(() => {
  columns.value = computeColumns(props.dataSource)
  columnUniqueValues.value = computeColumnUniqueValues(props.dataSource)
})

// Conditions and filtered data
const conditions = ref([])
const filteredData = ref([])

watchEffect(() => {
  filteredData.value = filterDataWithConditions(props.dataSource, conditions.value)
})

const conditionColumn = ref('')
const conditionType = ref('')
const conditionValue = ref(null)

// Functions
function computeColumns(data) {
  if (!data.length) return []
  return Object.keys(data[0]).map(key => ({ key, label: key }))
}

function computeColumnUniqueValues(data) {
  const uniqueValues = {}
  columns.value.forEach(col => {
    uniqueValues[col.key] = [...new Set(data.map(row => row[col.key]))]
  })
  return uniqueValues
}

function filterDataWithConditions(data, conditions) {
  if (!conditions.length) return data
  return data.filter(row => conditions.every(condition => {
    const value = row[condition.columnName]
    switch (condition.type) {
      case 'equals': return value === condition.value
      case 'not-equals': return value !== condition.value
      case 'contains': return value.includes(condition.value)
      case 'not-contains': return !value.includes(condition.value)
      default: return true
    }
  }))
}

function addCondition(columnName, type, value) {
  conditions.value.push({ columnName, type, value })
  resetConditionValues()
}

function removeCondition(index) {
  conditions.value.splice(index, 1)
}

function resetConditionValues() {
  conditionColumn.value = ''
  conditionType.value = ''
  conditionValue.value = null
}
</script>