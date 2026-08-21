<script setup>
import { ref, watch } from 'vue'
import { projectStatuses } from '../constants/projectStatuses'

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const projectName = ref('')
const projectStatus = ref('Do zrobienia')
const projectDescription = ref('')
const projectDeadline = ref('')
const projectPriority = ref('Średni')
const errorMessage = ref('')

const projectTasks = ref([])
const newTask = ref('')

watch(
  () => props.project,
  (project) => {
    if (project) {
      projectName.value = project.name
      projectStatus.value = project.status
      projectDescription.value = project.description
      projectDeadline.value = project.deadline || ''
      projectPriority.value = project.priority || 'Średni'

      projectTasks.value = project.tasks ? project.tasks.map((task) => ({ ...task })) : []
    }
  },
)

function submitForm() {
  if (projectName.value.trim() === '') {
    errorMessage.value = 'Podaj nazwę projektu'
    return
  }

  errorMessage.value = ''

  emit('save', {
    name: projectName.value,
    status: projectStatus.value,
    description: projectDescription.value,
    deadline: projectDeadline.value,
    priority: projectPriority.value,
    tasks: projectTasks.value,
  })

  if (!props.project) {
    projectName.value = ''
    projectStatus.value = 'Do zrobienia'
    projectDescription.value = ''
    projectDeadline.value = ''
    projectPriority.value = 'Średni'
    projectTasks.value = []
    newTask.value = ''
  }
}

function cancelEdit() {
  projectName.value = ''
  projectStatus.value = 'Do zrobienia'
  projectDescription.value = ''
  projectDeadline.value = ''
  errorMessage.value = ''
  projectPriority.value = 'Średni'
  projectTasks.value = []
  newTask.value = ''

  emit('cancel')
}

function addTask() {
  const taskName = newTask.value.trim()

  if (!taskName) {
    return
  }

  projectTasks.value.push({
    id: Date.now(),
    name: taskName,
    completed: false,
  })

  newTask.value = ''
}
</script>

<template>
  <form class="project-form" @submit.prevent="submitForm">
    <div class="form-group">
      <label for="project-name">Nazwa projektu</label>

      <input id="project-name" v-model="projectName" type="text" @input="errorMessage = ''" />

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </div>

    <div class="form-group">
      <label for="project-status">Status</label>

      <select id="project-status" v-model="projectStatus">
        <option v-for="status in projectStatuses" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="project-priority">Priorytet</label>

      <select id="project-priority" v-model="projectPriority">
        <option value="Niski">Niski</option>
        <option value="Średni">Średni</option>
        <option value="Wysoki">Wysoki</option>
        <option value="Pilny">Pilny</option>
      </select>
    </div>

    <div class="form-group">
      <label for="project-deadline">Termin</label>

      <input id="project-deadline" v-model="projectDeadline" type="date" />
    </div>

    <div class="form-group">
      <label for="project-description">Opis projektu</label>

      <textarea id="project-description" v-model="projectDescription" maxlength="300"></textarea>

      <p class="character-count">{{ projectDescription.length }} / 300</p>
    </div>

    <div class="form-group">
      <label for="project-task">Zadania</label>

      <div class="task-add">
        <input
          id="project-task"
          v-model="newTask"
          type="text"
          placeholder="Dodaj zadanie..."
          @keydown.enter.prevent="addTask"
        />

        <button type="button" @click.stop="addTask">Dodaj</button>
      </div>

      <ul v-if="projectTasks.length" class="task-list">
        <li v-for="task in projectTasks" :key="task.id">
          {{ task.name }}
        </li>
      </ul>
    </div>

    <div class="form-actions">
      <button type="submit">
        {{ project ? 'Zapisz zmiany' : 'Dodaj projekt' }}
      </button>

      <button v-if="project" type="button" class="cancel-button" @click="cancelEdit">Anuluj</button>
    </div>
  </form>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

input,
select,
textarea {
  width: 100%;
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  font: inherit;
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgb(99 102 241 / 12%);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.form-actions button {
  border: 0;
  border-radius: 10px;
  padding: 12px 18px;
  background: #4f46e5;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  background: #e5e7eb !important;
  color: #374151 !important;
}

.error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

.character-count {
  margin: 6px 0 0;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
}

.task-add {
  display: flex;
  gap: 8px;
}

.task-add input {
  flex: 1;
}

.task-add button {
  flex: 0 0 auto;
  border: 0;
  border-radius: 10px;
  padding: 0 16px;
  background: var(--primary);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.task-add button:hover {
  opacity: 0.9;
}

.task-list {
  display: grid;
  gap: 6px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.task-list li {
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--background);
  color: var(--text);
  font-size: 13px;
}
</style>
