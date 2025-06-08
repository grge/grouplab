import { ref, computed, toRaw } from 'vue'
import { defineStore } from 'pinia'

import { PresentationGroup } from '@/utils/core'
import type { GraphState } from '@/utils/core'


export const useGroup = defineStore('group', () => {
  const generators = ref<string[]>(["a", "b"])
  const relations = ref<string[]>(["aaa", "bbb", 'abAB'])
  const group = computed(() => {
    return new PresentationGroup({
      generators: generators.value,
      relations: relations.value
    })
  })

  function setGroup(generators: string[], relations: string[]) {
    generators.value = generators
    relations.value = relations
  }

  const subgroupGenerators = ref<string[]>([])
  const builderState = ref<GraphState | null>(null)
  const isComplete = ref(false)
  const isPaused = ref(false)
  const error = ref<string | null>(null)
  const workerState = ref<'idle' | 'running' | 'stopped'>('idle')

  const order = computed(() =>
    builderState.value ? builderState.value.outEdges.length : 0
  )

  let worker : Worker | null = null

  async function runBuilder(nodeBudget = 100) {
    stopWorker() // ensure no previous worker is running
    isComplete.value = false
    isPaused.value = false
    try {
      const rawGroup = group.value
         ? { generators: group.value.generators, relations: group.value.relations }
         : null;

      worker = new Worker(new URL('@/workers/builder.worker.ts', import.meta.url), { type: 'module' })
      worker.postMessage({
        action: 'start',
        generators: toRaw(rawGroup?.generators) || [],
        relations: toRaw(rawGroup?.relations) || [],
        subgroupGenerators: toRaw(subgroupGenerators.value),
        savedState: toRaw(builderState.value),
        nodeLimit: nodeBudget
      })
      worker.onmessage = ({ data }) => {
        console.log('Worker message:', data)
        if ('workerState' in data) {
          workerState.value = data.workerState
          return
        }
        const { state, completed, paused, err } = data
        builderState.value = state
        isComplete.value = completed
        isPaused.value = paused
        error.value = err || null
      }
    } catch (err) {
      console.log(err)
      error.value = `Worker error: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  function stopWorker() {
    if (worker) {
      worker.terminate()
      worker = null
    }
  }

  return { group, generators, relations, setGroup, isComplete, order, isPaused, builderState, error, workerState, runBuilder, stopWorker }
})
