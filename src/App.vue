<script setup>
import { ref, watch, computed } from 'vue'
import ProjectFilters from './components/ProjectFilters.vue'
import ProjectForm from './components/ProjectForm.vue'
import ProjectCard from './components/ProjectCard.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { projectStatuses } from './constants/projectStatuses'

const projectToDeleteId = ref(null)

const projectToCompleteId = ref(null)

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

const toasts = ref([])

const filteredProjects = computed(() => {
  const filtered = projects.value.filter((project) => {
    const matchesStatus =
      selectedStatus.value === 'Wszystkie' || project.status === selectedStatus.value

    const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesStatus && matchesSearch
  })

  if (sortBy.value === 'custom') {
    return filtered
  }

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

    if (sortBy.value === 'priority') {
      const priorityOrder = {
        Pilny: 4,
        Wysoki: 3,
        Średni: 2,
        Niski: 1,
      }

      return priorityOrder[b.priority || 'Średni'] - priorityOrder[a.priority || 'Średni']
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
    project.deadline = projectData.deadline
    project.priority = projectData.priority
    project.tasks = projectData.tasks
    project.updatedAt = new Date().toISOString()

    editingProject.value = null

    showToast('Zmiany zostały zapisane', 'success')
  } else {
    projects.value.push({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      ...projectData,
    })

    showToast('Projekt został dodany', 'success')
  }
}

function deleteProject(id) {
  projectToDeleteId.value = id
}

function confirmDelete() {
  projects.value = projects.value.filter((project) => project.id !== projectToDeleteId.value)

  projectToDeleteId.value = null

  showToast('Projekt został usunięty', 'error')
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

  showToast('Projekt został zduplikowany')
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
  resetDragState()
}

function dragOver(status) {
  dragOverStatus.value = status
}

function dragLeave() {
  dragOverStatus.value = null
}

function dropProject(status) {
  const draggedIndex = projects.value.findIndex((project) => project.id === draggedProjectId.value)

  if (draggedIndex === -1) {
    resetDragState()
    return
  }

  const [draggedProject] = projects.value.splice(draggedIndex, 1)

  draggedProject.status = status
  draggedProject.updatedAt = new Date().toISOString()

  let lastProjectIndex = -1

  projects.value.forEach((project, index) => {
    if (project.status === status) {
      lastProjectIndex = index
    }
  })

  if (lastProjectIndex === -1) {
    projects.value.push(draggedProject)
  } else {
    projects.value.splice(lastProjectIndex + 1, 0, draggedProject)
  }

  sortBy.value = 'custom'

  resetDragState()
}

function resetDragState() {
  draggedProjectId.value = null
  dragOverStatus.value = null
}

function dropOnProject(targetProjectId, status, position) {
  if (draggedProjectId.value === targetProjectId) {
    resetDragState()
    return
  }

  const draggedIndex = projects.value.findIndex((project) => project.id === draggedProjectId.value)

  if (draggedIndex === -1) {
    resetDragState()
    return
  }

  const [draggedProject] = projects.value.splice(draggedIndex, 1)

  draggedProject.status = status
  draggedProject.updatedAt = new Date().toISOString()

  const targetIndex = projects.value.findIndex((project) => project.id === targetProjectId)

  if (targetIndex === -1) {
    projects.value.push(draggedProject)

    sortBy.value = 'custom'
    resetDragState()

    return
  }

  const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex

  projects.value.splice(insertIndex, 0, draggedProject)

  sortBy.value = 'custom'

  resetDragState()
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

function showToast(message, type = 'success') {
  const toast = {
    id: Date.now(),
    message,
    type,
  }

  toasts.value.push(toast)

  setTimeout(() => {
    toasts.value = toasts.value.filter((item) => item.id !== toast.id)
  }, 2500)
}

function toggleTask(projectId, taskId) {
  const project = projects.value.find((project) => project.id === projectId)

  if (!project) {
    return
  }

  const task = project.tasks?.find((task) => task.id === taskId)

  if (!task) {
    return
  }

  task.completed = !task.completed
  project.updatedAt = new Date().toISOString()

  const allTasksCompleted =
    project.tasks.length > 0 && project.tasks.every((task) => task.completed)

  if (task.completed && allTasksCompleted && project.status !== 'Gotowe') {
    projectToCompleteId.value = project.id
  }
}

function confirmCompleteProject() {
  const project = projects.value.find((project) => project.id === projectToCompleteId.value)

  if (!project) {
    projectToCompleteId.value = null
    return
  }

  project.status = 'Gotowe'
  project.updatedAt = new Date().toISOString()

  projectToCompleteId.value = null

  showToast('Projekt został oznaczony jako gotowy', 'success')
}

function cancelCompleteProject() {
  projectToCompleteId.value = null
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
              @drop-on-project="dropOnProject"
              @toggle-task="toggleTask"
            />
          </div>
        </div>
      </div>

      <div class="toast-container">
        <TransitionGroup name="toast">
          <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
            {{ toast.message }}
          </div>
        </TransitionGroup>
      </div>

      <Teleport to="body">
        <ConfirmModal
          v-if="projectToDeleteId !== null"
          title="Usuń projekt"
          message="Czy na pewno chcesz usunąć ten projekt?"
          confirm-text="Usuń"
          variant="danger"
          @confirm="confirmDelete"
          @cancel="cancelDelete"
        />
      </Teleport>

      <Teleport to="body">
        <ConfirmModal
          v-if="projectToCompleteId !== null"
          title="Ukończyć projekt?"
          message="Wszystkie zadania są wykonane. Przenieść projekt do „Gotowe”?"
          confirm-text="Przenieś do Gotowe"
          variant="success"
          @confirm="confirmCompleteProject"
          @cancel="cancelCompleteProject"
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

.toast {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 12px 35px rgb(0 0 0 / 15%);
  font-size: 14px;
  font-weight: 600;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.toast-success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.toast-error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.toast-move {
  transition: transform 0.3s ease;
}

.toast-container {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(320px, calc(100vw - 48px));
}

.page.dark .toast-success {
  background: #14532d;
  color: #dcfce7;
  border-color: #166534;
}

.page.dark .toast-error {
  background: #7f1d1d;
  color: #fee2e2;
  border-color: #991b1b;
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

  .toast {
    right: 16px;
    bottom: 16px;
    left: 16px;
    max-width: none;
  }
}
</style>
