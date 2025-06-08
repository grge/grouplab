<script setup lang="ts">
/*
  Incremental force‑layout visualiser using ngraph.forcelayout.
  ───────────────────────────────────────────────────────────
  • Layout runs in Web‑Worker `layout.worker.ts` to keep UI fluid.
  • Existing positions are reused when nodes are added.
  • Worker emits coordinates every N steps (default 1) – creates a
    smooth animation.
  • Smart params: more gravity & higher dims when graph is small;
    cooled / lighter when graph grows.
*/

import { ref, watch, computed } from 'vue'
import { useGroup }            from '@/stores/counter'

const store = useGroup()
const pos   = ref<Record<string, { x: number; y: number }>>({})

let layoutWorker : Worker | null = spawnWorker()

function spawnWorker() {
  const worker = new Worker(new URL('@/workers/layout.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data }) => {
    pos.value = data.positions
  }
  return worker
}

const signature = () => JSON.stringify({ gens: store.generators, rels: store.relations })
let lastSig = signature()

watch(() => store.builderState, (state) => {
  if (!state) return

  const sig = signature()
  if (sig !== lastSig) {
    lastSig = sig
    layoutWorker?.terminate()
    layoutWorker = spawnWorker()
  }

  // build lightweight clone‑safe arrays
  const nodes = state.outEdges.map(([id]) => ({ id }))
  const links = state.outEdges.flatMap(([src, bases]) =>
    Object.values(bases).map(tgt => ({ source: src, target: tgt }))
  )

  layoutWorker.postMessage({
    nodes,
    links,
    complete : store.isComplete,
    stepsPerFrame: 10,
  })
}, { immediate: true })

/* ───── reactive helpers for viewBox ───── */
const padding = 2
const bbox = computed(() => {
  const pts = Object.values(pos.value)

  if (!store.isComplete) {
    const id = pts[0]
    const dim = pts.length/4
    return {
      x: id?.x - dim/2,
      y: id?.y - dim/2,
      h: dim,
      w: dim,

    }
  }
  if (!pts.length) return { x: 0, y: 0, w: 100, h: 100 }
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return {
    x: minX - padding,
    y: minY - padding,
    w: maxX - minX + padding*2,
    h: maxY - minY + padding*2,
  }
})
const viewBox = computed(() => `${bbox.value.x} ${bbox.value.y} ${bbox.value.w} ${bbox.value.h}`)

const edges = computed(() => store.builderState?.outEdges.flatMap(([src,map]) =>
  Object.keys(map).map((gen) => ({ id:`${src}->${gen}`, src, tgt:map[gen], gen:gen }))
))
const nodes = computed(() => store.builderState?.outEdges.map(([id]) => ({ id })))
</script>

<template>
  <svg class="shreier-graph" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
    <g v-for="edge in edges" :key="edge.id">
      <line :x1="pos[edge.src]?.x || 0" :y1="pos[edge.src]?.y || 0"
            :x2="pos[edge.tgt]?.x || 0" :y2="pos[edge.tgt]?.y || 0"
            :class="edge.gen"/>
    </g>
    <g v-for="node in nodes" :key="node.id">
      <circle :cx="pos[node.id]?.x || 0" :cy="pos[node.id]?.y || 0" r="0.6" />
    </g>
  </svg>
</template>

<style scoped>
svg.shreier-graph {
  width: 80vw;
  height: 80vw;
  max-height: 70vh;
  max-width: 70vh;
  display: block;
  border: 1px solid #444;
  background: #1f2937;
  border-radius: 0.5em;
}
svg circle {
  fill: #1982c4;
  stroke: white;
  stroke-width: 0.05;
}
svg line {
  stroke: white;
  stroke-width: 0.1;
}

svg line.a {
  stroke: red;
}
</style>
