import { ref } from 'vue'

export function useTheme() {
  const savedTheme = localStorage.getItem('theme')

  const darkMode = ref(savedTheme === 'dark')

  function toggleTheme() {
    darkMode.value = !darkMode.value

    localStorage.setItem('theme', darkMode.value ? 'dark' : 'light')
  }

  return {
    darkMode,
    toggleTheme,
  }
}
