import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Project, ProjectStatus } from '../types/project'
import type { SortOption } from '../types/filters'

export function useProjectDragDrop(projects: Ref<Project[]>, sortBy: Ref<SortOption>) {
  const draggedProjectId = ref<Project['id'] | null>(null)
  const dragOverStatus = ref<ProjectStatus | null>(null)

  function startDrag(projectId: Project['id']): void {
    draggedProjectId.value = projectId
  }

  function endDrag() {
    resetDragState()
  }

  function dragOver(status: ProjectStatus): void {
    dragOverStatus.value = status
  }

  function dragLeave() {
    dragOverStatus.value = null
  }

  function resetDragState() {
    draggedProjectId.value = null
    dragOverStatus.value = null
  }

  function dropProject(status: ProjectStatus): void {
    const draggedIndex = projects.value.findIndex(
      (project) => project.id === draggedProjectId.value,
    )

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

  function dropOnProject(
    targetProjectId: Project['id'],
    status: ProjectStatus,
    position: 'before' | 'after',
  ) {
    if (draggedProjectId.value === targetProjectId) {
      resetDragState()
      return
    }

    const draggedIndex = projects.value.findIndex(
      (project) => project.id === draggedProjectId.value,
    )

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

  return {
    dragOverStatus,
    startDrag,
    endDrag,
    dragOver,
    dragLeave,
    dropProject,
    dropOnProject,
  }
}
