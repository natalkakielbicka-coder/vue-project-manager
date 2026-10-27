import { ref } from 'vue'
import type { Toast, ToastType } from '../types/toast'

export function useToasts() {
  const toasts = ref<Toast[]>([])

  function showToast(message: string, type: ToastType = 'success'): void {
    const toast: Toast = {
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
