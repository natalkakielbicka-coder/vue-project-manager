import { ref } from 'vue'

export function useProjectDragDrop(projects, sortBy) {
  const draggedProjectId = ref(null)
  const dragOverStatus = ref(null)

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

  function resetDragState() {
    draggedProjectId.value = null
    dragOverStatus.value = null
  }

  function dropProject(status) {
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

  function dropOnProject(targetProjectId, status, position) {
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
