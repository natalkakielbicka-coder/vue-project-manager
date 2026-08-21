export function useProjectTransfer(projects, showToast) {
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

  function importProjects(event) {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const importedProjects = JSON.parse(reader.result)

        if (!Array.isArray(importedProjects)) {
          throw new Error('Nieprawidłowy format pliku')
        }

        projects.value = importedProjects

        showToast('Dane zostały zaimportowane', 'success')
      } catch {
        showToast('Nie udało się zaimportować danych', 'error')
      }

      event.target.value = ''
    }

    reader.readAsText(file)
  }

  return {
    exportProjects,
    importProjects,
  }
}
