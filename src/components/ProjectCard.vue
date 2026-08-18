<script setup>
import { ref } from 'vue'
import { projectStatuses } from '../constants/projectStatuses'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

const isDragging = ref(false)

const emit = defineEmits(['edit', 'delete', 'duplicate', 'status-change', 'drag-start'])

function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL')
}
</script>

<template>
  <article
    class="project-card"
    :class="{ dragging: isDragging }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <h2>{{ project.name }}</h2>

    <p v-if="project.createdAt" class="project-date">
      Utworzono: {{ formatDate(project.createdAt) }}
    </p>

    <p v-if="project.updatedAt" class="project-date">
      Edytowano: {{ formatDate(project.updatedAt) }}
    </p>

    <p
      class="project-status"
      :class="{
        'status-todo': project.status === 'Do zrobienia',
        'status-progress': project.status === 'W trakcie',
        'status-done': project.status === 'Gotowe',
      }"
    >
      {{ project.status }}
    </p>

    <select
      class="status-select"
      :value="project.status"
      @change="$emit('status-change', project.id, $event.target.value)"
    >
      <option v-for="status in projectStatuses" :key="status" :value="status">
        {{ status }}
      </option>
    </select>

    <p>{{ project.description }}</p>

    <div class="project-actions">
      <button class="edit-button" @click="$emit('edit', project)">Edytuj</button>

      <button class="duplicate-button" @click="$emit('duplicate', project)">Duplikuj</button>

      <button class="delete-button" @click="$emit('delete', project.id)">Usuń</button>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  position: relative;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgb(17 24 39 / 5%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.project-card.dragging {
  opacity: 0.45;
  transform: scale(0.98);
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgb(17 24 39 / 10%);
}

.project-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
  color: var(--text);
}

.project-card p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: var(--text-muted);
}

.project-status {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 16px;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
}

.status-todo {
  background: #f3f4f6;
  color: #4b5563;
}

.status-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-done {
  background: #dcfce7;
  color: #166534;
}

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.project-actions button {
  margin-top: 0;
  border: 0;
  border-radius: 10px;
  padding: 9px 13px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.edit-button {
  background: #eef2ff;
  color: #4338ca;
}

.edit-button:hover {
  background: #e0e7ff;
}

.delete-button {
  background: #fee2e2;
  color: #b91c1c;
}

.delete-button:hover {
  background: #fecaca;
}

.duplicate-button {
  background: #f3f4f6;
  color: #4b5563;
}

.duplicate-button:hover {
  background: #e5e7eb;
}

.project-date {
  margin: -4px 0 14px;
  font-size: 13px;
  color: #9ca3af;
}

.status-select {
  display: block;
  width: 100%;
  margin-bottom: 16px;
  padding: 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #374151;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
@media (hover: hover) and (pointer: fine) {
  .project-card {
    cursor: grab;
  }

  .project-card:active {
    cursor: grabbing;
  }
}
</style>
