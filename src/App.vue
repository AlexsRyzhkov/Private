<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
</script>

<template>
  <Header />
  <div class="body flex-grow-1">
    <div class="container-lg px-4">
      <RouterView />

    </div>
  </div>
</template>
