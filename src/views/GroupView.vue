<script setup lang="ts">
import SchreierGraph from '@/components/SchreierGraph.vue'
import PresentationSelector from '@/components/PresentationSelector.vue'
import StatusBar from '@/components/StatusBar.vue'

import { useGroup } from '@/stores/group'
import { PresentationGroup } from '@/groups/presentation'
import { encodePres, decodePres } from '@/utils/share'
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const store = useGroup()
const router = useRouter()
const route = useRoute()

function applyUrlPres(urlPres: string) {
  const pj = decodePres(urlPres)
  if (pj) {
    store.generators = pj.g
    store.relations = pj.r
  }
}

watch(
  () => store.group,
  (newGroup) => {
    if (newGroup instanceof PresentationGroup) {
      console.log('running builder for group', newGroup)
      store.builderState = null
      store.runBuilder()
    }
  },
  { immediate: true },
)

watch(
  () => route.params.pres,
  (pres) => {
    if (typeof pres === 'string') {
      applyUrlPres(pres)
    }
  },
  { immediate: true },
)

watch(
  () => [store.generators, store.relations],
  () => {
    const pres = encodePres({ g: store.generators, r: store.relations })
    router.replace({ name: 'group', params: { pres } })
  },
  { deep: true },
)
</script>

<template>
  <div class="page">
    <PresentationSelector />
    <StatusBar />
    <SchreierGraph />
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
