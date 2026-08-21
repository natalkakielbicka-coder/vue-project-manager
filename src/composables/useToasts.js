import { ref } from 'vue'

export function useToasts() {
  const toasts = ref([])

  function showToast(message, type = 'success') {
    const toast = {
      id: Date.now(),
      message,
      type,
    }

    toasts.value.push(toast)

    setTimeout(() => {
      toasts.value = toasts.value.filter((item) => item.id !== toast.id)
    }, 2500)
  }

  return {
    toasts,
    showToast,
  }
}
