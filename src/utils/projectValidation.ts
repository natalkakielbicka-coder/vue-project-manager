import { projectPriorities } from '../constants/projectPriorities'
import { projectStatuses } from '../constants/projectStatuses'
import type { Project, Task } from '../types/project'

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (!('id' in value) || !('name' in value) || !('completed' in value)) {
    return false
  }

  return (
    (typeof value.id === 'number' || typeof value.id === 'string') &&
    typeof value.name === 'string' &&
    typeof value.completed === 'boolean'
  )
}

export function isProject(value: unknown): value is Project {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (
    !('id' in value) ||
    !('name' in value) ||
    !('status' in value) ||
    !('description' in value) ||
    !('deadline' in value) ||
    !('priority' in value) ||
    !('tasks' in value) ||
    !('createdAt' in value) ||
    !('updatedAt' in value)
  ) {
    return false
  }

  const validStatuses: readonly string[] = projectStatuses

  const validPriorities: readonly string[] = projectPriorities

  return (
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&
    typeof value.name === 'string' &&
    typeof value.status === 'string' &&
    validStatuses.includes(value.status) &&
    typeof value.description === 'string' &&
    typeof value.deadline === 'string' &&
    typeof value.priority === 'string' &&
    validPriorities.includes(value.priority) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isTask) &&
    typeof value.createdAt === 'string' &&
    (value.updatedAt === null || typeof value.updatedAt === 'string')
  )
}
