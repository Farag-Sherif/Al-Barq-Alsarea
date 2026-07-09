import { useState } from 'react'
import clsx from 'clsx'
import { ChevronDownIcon } from '@/components/icons'

export default function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-6">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 rounded-full"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-navy">{title}</span>
        <span className="inline-flex h-6 w-10 items-center justify-center rounded-full bg-navy text-white">
          <ChevronDownIcon className={clsx('transition', open ? 'rotate-180' : '')} />
        </span>
      </button>

      {open ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
