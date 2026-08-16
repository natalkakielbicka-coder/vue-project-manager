<script setup>
import { ref, watch, computed } from 'vue'
import ProjectFilters from './components/ProjectFilters.vue'
import ProjectForm from './components/ProjectForm.vue'
import ProjectCard from './components/ProjectCard.vue'

const editingProject = ref(null)

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
  projects.value = projects.value.filter((project) => project.id !== id)
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
</script>

<template>
  <main class="app">
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
        @delete="deleteProject"
      />
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

.projects {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 48px;
}

.empty-state {
  margin-top: 32px;
  padding: 24px;
  border: 1px dashed #d1d5db;
  border-radius: 14px;
  background: #ffffff;
  color: #6b7280;
  text-align: center;
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
