import * as React from 'react'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className }: Props) {
  return <div className={clsx('container', className)}>{children}</div>
}
