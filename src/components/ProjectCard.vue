<script setup>
import { ref } from 'vue'
import { projectStatuses } from '../constants/projectStatuses'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

const isDragging = ref(false)
const dropPosition = ref(null)
const editingTaskId = ref(null)
const editingTaskName = ref('')

const emit = defineEmits([
  'edit',
  'delete',
  'duplicate',
  'status-change',
  'drag-start',
  'drag-end',
  'drop-on-project',
  'toggle-task',
  'edit-task',
  'delete-task',
])

function handleDragStart() {
  isDragging.value = true
  emit('drag-start', props.project.id)
}

function handleDragEnd() {
  isDragging.value = false
  emit('drag-end')
}

function handleDragLeave() {
  dropPosition.value = null
}

function handleDrop() {
  const position = dropPosition.value || 'before'

  emit('drop-on-project', props.project.id, props.project.status, position)

  dropPosition.value = null
}

function handleDragOver(event) {
  const card = event.currentTarget

  const rect = card.getBoundingClientRect()

  const middle = rect.top + rect.height / 2

  dropPosition.value = event.clientY < middle ? 'before' : 'after'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL')
}

function getDeadlineInfo(project) {
  if (!project.deadline || project.status === 'Gotowe') {
    return null
  }

  const today = new Date()
  const deadline = new Date(project.deadline)

  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)

  const diffTime = deadline - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)} dni po terminie`,
      type: 'overdue',
    }
  }

  if (diffDays === 0) {
    return {
      text: 'Termin dzisiaj',
      type: 'today',
    }
  }

  if (diffDays <= 3) {
    return {
      text: `Zostało ${diffDays} dni`,
      type: 'soon',
    }
  }

  return {
    text: `Zostało ${diffDays} dni`,
    type: 'normal',
  }
}

function startEditTask(task) {
  editingTaskId.value = task.id
  editingTaskName.value = task.name
}

function saveTask(projectId, taskId) {
  const taskName = editingTaskName.value.trim()

  if (!taskName) {
    return
  }

  emit('edit-task', projectId, taskId, taskName)

  editingTaskId.value = null
  editingTaskName.value = ''
}

function cancelTaskEdit() {
  editingTaskId.value = null
  editingTaskName.value = ''
}
</script>

<template>
  <article
    class="project-card"
    :class="{
      dragging: isDragging,
      'drop-before': dropPosition === 'before',
      'drop-after': dropPosition === 'after',
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover.stop.prevent="handleDragOver"
    @dragleave.stop="handleDragLeave"
    @drop.stop="handleDrop"
  >
    <h2>{{ project.name }}</h2>

    <p v-if="project.createdAt" class="project-date">
      Utworzono: {{ formatDate(project.createdAt) }}
    </p>

    <p v-if="project.updatedAt" class="project-date">
      Edytowano: {{ formatDate(project.updatedAt) }}
    </p>

    <p v-if="project.deadline" class="project-deadline">
      Termin: {{ formatDate(project.deadline) }}
    </p>

    <p
      v-if="getDeadlineInfo(project)"
      class="deadline-info"
      :class="`deadline-${getDeadlineInfo(project).type}`"
    >
      {{ getDeadlineInfo(project).text }}
    </p>

    <p
      class="project-priority"
      :class="{
        'priority-low': project.priority === 'Niski',
        'priority-medium': project.priority === 'Średni',
        'priority-high': project.priority === 'Wysoki',
        'priority-urgent': project.priority === 'Pilny',
      }"
    >
      {{ project.priority || 'Średni' }}
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
      draggable="false"
      :value="project.status"
      @click.stop
      @change="$emit('status-change', project.id, $event.target.value)"
    >
      <option v-for="status in projectStatuses" :key="status" :value="status">
        {{ status }}
      </option>
    </select>

    <p>{{ project.description }}</p>

    <div v-if="project.tasks?.length" class="project-tasks">
      <div v-for="task in project.tasks" :key="task.id" class="project-task">
        <input
          type="checkbox"
          draggable="false"
          :checked="task.completed"
          @click.stop
          @change="$emit('toggle-task', project.id, task.id)"
        />

        <input
          v-if="editingTaskId === task.id"
          v-model="editingTaskName"
          class="task-edit-input"
          type="text"
          draggable="false"
          @click.stop
          @keydown.enter.prevent="saveTask(project.id, task.id)"
          @keydown.esc="cancelTaskEdit"
        />

        <span v-else :class="{ completed: task.completed }">
          {{ task.name }}
        </span>

        <div class="task-actions">
          <template v-if="editingTaskId === task.id">
            <button type="button" draggable="false" @click.stop="saveTask(project.id, task.id)">
              ✓
            </button>

            <button type="button" draggable="false" @click.stop="cancelTaskEdit">×</button>
          </template>

          <template v-else>
            <button type="button" draggable="false" @click.stop="startEditTask(task)">✎</button>

            <button
              type="button"
              draggable="false"
              @click.stop="$emit('delete-task', project.id, task.id)"
            >
              ×
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="project-actions">
      <button class="edit-button" draggable="false" @click.stop="$emit('edit', project)">
        Edytuj
      </button>

      <button class="duplicate-button" draggable="false" @click.stop="$emit('duplicate', project)">
        Duplikuj
      </button>

      <button class="delete-button" draggable="false" @click.stop="$emit('delete', project.id)">
        Usuń
      </button>
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

  width: 100%;
  min-width: 0;
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
  display: none;
}

.project-card.drop-before::before,
.project-card.drop-after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 999px;
  background: var(--primary);
}

.project-card.drop-before::before {
  top: -8px;
}

.project-card.drop-after::after {
  bottom: -8px;
}

.deadline-info {
  font-size: 13px;
  font-weight: 600;
}

.deadline-overdue {
  color: #dc2626 !important;
}

.deadline-today,
.deadline-soon {
  color: #d97706 !important;
}

.deadline-normal {
  color: #16a34a !important;
}

p.project-priority {
  display: inline-flex;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  margin-right: 3px;
}

.priority-low {
  background: #f3f4f6;
  color: #6b7280 !important;
}

.priority-medium {
  background: #dbeafe;
  color: #1d4ed8 !important;
}

.priority-high {
  background: #ffedd5;
  color: #c2410c !important;
}

.priority-urgent {
  background: #fee2e2;
  color: #b91c1c !important;
}

.project-tasks {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.project-task {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}

.project-task input {
  width: auto;
  margin: 0;
}

.project-task .completed {
  color: var(--text-muted);
  text-decoration: line-through;
}

@media (hover: hover) and (pointer: fine) {
  .project-card {
    cursor: grab;
  }

  .project-card:active {
    cursor: grabbing;
  }
}

@media (max-width: 1023px) {
  .status-select {
    display: block;
    width: 100%;
    margin-bottom: 16px;
    padding: 9px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
}

@media (max-width: 767px) {
  .project-card {
    padding: 18px;
  }

  .project-actions {
    flex-wrap: wrap;
  }

  .project-actions button {
    flex: 1 1 calc(50% - 5px);
  }

  .delete-button {
    flex-basis: 100% !important;
  }

  .project-task {
    align-items: flex-start;
  }

  .task-actions {
    flex-shrink: 0;
  }

  .project-card h2,
  .project-card p {
    overflow-wrap: anywhere;
  }

  .task-actions button {
    min-width: 36px;
    min-height: 36px;
  }
}
</style>
