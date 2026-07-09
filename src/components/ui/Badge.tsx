import * as React from 'react'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Badge({ children, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-navy/90 px-4 py-2 text-sm font-bold text-white shadow-soft',
        className,
      )}
    >
      {children}
    </span>
  )
}
