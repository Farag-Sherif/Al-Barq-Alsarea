import * as React from 'react'
import clsx from 'clsx'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  className?: string
}

export default function ToggleSwitch({ checked, onChange, label, className }: Props) {
  return (
    <label className={clsx('inline-flex items-center gap-3 cursor-pointer select-none', className)}>
      {label ? <span className="text-sm font-medium text-navy">{label}</span> : null}
      <span className="relative h-7 w-12">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 opacity-0 cursor-pointer"
        />
        <span className="absolute inset-0 rounded-full bg-border peer-checked:bg-primary/80 transition" />
        <span
          className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5"
          aria-hidden
        />
      </span>
    </label>
  )
}
