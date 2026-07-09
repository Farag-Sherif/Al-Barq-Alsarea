import * as React from 'react'
import clsx from 'clsx'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode
  /** Trailing addon rendered on the inline-end side (RTL-aware). */
  leftAddon?: React.ReactNode
  /** Extra inline-end spacing (in px) reserved after measuring leftAddon width. */
  addonGap?: number
}

export default function Input({ icon, leftAddon, addonGap = 20, className, style, ...props }: Props) {
  const addonRef = React.useRef<HTMLSpanElement | null>(null)
  const [addonWidth, setAddonWidth] = React.useState(0)

  React.useLayoutEffect(() => {
    if (!leftAddon) {
      setAddonWidth(0)
      return
    }

    const node = addonRef.current
    if (!node) return

    const measure = () => {
      setAddonWidth(Math.ceil(node.getBoundingClientRect().width))
    }

    measure()

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(node)
    window.addEventListener('resize', measure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [leftAddon])

  const inputStyle: React.CSSProperties = leftAddon
    ? {
        ...style,
        paddingInlineEnd: `${Math.max(64, addonWidth + addonGap)}px`,
      }
    : (style ?? {})

  return (
    <div className="relative w-full">
      {icon ? (
        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
      ) : null}
      {leftAddon ? (
        <span ref={addonRef} className="absolute end-2 top-1/2 inline-flex -translate-y-1/2">
          {leftAddon}
        </span>
      ) : null}
      <input
        {...props}
        style={inputStyle}
        className={clsx(
          'h-12 w-full rounded-full border border-border bg-white text-start text-sm font-semibold outline-none transition focus:border-primary',
          icon ? 'ps-11' : 'ps-4',
          'pe-4',
          className,
        )}
      />
    </div>
  )
}
