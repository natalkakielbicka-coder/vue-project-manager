import type { Ref } from 'vue'
import type { Project } from '../types/project'
import type { ToastType } from '../types/toast'

export function useProjectTransfer(
  projects: Ref<Project[]>,
  showToast: (message: string, type?: ToastType) => void,
) {
  function exportProjects() {
    const data = JSON.stringify(projects.value, null, 2)

    const blob = new Blob([data], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'projects.json'

    link.click()

    URL.revokeObjectURL(url)

    showToast('Dane zostały wyeksportowane', 'success')
  }

  function importProjects(event: Event): void {
    const input = event.target

    if (!(input instanceof HTMLInputElement)) {
      return
    }

    const file = input.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') {
          throw new Error('Nieprawidłowa zawartość pliku')
        }

        const importedProjects: unknown = JSON.parse(reader.result)

        if (!Array.isArray(importedProjects)) {
          throw new Error('Nieprawidłowy format pliku')
        }

        projects.value = importedProjects

        showToast('Dane zostały zaimportowane', 'success')
      } catch {
        showToast('Nie udało się zaimportować danych', 'error')
      }

      input.value = ''
    }

    reader.readAsText(file)
  }

  return {
    exportProjects,
    importProjects,
  }
}
