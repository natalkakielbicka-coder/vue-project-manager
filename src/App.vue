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

const draggedProjectId = ref(null)

const dragOverStatus = ref(null)

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

function startDrag(projectId) {
  draggedProjectId.value = projectId
}

function endDrag() {
  draggedProjectId.value = null
  dragOverStatus.value = null
}

function dragOver(status) {
  dragOverStatus.value = status
}

function dragLeave() {
  dragOverStatus.value = null
}

function dropProject(status) {
  const project = projects.value.find((project) => project.id === draggedProjectId.value)

  if (!project) {
    return
  }

  project.status = status
  project.updatedAt = new Date().toISOString()

  draggedProjectId.value = null
  dragOverStatus.value = null
}

function getProjectsByStatus(status) {
  return filteredProjects.value.filter((project) => project.status === status)
}

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== '' || selectedStatus.value !== 'Wszystkie' || sortBy.value !== 'newest'
  )
})

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = 'Wszystkie'
  sortBy.value = 'newest'
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

      <div class="filters-row">
        <ProjectFilters
          v-model:searchQuery="searchQuery"
          v-model:selectedStatus="selectedStatus"
          v-model:sortBy="sortBy"
          :statuses="statuses"
          :statusCounts="statusCounts"
        />

        <button v-if="hasActiveFilters" class="clear-filters" @click="clearFilters">
          Wyczyść filtry
        </button>
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

      <div v-else class="board">
        <div
          v-for="status in projectStatuses"
          :key="status"
          class="board-column"
          :class="{ 'drag-over': dragOverStatus === status }"
          @dragover.prevent="dragOver(status)"
          @dragleave="dragLeave"
          @drop="dropProject(status)"
        >
          <div class="board-column-header">
            <h2>{{ status }}</h2>

            <span>
              {{ getProjectsByStatus(status).length }}
            </span>
          </div>

          <div class="board-projects">
            <p v-if="getProjectsByStatus(status).length === 0" class="empty-column">
              Brak projektów
            </p>

            <ProjectCard
              v-for="project in getProjectsByStatus(status)"
              :key="project.id"
              :project="project"
              @edit="editProject"
              @duplicate="duplicateProject"
              @delete="deleteProject"
              @status-change="changeProjectStatus"
              @drag-start="startDrag"
              @drag-end="endDrag"
            />
          </div>
        </div>
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

.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 40px;
  align-items: start;
}

.board-column {
  min-width: 0;
  min-height: 300px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.board-column.drag-over {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 7%, var(--surface));
  box-shadow: 0 0 0 3px rgb(99 102 241 / 12%);
  transform: translateY(-3px);
}

.board-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.board-column-header h2 {
  margin: 0;
  font-size: 16px;
  color: var(--text);
}

.board-column-header span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--background);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.board-projects {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.empty-column {
  margin: 0;
  padding: 28px 16px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text-muted);
  text-align: center;
  font-size: 13px;
}

.filters-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: 40px;
}

.clear-filters {
  flex: 0 0 auto;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.clear-filters:hover {
  border-color: var(--primary);
  color: var(--primary);
}

@media (max-width: 1023px) {
  .board {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
@media (max-width: 767px) {
  .app {
    width: min(100% - 32px, 900px);
    padding: 40px 0;
  }

  .projects {
    grid-template-columns: 1fr;
  }

  .board {
    overflow-x: auto;
    margin-right: -16px;
    padding-right: 16px;
    padding-bottom: 16px;
    scroll-snap-type: x mandatory;
  }

  .board-column {
    flex: 0 0 85%;
    min-width: 280px;
    scroll-snap-align: start;
  }

  .board-projects {
    gap: 12px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .clear-filters {
    align-self: flex-start;
  }
}
</style>
