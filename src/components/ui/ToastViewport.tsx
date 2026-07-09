import * as React from 'react'
import clsx from 'clsx'
import { subscribeToast, type ToastPayload } from '@/lib/toast'
import { CheckIcon, InfoIcon, XIcon } from '@/components/icons'

const DEFAULT_DURATION_MS = 3500

function toastStyles(type: ToastPayload['type']) {
  switch (type) {
    case 'success':
      return {
        icon: <CheckIcon className="h-4 w-4" />,
        border: 'border-success/40',
        iconBg: 'bg-success/15',
        iconText: 'text-success',
      }
    case 'error':
      return {
        icon: <XIcon className="h-4 w-4" />,
        border: 'border-danger/40',
        iconBg: 'bg-danger/15',
        iconText: 'text-danger',
      }
    default:
      return {
        icon: <InfoIcon className="h-4 w-4" />,
        border: 'border-primary/30',
        iconBg: 'bg-primary/15',
        iconText: 'text-primary',
      }
  }
}

export default function ToastViewport() {
  const [toasts, setToasts] = React.useState<ToastPayload[]>([])

  React.useEffect(() => {
    const unsub = subscribeToast((toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, 4))

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, DEFAULT_DURATION_MS)
    })

    return () => {
      unsub()
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed top-6 left-1/2 z-[60] w-full max-w-md -translate-x-1/2 space-y-3 px-4">
      {toasts.map((t) => {
        const s = toastStyles(t.type)
        return (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto flex items-center gap-3 rounded-2xl border bg-navy px-4 py-3 text-white shadow-soft',
              s.border,
            )}
          >
            <div className={clsx('inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', s.iconBg, s.iconText)}>
              {s.icon}
            </div>

            <div className="flex flex-1 items-center justify-center text-center text-sm font-semibold leading-6">{t.message}</div>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Dismiss"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
