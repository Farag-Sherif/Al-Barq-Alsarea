import { Fragment } from 'react'
import clsx from 'clsx'

import SaudiRiyalSymbol from '@/components/ui/SaudiRiyalSymbol'
import { SAUDI_RIYAL_TEXT_TOKEN, toSaudiCurrencySymbolText } from '@/utils/format'

const BIDI_ISOLATES_REGEX = /[\u2068\u2069]/g

type Props = {
  text: string
  lang: 'ar' | 'en' | string
  className?: string
  iconClassName?: string
}

export default function CurrencyInlineText({ text, lang, className, iconClassName }: Props) {
  const normalizedText = toSaudiCurrencySymbolText(text, lang).replace(BIDI_ISOLATES_REGEX, '')
  const segments = normalizedText.split(SAUDI_RIYAL_TEXT_TOKEN)

  return (
    <span className={clsx('[unicode-bidi:plaintext]', className)} dir="auto">
      {segments.map((segment, index) => (
        <Fragment key={`segment-${index}`}>
          {segment}
          {index < segments.length - 1 ? (
            <SaudiRiyalSymbol className={clsx('mx-[0.08em] inline-block h-[0.9em] w-[0.9em] align-[-0.1em]', iconClassName)} />
          ) : null}
        </Fragment>
      ))}
    </span>
  )
}
