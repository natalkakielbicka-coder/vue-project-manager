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
