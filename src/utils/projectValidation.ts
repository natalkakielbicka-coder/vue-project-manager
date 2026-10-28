import type { Task } from '../types/project'

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
