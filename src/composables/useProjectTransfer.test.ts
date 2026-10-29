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

    // Zdarzenie musi pochodzić z input
    input.addEventListener('change', importProjects)
    input.dispatchEvent(new Event('change'))

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Nie udało się zaimportować danych', 'error')
    })

    expect(projects.value).toEqual([existingProject])
  })
})
