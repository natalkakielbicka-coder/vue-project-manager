<script setup>
import { ref, watch, computed } from 'vue'

const projectName = ref('Moja pierwsza strona')
const projectStatus = ref('Do zrobienia')
const projectDescription = ref('')
const errorMessage = ref('')
const editingId = ref(null)
const savedStatus = localStorage.getItem('selectedStatus')

const selectedStatus = ref(savedStatus || 'Wszystkie')

const statuses = ['Wszystkie', 'Do zrobienia', 'W trakcie', 'Gotowe']

const searchQuery = ref('')

const sortBy = ref('newest')

const filteredProjects = computed(() => {
  const filtered = projects.value.filter((project) => {
    const matchesStatus =
      selectedStatus.value === 'Wszystkie' || project.status === selectedStatus.value

    const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesStatus && matchesSearch
  })

  return [...filtered].sort((a, b) => {
    if (sortBy.value === 'newest') {
      return b.id - a.id
    }

    if (sortBy.value === 'oldest') {
      return a.id - b.id
    }

    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name, 'pl')
    }

    return 0
  })
})

const savedProjects = localStorage.getItem('projects')

const projects = ref(savedProjects ? JSON.parse(savedProjects) : [])

watch(
  projects,
  (newProjects) => {
    localStorage.setItem('projects', JSON.stringify(newProjects))
  },
  { deep: true },
)

watch(selectedStatus, (newStatus) => {
  localStorage.setItem('selectedStatus', newStatus)
})

function addProject() {
  if (projectName.value.trim() === '') {
    errorMessage.value = 'Podaj nazwę projektu'
    return
  }

  errorMessage.value = ''

  if (editingId.value !== null) {
    const project = projects.value.find((project) => project.id === editingId.value)

    project.name = projectName.value
    project.status = projectStatus.value
    project.description = projectDescription.value

    editingId.value = null
  } else {
    const project = {
      id: Date.now(),
      name: projectName.value,
      status: projectStatus.value,
      description: projectDescription.value,
    }

    projects.value.push(project)
  }

  projectName.value = ''
  projectStatus.value = 'Do zrobienia'
  projectDescription.value = ''
}

function deleteProject(id) {
  projects.value = projects.value.filter((project) => project.id !== id)
}

function editProject(project) {
  editingId.value = project.id

  projectName.value = project.name
  projectStatus.value = project.status
  projectDescription.value = project.description
}

function cancelEdit() {
  editingId.value = null
  projectName.value = ''
  projectStatus.value = 'Do zrobienia'
  projectDescription.value = ''
  errorMessage.value = ''
}
</script>

<template>
  <main class="app">
    <h1>Project Manager</h1>

    <p>Liczba projektów: {{ projects.length }}</p>

    <div class="form-group">
      <label for="project-name">Nazwa projektu</label>

      <input id="project-name" v-model="projectName" type="text" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
      <button @click="addProject">
        {{ editingId !== null ? 'Zapisz zmiany' : 'Dodaj projekt' }}
      </button>

      <button v-if="editingId !== null" class="cancel-button" @click="cancelEdit">Anuluj</button>
    </div>

    <div class="filters">
      <input v-model="searchQuery" class="search" type="text" placeholder="Szukaj projektu..." />

      <button
        v-for="status in statuses"
        :key="status"
        :class="{ active: selectedStatus === status }"
        @click="selectedStatus = status"
      >
        {{ status }}
      </button>

      <select v-model="sortBy" class="sort">
        <option value="newest">Najnowsze</option>
        <option value="oldest">Najstarsze</option>
        <option value="name">Nazwa A–Z</option>
      </select>
    </div>

    <!-- <select v-model="selectedStatus" class="filters">
      <option
        v-for="status in ['Wszystkie', 'Do zrobienia', 'W trakcie', 'Gotowe']"
        :key="status"
        :value="status"
      >
        {{ status }}
      </option>
    </select> -->

    <p v-if="filteredProjects.length === 0" class="empty-state">
      Brak projektów spełniających kryteria.
    </p>

    <div v-else class="projects">
      <article v-for="project in filteredProjects" :key="project.id" class="project-card">
        <h2>{{ project.name }}</h2>

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

        <p>{{ project.description }}</p>

        <div class="project-actions">
          <button class="edit-button" @click="editProject(project)">Edytuj</button>

          <button class="delete-button" @click="deleteProject(project.id)">Usuń</button>
        </div>
      </article>
    </div>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f5f7fb;
  color: #1f2937;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app {
  width: min(100% - 40px, 900px);
  margin: 0 auto;
  padding: 64px 0;
}

h1 {
  margin: 0 0 8px;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: #111827;
}

.app > p {
  margin-top: 0;
  margin-bottom: 32px;
  color: #6b7280;
}

/* FORMULARZ */

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
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
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

/* BUTTON */

button {
  border: 0;
  border-radius: 10px;
  padding: 12px 18px;
  background: #4f46e5;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

button:hover {
  background: #4338ca;
  box-shadow: 0 8px 20px rgb(79 70 229 / 20%);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* BŁĄD */

.error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

/* LISTA PROJEKTÓW */

.projects {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 48px;
}

.project-card {
  position: relative;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgb(17 24 39 / 5%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgb(17 24 39 / 10%);
}

.project-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #111827;
}

.project-card p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #6b7280;
}

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.project-actions button {
  margin-top: 0;
}

.edit-button {
  background: #eef2ff;
  color: #4338ca;
}

.edit-button:hover {
  background: #e0e7ff;
  box-shadow: none;
}

.delete-button {
  background: #fee2e2;
  color: #b91c1c;
}

.delete-button:hover {
  background: #fecaca;
  box-shadow: none;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.cancel-button {
  background: #e5e7eb;
  color: #374151;
}

.cancel-button:hover {
  background: #d1d5db;
  box-shadow: none;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
}

.filters .search {
  flex: 1 1 260px;
  min-width: 220px;
}

.filters button {
  padding: 8px 14px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: #ffffff;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  box-shadow: none;
  transform: none;
}

.filters button:hover {
  background: #f3f4f6;
  color: #374151;
  box-shadow: none;
  transform: none;
}

.filters button.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

.filters button.active:hover {
  background: #4338ca;
  border-color: #4338ca;
}

.search {
  padding: 11px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
}

.search::placeholder {
  color: #9ca3af;
}

.empty-state {
  margin-top: 32px !important;
  padding: 24px;
  border: 1px dashed #d1d5db;
  border-radius: 14px;
  background: #ffffff;
  color: #6b7280;
  text-align: center;
}

.sort {
  width: auto;
  min-width: 150px;
  padding: 10px 14px;
  cursor: pointer;
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

/* MOBILE */

@media (max-width: 767px) {
  .app {
    width: min(100% - 32px, 900px);
    padding: 40px 0;
  }

  .projects {
    grid-template-columns: 1fr;
  }

  .project-filters {
    flex-direction: column;
  }

  .filters {
    align-items: stretch;
  }

  .filters .search {
    flex-basis: 100%;
    width: 100%;
  }

  .filters button {
    flex: 1 1 auto;
  }
}
</style>
