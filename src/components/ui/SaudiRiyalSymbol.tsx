import type { SVGProps } from 'react'
import clsx from 'clsx'

type Props = SVGProps<SVGSVGElement> & {
  size?: number
}

export default function SaudiRiyalSymbol({ size, className, style, ...props }: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 80 80"
      fill="currentColor"
      aria-hidden="true"
      className={clsx(size ? '' : 'h-[1em] w-[1em]', className)}
      style={size ? { width: size, height: size, ...style } : style}
    >
      <path d="M21 8L31 0v50l-9 13V8z" />
      <path d="M47 14l9-7v53l-9 2V14z" />
      <path d="M4 39l74-14-2 10L2 49l2-10z" />
      <path d="M2 57l74-14-2 10L0 67l2-10z" />
      <path d="M47 71l30-6-2 10-31 5 3-9z" />
    </svg>
  )
}
