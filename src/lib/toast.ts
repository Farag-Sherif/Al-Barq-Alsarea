export type ToastType = 'success' | 'error' | 'info'

export type ToastPayload = {
  id: string
  type: ToastType
  message: string
}

type Listener = (toast: ToastPayload) => void

const listeners = new Set<Listener>()

function emit(type: ToastType, message: string) {
  const toast: ToastPayload = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    message,
  }

  listeners.forEach((l) => l(toast))
}

export const toast = {
  success(message: string) {
    emit('success', message)
  },
  error(message: string) {
    emit('error', message)
  },
  info(message: string) {
    emit('info', message)
  },
}

export function subscribeToast(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
