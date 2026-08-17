<script setup>
import { ref, watch, computed } from 'vue'
import ProjectFilters from './components/ProjectFilters.vue'
import ProjectForm from './components/ProjectForm.vue'
import ProjectCard from './components/ProjectCard.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { projectStatuses } from './constants/projectStatuses'

const projectToDeleteId = ref(null)

const editingProject = ref(null)

const savedStatus = localStorage.getItem('selectedStatus')

const selectedStatus = ref(savedStatus || 'Wszystkie')

const statuses = ['Wszystkie', ...projectStatuses]

const searchQuery = ref('')

const sortBy = ref('newest')

const savedTheme = localStorage.getItem('theme')

const darkMode = ref(savedTheme === 'dark')

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

function saveProject(projectData) {
  if (editingProject.value) {
    const project = projects.value.find((project) => project.id === editingProject.value.id)

    project.name = projectData.name
    project.status = projectData.status
    project.description = projectData.description
    project.updatedAt = new Date().toISOString()

    editingProject.value = null
  } else {
    projects.value.push({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      ...projectData,
    })
  }
}

function deleteProject(id) {
  projectToDeleteId.value = id
}

function confirmDelete() {
  projects.value = projects.value.filter((project) => project.id !== projectToDeleteId.value)

  projectToDeleteId.value = null
}

function cancelDelete() {
  projectToDeleteId.value = null
}

function editProject(project) {
  editingProject.value = project
}

function cancelEdit() {
  editingProject.value = null
}

const statusCounts = computed(() => {
  return {
    Wszystkie: projects.value.length,
    'Do zrobienia': projects.value.filter((project) => project.status === 'Do zrobienia').length,
    'W trakcie': projects.value.filter((project) => project.status === 'W trakcie').length,
    Gotowe: projects.value.filter((project) => project.status === 'Gotowe').length,
  }
})

function duplicateProject(project) {
  projects.value.push({
    ...project,
    id: Date.now(),
    name: `${project.name} - kopia`,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  })
}

function changeProjectStatus(id, status) {
  const project = projects.value.find((project) => project.id === id)

  project.status = status
  project.updatedAt = new Date().toISOString()
}

function toggleTheme() {
  darkMode.value = !darkMode.value

  localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
}
</script>

<template>
  <div class="page" :class="{ dark: darkMode }">
    <main class="app">
      <button class="theme-toggle" @click="toggleTheme">
        {{ darkMode ? '☀️ Jasny' : '🌙 Ciemny' }}
      </button>

      <h1>Project Manager</h1>

      <p>Liczba projektów: {{ projects.length }}</p>

      <ProjectForm :project="editingProject" @save="saveProject" @cancel="cancelEdit" />

      <ProjectFilters
        v-model:searchQuery="searchQuery"
        v-model:selectedStatus="selectedStatus"
        v-model:sortBy="sortBy"
        :statuses="statuses"
        :statusCounts="statusCounts"
      />

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
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @edit="editProject"
          @duplicate="duplicateProject"
          @delete="deleteProject"
          @status-change="changeProjectStatus"
        />
      </div>

      <Teleport to="body">
        <ConfirmModal
          v-if="projectToDeleteId !== null"
          message="Czy na pewno chcesz usunąć ten projekt?"
          @confirm="confirmDelete"
          @cancel="cancelDelete"
        />
      </Teleport>
    </main>
  </div>
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

.app {
  width: min(100% - 40px, 900px);
  margin: 0 auto;
  padding: 64px 0;
}

.app > p {
  color: var(--text-muted);
}

h1 {
  margin: 0 0 8px;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: var(--text);
}

.projects {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 48px;
}

.empty-state {
  margin-top: 32px;
  padding: 24px;
  border-radius: 14px;
  border-color: var(--border);
  background: var(--surface);
  color: var(--text-muted);
  text-align: center;
}

.app.dark {
  color: #f9fafb;
}

.app.dark::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: #111827;
}

.theme-toggle {
  margin-bottom: 30px;
}

.page {
  --background: #f5f7fb;
  --surface: #ffffff;
  --text: #111827;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --primary: #4f46e5;

  min-height: 100vh;
  background: var(--background);
  color: var(--text);
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.page.dark {
  --background: #111827;
  --surface: #1f2937;
  --text: #f9fafb;
  --text-muted: #9ca3af;
  --border: #374151;
  --primary: #818cf8;
}

@media (max-width: 767px) {
  .app {
    width: min(100% - 32px, 900px);
    padding: 40px 0;
  }

  .projects {
    grid-template-columns: 1fr;
  }
}
</style>
