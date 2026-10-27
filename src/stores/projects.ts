import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import type { Project, ProjectFormData, ProjectStatus, Task } from '../types/project'

export const useProjectsStore = defineStore('projects', () => {
  function loadProjects(): Project[] {
    const savedProjects = localStorage.getItem('projects')

    if (!savedProjects) {
      return []
    }

    try {
      const parsed: unknown = JSON.parse(savedProjects)

      return Array.isArray(parsed) ? (parsed as Project[]) : []
    } catch {
      return []
    }
  }

  const projects = ref<Project[]>(loadProjects())

  watch(
    projects,
    (newProjects) => {
      localStorage.setItem('projects', JSON.stringify(newProjects))
    },
    { deep: true },
  )

  function addProject(projectData: ProjectFormData): void {
    projects.value.push({
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      ...projectData,
    })
  }

  function updateProject(id: number, projectData: ProjectFormData): void {
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

  function duplicateProject(project: Project): void {
    projects.value.push({
      ...project,
      id: Date.now(),
      name: `${project.name} - kopia`,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      tasks: project.tasks
        ? project.tasks.map((task: Task) => ({
            ...task,
            id: crypto.randomUUID(),
          }))
        : [],
    })
  }

  function changeProjectStatus(id: number, status: ProjectStatus): void {
    const project = projects.value.find((project) => project.id === id)

    if (!project) {
      return
    }

    project.status = status
    project.updatedAt = new Date().toISOString()
  }

  function deleteProject(id: number): void {
    projects.value = projects.value.filter((project) => project.id !== id)
  }

  function editTask(projectId: number, taskId: number | string, taskName: string): void {
    const project = projects.value.find((project) => project.id === projectId)

    if (!project) {
      return
    }

    const task = project.tasks?.find((task) => task.id === taskId)

    if (!task) {
      return
    }

    task.name = taskName
    project.updatedAt = new Date().toISOString()
  }

  function deleteTask(projectId: number, taskId: number | string): void {
    const project = projects.value.find((project) => project.id === projectId)

    if (!project) {
      return
    }

    project.tasks = project.tasks.filter((task) => task.id !== taskId)

    project.updatedAt = new Date().toISOString()
  }

  return {
    projects,
    addProject,
    updateProject,
    duplicateProject,
    changeProjectStatus,
    deleteProject,
    editTask,
    deleteTask,
  }
})
