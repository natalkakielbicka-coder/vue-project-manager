/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useProjectsStore } from './projects'
import type { Project } from '../types/project'

function createProject(): Project {
  return {
    id: 1,
    name: 'Strona WordPress',
    status: 'W trakcie',
    description: 'Projekt klienta',
    deadline: '2026-11-15',
    priority: 'Wysoki',
    tasks: [
      { id: 10, name: 'Przygotować layout', completed: false },
      { id: 11, name: 'Wdrożyć stronę', completed: false },
    ],
    createdAt: '2026-10-28T08:00:00.000Z',
    updatedAt: null,
  }
}

describe('useProjectsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('loads projects saved in localStorage', () => {
    localStorage.setItem('projects', JSON.stringify([createProject()]))

    const store = useProjectsStore()

    expect(store.projects).toEqual([createProject()])
  })

  it('ignores invalid data saved in localStorage', () => {
    localStorage.setItem('projects', JSON.stringify([{ id: 1, name: 'Błędny projekt' }]))

    const store = useProjectsStore()

    expect(store.projects).toEqual([])
  })

  it('adds a project and saves it to localStorage', async () => {
    const store = useProjectsStore()

    store.addProject({
      name: 'Nowy projekt',
      status: 'Do zrobienia',
      description: '',
      deadline: '',
      priority: 'Średni',
      tasks: [],
    })

    expect(store.projects).toHaveLength(1)
    expect(store.projects[0].name).toBe('Nowy projekt')
    expect(store.projects[0].updatedAt).toBeNull()

    await nextTick()

    expect(JSON.parse(localStorage.getItem('projects') ?? '[]')).toHaveLength(1)
  })

  it('toggles a task and updates the project date', () => {
    localStorage.setItem('projects', JSON.stringify([createProject()]))

    const store = useProjectsStore()

    store.toggleTask(1, 10)

    expect(store.projects[0].tasks[0].completed).toBe(true)
    expect(store.projects[0].updatedAt).not.toBeNull()

    store.toggleTask(1, 10)

    expect(store.projects[0].tasks[0].completed).toBe(false)
  })

  it('edits and deletes tasks', () => {
    localStorage.setItem('projects', JSON.stringify([createProject()]))

    const store = useProjectsStore()

    store.editTask(1, 10, 'Nowa nazwa')
    store.deleteTask(1, 11)

    expect(store.projects[0].tasks).toEqual([{ id: 10, name: 'Nowa nazwa', completed: false }])
  })

  it('duplicates a project with new task ids', () => {
    localStorage.setItem('projects', JSON.stringify([createProject()]))

    const store = useProjectsStore()

    store.duplicateProject(store.projects[0])

    const [original, copy] = store.projects

    expect(store.projects).toHaveLength(2)
    expect(copy.name).toBe('Strona WordPress - kopia')
    expect(copy.tasks).toHaveLength(2)
    expect(copy.tasks[0].id).not.toBe(original.tasks[0].id)
  })
})
