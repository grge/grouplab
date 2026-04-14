<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { useGroup } from '@/stores/group';
  import { parseGeneratorListString, parseRelationListString } from '@/groups/parser';

  const groupStore = useGroup();

  const editing = ref<'gens' | 'rels' | null>(null)
  const tempInput = ref('');

  function startEdit(which: 'gens' | 'rels') {
    editing.value = which;
    tempInput.value = which === 'gens'
      ? groupStore.generatorInput
      : groupStore.relationInput
    nextTick(() => (document.getElementById('edit-field') as HTMLInputElement)?.focus());
  }

  function commit() {
    try {
      if (editing.value === 'gens') {
        groupStore.generators = parseGeneratorListString(tempInput.value);
        groupStore.generatorInput = tempInput.value;
      } else if (editing.value === 'rels') {
        groupStore.relations = parseRelationListString(tempInput.value);
        groupStore.relationInput = tempInput.value;
      }
      editing.value = null;
    } catch (err) {
      console.error(err);
    }
  }

  function cancel() { editing.value = null; }
</script>

<template>
  <header class="presentation-bar">
    <span class="bracket">&lt;</span>
    <template v-if="editing === 'gens'">
      <input id="edit-field" type="text" class='edit-input'
             placeholder="Generators (e.g., a,b,c)"
             v-model="tempInput" @keyup.enter="commit" @keyup.esc="cancel" />
    </template>
    <template v-else>
      <span class="editable" @click="startEdit('gens')">
        {{ groupStore.generatorInput || groupStore.generators.join(', ') }}
      </span>
    </template>
    <span class="bracket">|</span>
    <template v-if="editing === 'rels'">
      <input id="edit-field" type="text" class="edit-input"
             placeholder="Relations (e.g., a^2, b^3, (ab)^5, [a,b])"
             v-model="tempInput" @keyup.enter="commit" @keyup.esc="cancel">
    </template>
    <template v-else>
      <span class="editable" @click="startEdit('rels')">
        {{ groupStore.relationInput || groupStore.relations.join(', ') }}
      </span>
    </template>
    <span class="bracket">&gt;</span>
  </header>

</template>

<style scoped>
/****** layout & typography ******/
.presentation-bar {
  color:       #e0f2fe;          /* sky-100 */
  font-family: 'Courier New', Courier, monospace;
  font-size:   2.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem auto;
  padding: 0.6rem 0.5rem;
  gap: 0.25rem;
  user-select: none;
}

.bracket {
  color: #38bdf8;               /* sky-400 */
  font-weight: 700;
  margin: 0 0.15em;
}

.divider {
  color: #7dd3fc;               /* sky-300 */
  margin: 0 0.25em;
}

/****** editable text ******/
.editable {
  display: inline-block;
  cursor: pointer;
  transition: color 0.2s ease, text-shadow 0.2s ease;
  min-height: 2rem;
  min-width: 2rem;

}
.editable:hover {
  color: #38bdf8;               /* brighten on hover */
  text-shadow: 0 0 4px rgba(56,189,248,0.8);
}

/****** edit input ******/
.edit-input {
  font-family: inherit;
  font-size:   0.9em;
  padding: 0.15em 0.3em;
  border: none;
  border-radius: 4px;
  background: #0f172a;          /* slate-900 slightly lighter */
  color: #e2e8f0;               /* slate-200 */
  min-width: 14ch;
}
.edit-input:focus {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
</style>
