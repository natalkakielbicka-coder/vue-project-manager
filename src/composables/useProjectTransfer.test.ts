/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useProjectTransfer } from './useProjectTransfer'
import type { Project } from '../types/project'

describe('useProjectTransfer', () => {
  it('does not overwrite projects when JSON is invalid', async () => {
    const existingProject: Project = {
      id: 1,
      name: 'Strona WordPress',
      status: 'W trakcie',
      description: 'Projekt klienta',
      deadline: '2026-11-15',
      priority: 'Wysoki',
      tasks: [],
      createdAt: '2026-10-28T08:00:00.000Z',
      updatedAt: null,
    }

    const projects = ref<Project[]>([existingProject])
    const showToast = vi.fn()

    const { importProjects } = useProjectTransfer(projects, showToast)

    const input = document.createElement('input')
    input.type = 'file'

    const file = new File([JSON.stringify([{ id: 2, name: 'Błędny projekt' }])], 'projects.json', {
      type: 'application/json',
    })

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    })

    input.addEventListener('change', importProjects)
    input.dispatchEvent(new Event('change'))

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Nie udało się zaimportować danych', 'error')
    })

    expect(projects.value).toEqual([existingProject])
  })

  it('imports valid projects and replaces existing data', async () => {
    const existingProject: Project = {
      id: 1,
      name: 'Stary projekt',
      status: 'Do zrobienia',
      description: 'Projekt przed importem',
      deadline: '',
      priority: 'Średni',
      tasks: [],
      createdAt: '2026-10-01T08:00:00.000Z',
      updatedAt: null,
    }

    const importedProject: Project = {
      id: 2,
      name: 'Nowy projekt',
      status: 'W trakcie',
      description: 'Projekt z pliku JSON',
      deadline: '2026-11-15',
      priority: 'Wysoki',
      tasks: [
        {
          id: 10,
          name: 'Przygotować layout',
          completed: false,
        },
      ],
      createdAt: '2026-10-28T08:00:00.000Z',
      updatedAt: null,
    }

    const projects = ref<Project[]>([existingProject])
    const showToast = vi.fn()

    const { importProjects } = useProjectTransfer(projects, showToast)

    const input = document.createElement('input')
    input.type = 'file'

    const file = new File([JSON.stringify([importedProject])], 'projects.json', {
      type: 'application/json',
    })

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    })

    input.addEventListener('change', importProjects)
    input.dispatchEvent(new Event('change'))

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Dane zostały zaimportowane', 'success')
    })

    expect(projects.value).toEqual([importedProject])
    expect(projects.value).toHaveLength(1)
  })

  it('rejects malformed JSON without overwriting projects', async () => {
    const existingProject: Project = {
      id: 1,
      name: 'Strona WordPress',
      status: 'W trakcie',
      description: 'Projekt klienta',
      deadline: '2026-11-15',
      priority: 'Wysoki',
      tasks: [],
      createdAt: '2026-10-28T08:00:00.000Z',
      updatedAt: null,
    }

    const projects = ref<Project[]>([existingProject])
    const showToast = vi.fn()

    const { importProjects } = useProjectTransfer(projects, showToast)

    const input = document.createElement('input')
    input.type = 'file'

    const file = new File(['{ invalid json }'], 'broken.json', { type: 'application/json' })

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    })

    input.addEventListener('change', importProjects)
    input.dispatchEvent(new Event('change'))

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Nie udało się zaimportować danych', 'error')
    })

    expect(projects.value).toEqual([existingProject])
  })
})
