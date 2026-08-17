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
const errorMessage = ref('')

watch(
  () => props.project,
  (project) => {
    if (project) {
      projectName.value = project.name
      projectStatus.value = project.status
      projectDescription.value = project.description
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
  })

  if (!props.project) {
    projectName.value = ''
    projectStatus.value = 'Do zrobienia'
    projectDescription.value = ''
  }
}

function cancelEdit() {
  projectName.value = ''
  projectStatus.value = 'Do zrobienia'
  projectDescription.value = ''
  errorMessage.value = ''

  emit('cancel')
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
      <label for="project-description">Opis projektu</label>

      <textarea id="project-description" v-model="projectDescription" maxlength="300"></textarea>

      <p class="character-count">{{ projectDescription.length }} / 300</p>
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
  color: #374151;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  background: #ffffff;
  color: #111827;
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
</style>
