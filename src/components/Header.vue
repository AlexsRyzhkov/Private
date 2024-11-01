<script setup>
import { onMounted, ref } from 'vue'
import { useStageStore } from '@/stores/stageStore';
const stageStore = useStageStore();
const headerClassNames = ref('mb-4 p-0')

onMounted(() => {
  document.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 0) {
      headerClassNames.value = 'mb-4 p-0 shadow-sm'
    } else {
      headerClassNames.value = 'mb-4 p-0'
    }
  })
})
</script>

<template>
  <header class="header header-sticky" :class="headerClassNames">
    <div class="container-fluid border-bottom px-4">
      <ul class="header-nav d-none d-lg-flex">
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('activity')">Главная</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('task')">Задачи</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('competence')">Компетенции</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('discipline')">Дисциплины</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('indicator')">Индикаторы</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('topic')">Темы</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="stageStore.setStage('lesson')">Занятия</a>
        </li>
      </ul>
    </div>
  </header>

</template>