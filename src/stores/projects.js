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

  return {
    projects,
  }
})
