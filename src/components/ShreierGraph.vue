<script setup lang="ts">
import { computed, ref, watch, toRaw } from 'vue'
import { useGroup } from '@/stores/counter'
import ELK from 'elkjs/lib/elk.bundled.js'

const groupStore = useGroup()

const elk = new ELK()

const pos = ref<Record<string, { x: number; y: number }>>({})

const SMALL_FINITE_LAYOUT = {
  'elk.algorithm'               : 'force',
  'elk.force.model'             : 'EADES',
  'elk.force.repulsion'         : '300',
  'elk.spacing.nodeNode'        : '4',
  'elk.force.iterations'        : '300',
  'elk.force.force.temperature' : '100',
  'elk.aspectRatio'             : '1.0',      // square bounding box (good for Cayley graphs) :contentReference[oaicite:5]{index=5}
  'elk.separateConnectedComponents' : 'false',// treat graph as one component
  'elk.randomSeed'              : '43',       // deterministic runs
  'elk.edgeRouting'             : 'SPLINES'   // slightly smoother look (optional)
}

const DEFAULT_LAYOUT = {
  'elk.algorithm'                : 'stress',
  'elk.stress.desiredEdgeLength' : 10,
}

const edges = computed(() => groupStore.builderState?.outEdges.flatMap(([src, genMap]) => {
  return Object.entries(genMap).map(([gen, target]) => ({
    id: `${src}-${gen}`,
    gen: gen,
    sources: [src],
    targets: [target]
  }))
}))
const nodes = computed(() => groupStore.builderState?.outEdges.map(([src, genMap]) => ({id:src})))

const padding = 2               // extra space around the cloud
const bbox = computed(() => {
  const pts = Object.values(pos.value)

  const id = pts[0]
  const h = 80
  const w = 80
  if (nodes.value?.length > 100) {
    return {
      x: id ? id.x - w/2 : 0,
      y: id ? id.y - h/2 : 0,
      w, h
    }
  }
  if (!pts.length) return { x: 0, y: 0, w: 100, h: 100 }   // fallback

  let minX = Infinity, minY = Infinity,
      maxX = -Infinity, maxY = -Infinity

  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  return {
    x: minX - padding,
    y: minY - padding,
    w: (maxX - minX) + 2 * padding,
    h: (maxY - minY) + 2 * padding,
  }
})

const viewBox = computed(() =>
  `${bbox.value.x} ${bbox.value.y} ${bbox.value.w} ${bbox.value.h}`
)

watch(
  () => groupStore.builderState,
  async (newState) => {
    if (newState) {
      const elkGraph = {
        id : 'root',
        layoutOptions: (groupStore.complete || nodes.value.length < 80) ? SMALL_FINITE_LAYOUT : DEFAULT_LAYOUT,
        children: nodes.value,
        edges: edges.value
      }

      const result = await elk.layout(elkGraph)
      const next: typeof pos.value = {}

      for (const c of result.children) {
        next[c.id] = { x: c.x, y: c.y }
      }
      pos.value = next
    }
  },
  { immediate: true }
)

</script>


<template>
  <svg class="shreier-graph" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
    <g v-for="edge in edges" :key="edge.id">
      <line stroke="black" :x1="pos[edge.sources[0]]?.x || 0" :y1="pos[edge.sources[0]]?.y || 0"
            :x2="pos[edge.targets[0]]?.x || 0" :y2="pos[edge.targets[0]]?.y || 0"
            :class="edge.gen"/>
    </g>
    <g v-for="node in nodes" :key="node.id">
      <circle :cx="pos[node.id]?.x || 0" :cy="pos[node.id]?.y || 0" r=0.6 fill="blue" />
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
  background: #1f2937; /* gray-800 */
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
  stroke: #d62828;
  stroke-width: 0.2;
}

svg line.b {
  stroke: #aaa;
}

svg line.c {
  stroke: #FFCAA3;
}

svg text {
    font-size: 0.1em;
    fill: white;
  }

</style>
