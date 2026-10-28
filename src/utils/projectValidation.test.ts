import { describe, it, expect } from 'vitest'
import { isTask } from './projectValidation'

describe('isTask', () => {
  it('accepts a valid task', () => {
    const task = {
      id: 1,
      name: 'Przygotować stronę',
      completed: false,
    }

    expect(isTask(task)).toBe(true)
  })

  it('rejects a task with invalid completed value', () => {
    const task = {
      id: 1,
      name: 'Przygotować stronę',
      completed: 'tak',
    }

    expect(isTask(task)).toBe(false)
  })
})
