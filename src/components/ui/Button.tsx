import * as React from 'react'
import clsx from 'clsx'

export type ButtonVariant = 'primary' | 'outline' | 'outlineOnDark' | 'ghost' | 'dark'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  paddingNone?: boolean
  // Backward-compat for previous typo usage.
  paddingNoe?: boolean
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-11 text-sm rounded-xl',
  md: 'h-12 text-sm rounded-2xl',
  lg: 'h-14 text-base rounded-2xl',
}

const sizePaddingClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-4',
  md: 'px-5',
  lg: 'px-6',
}

const sizeNoPaddingClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-auto p-0',
  md: 'h-auto p-0',
  lg: 'h-auto p-0',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:brightness-110 hover:shadow-md active:brightness-95 transition-all duration-200 focus-visible:ring-primary',
  outline:
    'bg-white border border-border text-navy hover:bg-screen hover:border-primary/40 active:bg-screen/70 transition-all duration-200 focus-visible:ring-primary',
  outlineOnDark:
    'bg-white/0 border border-white/15 text-white hover:bg-white/15 hover:border-white/25 active:bg-white/5 transition-all duration-200 focus-visible:ring-primary',
  ghost:
    'bg-transparent text-navy hover:bg-screen hover:text-primary active:bg-screen/70 transition-all duration-200 focus-visible:ring-primary',
  dark:
    'bg-navy text-white hover:brightness-110 hover:shadow-md active:brightness-95 transition-all duration-200 focus-visible:ring-navy',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  paddingNone,
  paddingNoe,
  ...props
}: Props) {
  const hasNoPadding = Boolean(paddingNone || paddingNoe)

  return (
      <button
        type={type}
        className={clsx(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-screen disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed',
          sizeClasses[size],
          hasNoPadding ? sizeNoPaddingClasses[size] : sizePaddingClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      />
  )
}
