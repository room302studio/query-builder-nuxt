<template>
  <section class="p-5">
    <QueryBuilder :dataSource="data" />
  </section>
</template>

<script setup>
// fetch our data from /apu/data
const { data } = await $fetch('/api/data')
</script>

<style></style>
