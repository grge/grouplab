<script setup lang="ts">
import { computed } from 'vue'
import { useGroup } from '@/stores/counter'

const groupStore = useGroup()

/* ——— derived status ——— */
const status = computed(() => {
  if (groupStore.error)           return 'error'
  if (groupStore.isPaused)        return 'paused'
  if (groupStore.isComplete)      return 'done'
  if (groupStore.workerState === 'running') return 'building'
  return 'idle'
})

const statusLabel = computed(() => ({
  building : 'Building…',
  paused   : 'Paused – click to resume',
  done     : 'Done',
  error    : 'Error',
  idle     : 'Idle',
}[status.value]))

function resume() {
  if (status.value !== 'paused') return
  groupStore.runBuilder(100)
}

const groupSize = computed(() =>
  groupStore.isComplete ? groupStore.order : groupStore.order + ' ?'  // order getter in store
)
</script>


<template>
  <div class="status-bar">
    <div class="status-cell"
         :class="status"
         @click="resume">
      <span class="icon">
        <svg v-if="status==='building'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
        <svg v-else-if="status==='paused'"   viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
        <svg v-else-if="status==='done'"     viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        <svg v-else-if="status==='error'"    viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16" r="1.25"/></svg>
        <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
      </span>
      <span class="text">{{ status }}</span>
    </div>
    <div class="size-cell">
      Order: <span>{{ groupSize }}</span>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  width: 80vw;
  max-width: 70vh;
  background: #132330;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  margin-bottom: 10px;
  color: #d1d5db;
  padding: 0.5rem 0;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.size-cell span {
  color: #22d3ee; /* cyan-300 */
  font-weight: 600;
  font-size: 1.1rem;
}

/* -------- icons -------- */
.icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
}
.icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 2.2;
  fill: none;
}

/* -------- status colour themes -------- */
.status-cell.idle    { background:#374151; color:#9ca3af; }
.status-cell.building{ background:#0e7490; color:#e0f2fe; animation: pulse-bg 2s ease-in-out infinite; }
.status-cell.paused  { background:#92400e; color:#ffedd5; }
.status-cell.done    { background:#065f46; color:#d1fae5; }
.status-cell.error   { background:#991b1b; color:#fee2e2; }

/* spinning for building icon */
.status-cell.building .icon {
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@keyframes pulse-bg {
  0%,100% { filter: brightness(1); }
  50%     { filter: brightness(1.2); }
}
</style>
