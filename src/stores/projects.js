import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useProjectsStore = defineStore('projects', () => {
  const savedProjects = localStorage.getItem('projects')

  const projects = ref(savedProjects ? JSON.parse(savedProjects) : [])

  watch(
    projects,
    (newProjects) => {
      localStorage.setItem('projects', JSON.stringify(newProjects))
    },
    { deep: true },
  )

  function addProject(projectData) {
    projects.value.push({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      ...projectData,
    })
  }

  function updateProject(id, projectData) {
    const project = projects.value.find((project) => project.id === id)

    if (!project) {
      return
    }

    project.name = projectData.name
    project.status = projectData.status
    project.description = projectData.description
    project.deadline = projectData.deadline
    project.priority = projectData.priority
    project.tasks = projectData.tasks
    project.updatedAt = new Date().toISOString()
  }

  function duplicateProject(project) {
    projects.value.push({
      ...project,
      id: Date.now(),
      name: `${project.name} - kopia`,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      tasks: project.tasks
        ? project.tasks.map((task) => ({
            ...task,
            id: crypto.randomUUID(),
          }))
        : [],
    })
  }

  function changeProjectStatus(id, status) {
    const project = projects.value.find((project) => project.id === id)

    project.status = status
    project.updatedAt = new Date().toISOString()
  }

  function deleteProject(id) {
    projects.value = projects.value.filter((project) => project.id !== id)
  }

  return {
    projects,
    addProject,
    updateProject,
    duplicateProject,
    changeProjectStatus,
    deleteProject,
  }
})
