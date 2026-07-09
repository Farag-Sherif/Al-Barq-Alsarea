import * as React from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

import { lockBodyScroll, unlockBodyScroll } from '@/utils/bodyScrollLock'

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  overlayClassName?: string
  /** If true, clicking on the overlay will not close the modal */
  disableOverlayClose?: boolean
}

export default function Modal({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  disableOverlayClose,
}: Props) {
  React.useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)

    lockBodyScroll()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
      <div
        className={clsx('absolute inset-0 bg-black/40 backdrop-blur-[2px]', overlayClassName)}
        onClick={() => {
          if (!disableOverlayClose) onClose()
        }}
      />
      <div
        className={clsx(
          'relative isolate z-10 w-full overflow-hidden rounded-3xl bg-white shadow-soft max-sm:max-h-[calc(100dvh-1.5rem)] max-sm:!overflow-y-auto [&_[data-modal-close]]:z-[80]',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
