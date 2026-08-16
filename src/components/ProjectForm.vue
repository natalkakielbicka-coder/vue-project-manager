<script setup>
import { ref, watch } from 'vue'

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
  <div class="project-form">
    <div class="form-group">
      <label for="project-name">Nazwa projektu</label>

      <input id="project-name" v-model="projectName" type="text" />

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>
    </div>

    <div class="form-group">
      <label for="project-status">Status</label>

      <select id="project-status" v-model="projectStatus">
        <option>Do zrobienia</option>
        <option>W trakcie</option>
        <option>Gotowe</option>
      </select>
    </div>

    <div class="form-group">
      <label for="project-description">Opis projektu</label>

      <textarea id="project-description" v-model="projectDescription"></textarea>
    </div>

    <div class="form-actions">
      <button @click="submitForm">
        {{ project ? 'Zapisz zmiany' : 'Dodaj projekt' }}
      </button>

      <button v-if="project" class="cancel-button" @click="cancelEdit">Anuluj</button>
    </div>
  </div>
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
</style>
