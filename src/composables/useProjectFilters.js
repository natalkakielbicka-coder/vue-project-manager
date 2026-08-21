import { ref, computed, watch } from 'vue'
import { projectStatuses } from '../constants/projectStatuses'

export function useProjectFilters(projects) {
  const savedStatus = localStorage.getItem('selectedStatus')

  const selectedStatus = ref(savedStatus || 'Wszystkie')
  const searchQuery = ref('')
  const sortBy = ref('newest')

  const statuses = ['Wszystkie', ...projectStatuses]

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

  const statusCounts = computed(() => {
    return {
      Wszystkie: projects.value.length,
      'Do zrobienia': projects.value.filter((project) => project.status === 'Do zrobienia').length,
      'W trakcie': projects.value.filter((project) => project.status === 'W trakcie').length,
      Gotowe: projects.value.filter((project) => project.status === 'Gotowe').length,
    }
  })

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

  function getProjectsByStatus(status) {
    return filteredProjects.value.filter((project) => project.status === status)
  }

  watch(selectedStatus, (newStatus) => {
    localStorage.setItem('selectedStatus', newStatus)
  })

  return {
    selectedStatus,
    searchQuery,
    sortBy,
    statuses,
    filteredProjects,
    statusCounts,
    hasActiveFilters,
    clearFilters,
    getProjectsByStatus,
  }
}
