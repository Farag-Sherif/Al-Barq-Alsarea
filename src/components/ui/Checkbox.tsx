import * as React from 'react'
import { CheckIcon } from '@/components/icons'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  className?: string
}

export default function Checkbox({ checked, onChange, label, className }: Props) {
  return (
    <label className={['inline-flex items-center gap-3 cursor-pointer select-none', className].filter(Boolean).join(' ')}>
      <span className="relative h-5 w-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <span className="absolute inset-0 rounded-md border border-border-2 bg-white peer-checked:border-primary peer-checked:bg-primary" />
        <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
          <CheckIcon size={14} />
        </span>
      </span>

      {label ? <span className="text-sm text-navy/80">{label}</span> : null}
    </label>
  )
}
