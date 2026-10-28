import { describe, it, expect } from 'vitest'
import { isTask, isProject } from './projectValidation'
import type { Project } from '../types/project'

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

const validProject: Project = {
  id: 1,
  name: 'Strona WordPress',
  status: 'W trakcie',
  description: 'Budowa strony klienta',
  deadline: '2026-11-15',
  priority: 'Wysoki',
  tasks: [
    {
      id: 1,
      name: 'Przygotować layout',
      completed: false,
    },
  ],
  createdAt: '2026-10-28T08:00:00.000Z',
  updatedAt: null,
}

describe('isProject', () => {
  it('accepts a valid project', () => {
    expect(isProject(validProject)).toBe(true)
  })

  it('rejects a project with invalid status', () => {
    const project = {
      ...validProject,
      status: 'Anulowany',
    }

    expect(isProject(project)).toBe(false)
  })

  it('rejects a project with invalid priority', () => {
    const project = {
      ...validProject,
      priority: 'Krytyczny',
    }

    expect(isProject(project)).toBe(false)
  })

  it('rejects a project with invalid task', () => {
    const project = {
      ...validProject,
      tasks: [
        {
          id: 1,
          name: 'Przygotować layout',
          completed: 'tak',
        },
      ],
    }

    expect(isProject(project)).toBe(false)
  })
})
