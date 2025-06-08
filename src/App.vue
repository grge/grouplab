<script setup lang="ts">
import ShreierGraph from '@/components/ShreierGraph.vue'
import PresentationSelector from '@/components/PresentationSelector.vue'
import StatusBar from '@/components/StatusBar.vue'

import { RouterLink, RouterView } from 'vue-router'
import { useGroup } from '@/stores/counter'
import { PresentationGroup } from '@/utils/core'
import { watch } from 'vue'

const groupStore = useGroup()

watch(
  () => groupStore.group,
  (newGroup) => {
    if (newGroup instanceof PresentationGroup) {
      console.log("running builder for group", newGroup)
      groupStore.builderState = null
      groupStore.runBuilder()
    }
  },
  { immediate: true }
)


</script>

<template>
  <div class="page">
    <PresentationSelector />
    <StatusBar />
    <ShreierGraph />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #031320;
}
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
