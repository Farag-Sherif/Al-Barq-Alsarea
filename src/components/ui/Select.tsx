import * as React from 'react'
import clsx from 'clsx'
import { ChevronDownIcon } from '@/components/icons'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

type SelectOption = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export default function Select({
  label,
  className,
  children,
  value,
  defaultValue,
  disabled,
  name,
  onChange,
  ...props
}: Props) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const nativeSelectRef = React.useRef<HTMLSelectElement | null>(null)
  const listboxId = React.useId()
  const isControlled = value !== undefined
  const [open, setOpen] = React.useState(false)

  const options = React.useMemo<SelectOption[]>(() => {
    const parsed: SelectOption[] = []

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child) || child.type !== 'option') return
      const optionValue = child.props.value ?? ''
      parsed.push({
        value: String(optionValue),
        label: child.props.children,
        disabled: Boolean(child.props.disabled),
      })
    })

    return parsed
  }, [children])

  const [internalValue, setInternalValue] = React.useState<string>(() => {
    if (defaultValue !== undefined) return String(defaultValue)
    return options.find((option) => !option.disabled)?.value ?? ''
  })

  React.useEffect(() => {
    if (!isControlled && options.length > 0 && !options.some((option) => option.value === internalValue)) {
      setInternalValue(options.find((option) => !option.disabled)?.value ?? '')
    }
  }, [internalValue, isControlled, options])

  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const selectedValue = isControlled ? String(value ?? '') : internalValue
  const selectedOption =
    options.find((option) => option.value === selectedValue) ??
    options.find((option) => !option.disabled) ??
    null

  const triggerChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) setInternalValue(nextValue)

      const node = nativeSelectRef.current
      if (node) {
        node.value = nextValue
        node.dispatchEvent(new Event('change', { bubbles: true }))
      }
    },
    [isControlled],
  )

  const selectButtonClassName = clsx(
    'h-12 min-w-[180px] w-full rounded-full border border-border bg-white px-4 pe-11 text-sm font-semibold text-navy shadow-input outline-none transition',
    'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
    'disabled:cursor-not-allowed disabled:bg-screen disabled:text-muted',
    className,
  )

  return (
    <label className="flex items-center gap-3">
      {label ? <span className="text-sm font-medium text-navy">{label}</span> : null}
      <div ref={rootRef} className="relative min-w-[180px] flex-1">
        <select
          ref={nativeSelectRef}
          value={selectedValue}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={onChange}
          name={name}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {children}
        </select>

        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={selectButtonClassName}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="block truncate text-start">{selectedOption?.label ?? ''}</span>
        </button>

        <span
          className={clsx(
            'pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-navy transition-transform',
            open ? 'rotate-180' : '',
          )}
        >
          <ChevronDownIcon />
        </span>

        {open ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute inset-x-0 z-50 mt-2 max-h-60 overflow-auto rounded-2xl border border-border bg-white p-1 shadow-card"
          >
            {options.map((option) => {
              const isSelected = option.value === selectedValue
              return (
                <button
                  key={option.value || '__empty'}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => {
                    if (option.disabled) return
                    triggerChange(option.value)
                    setOpen(false)
                  }}
                  className={clsx(
                    'w-full rounded-xl px-3 py-2 text-start text-sm font-semibold transition',
                    option.disabled ? 'cursor-not-allowed text-muted/70' : 'text-navy hover:bg-primary/10',
                    isSelected ? 'bg-primary text-white hover:bg-primary' : '',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </label>
  )
}
