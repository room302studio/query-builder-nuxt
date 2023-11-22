<template>
  <section>
    <h1>Hello world!</h1>
    {{ data }}
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
</script>

<style></style>
