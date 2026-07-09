import clsx from 'clsx'

import SaudiRiyalSymbol from '@/components/ui/SaudiRiyalSymbol'
import { getCurrencyDisplayParts } from '@/utils/format'

type Props = {
  amount: number
  lang: 'ar' | 'en' | string
  currencyLabel?: string
  className?: string
  numberClassName?: string
  iconClassName?: string
}

export default function CurrencyAmount({
  amount,
  lang,
  currencyLabel,
  className,
  numberClassName,
  iconClassName,
}: Props) {
  const parts = getCurrencyDisplayParts(amount, lang, currencyLabel)
  const sign = parts.isNegative ? '- ' : ''

  const currencyNode = parts.isSaudiCurrency ? (
    <SaudiRiyalSymbol className={clsx('h-[0.95em] w-[0.95em] shrink-0', iconClassName)} />
  ) : (
    <span className={iconClassName}>{parts.currencyLabel}</span>
  )

  return (
    <span className={clsx('inline-flex items-center gap-1 whitespace-nowrap [unicode-bidi:isolate]', className)} dir="auto">
      {parts.currencyPosition === 'before' ? currencyNode : null}
      <span className={numberClassName}>{`${sign}${parts.numberText}`}</span>
      {parts.currencyPosition === 'after' ? currencyNode : null}
    </span>
  )
}
