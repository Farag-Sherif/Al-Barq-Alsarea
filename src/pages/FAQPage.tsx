import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

import * as api from '@/api'
import Container from '@/components/layout/Container'
import { ChevronDownIcon, SearchIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'

type LocalizedFaq = {
  id: string
  q: string
  a: string
  order: number
}

export default function FAQPage() {
  const { lang } = useI18n()

  const [faqs, setFaqs] = useState<api.Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    api
      .getFaqs()
      .then((rows) => {
        if (!active) return
        setFaqs(rows)
      })
      .catch((err) => {
        if (!active) return
        setError(
          api.resolveApiErrorMessage(
            err,
            lang === 'ar' ? 'تعذر تحميل الأسئلة الشائعة.' : 'Failed to load FAQs.',
          ),
        )
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [lang, reloadTick])

  const localizedFaqs = useMemo<LocalizedFaq[]>(() => {
    return faqs
      .filter((item) => item.isActive)
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
      .map((item) => {
        const q = lang === 'ar' ? item.questionAr || item.question : item.question || item.questionAr
        const a = lang === 'ar' ? item.answerAr || item.answer : item.answer || item.answerAr
        return {
          id: item.id,
          q: q.trim(),
          a: a.trim(),
          order: item.order,
        }
      })
      .filter((item) => item.q && item.a)
  }, [faqs, lang])

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return localizedFaqs
    return localizedFaqs.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
  }, [localizedFaqs, query])

  useEffect(() => {
    if (!filteredFaqs.length) {
      setOpenId(null)
      return
    }
    setOpenId((current) => (current && filteredFaqs.some((item) => item.id === current) ? current : filteredFaqs[0].id))
  }, [filteredFaqs])

  return (
    <div className="bg-screen">
      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">
              {lang === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</span>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-3xl border border-border bg-white p-6 shadow-card md:p-8">
            <h1 className="text-3xl font-semibold text-navy md:text-4xl">
              {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-7 text-muted md:text-base">
              {lang === 'ar'
                ? 'الأسئلة المعروضة أدناه يتم جلبها مباشرة من واجهة API.'
                : 'The questions below are loaded directly from the API.'}
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-screen/40 px-4 py-3">
              <label className="flex items-center gap-3">
                <SearchIcon className="h-5 w-5 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث داخل الأسئلة والإجابات...' : 'Search in questions and answers...'}
                  className="h-10 w-full bg-transparent text-sm font-semibold text-navy outline-none placeholder:text-muted"
                />
              </label>
            </div>
          </section>

          <section className="mt-6 space-y-3">
            {loading ? (
              <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-card">
                <p className="text-sm font-semibold text-muted">{lang === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading FAQs...'}</p>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-danger/30 bg-white p-8 text-center shadow-card">
                <p className="text-sm font-semibold text-danger">{error}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-soft"
                  onClick={() => setReloadTick((v) => v + 1)}
                >
                  {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : filteredFaqs.length ? (
              filteredFaqs.map((item, index) => {
                const open = openId === item.id
                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-border bg-white shadow-card transition hover:border-primary/35"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 px-5 py-5 text-start"
                      onClick={() => setOpenId(open ? null : item.id)}
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-base font-extrabold leading-7 text-navy">{item.q}</span>
                      <ChevronDownIcon className={clsx('h-5 w-5 shrink-0 text-primary transition', open && 'rotate-180')} />
                    </button>

                    <div
                      className={clsx(
                        'grid transition-all duration-300 ease-out',
                        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-border/80 px-5 pb-5 pt-4 ps-[3.5rem] text-sm font-semibold leading-8 text-muted">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-white p-8 text-center shadow-card">
                <p className="text-lg font-black text-navy">{lang === 'ar' ? 'لا توجد أسئلة متاحة حالياً' : 'No FAQs available right now'}</p>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center shadow-card">
            <p className="text-lg font-black text-navy">{lang === 'ar' ? 'هل تحتاج مساعدة إضافية؟' : 'Need extra help?'}</p>
            <p className="mt-2 text-sm font-semibold leading-7 text-muted">
              {lang === 'ar'
                ? 'يمكنك التواصل مع فريق الدعم مباشرة من صفحة التواصل.'
                : 'You can contact the support team directly from the contact page.'}
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-soft"
            >
              {lang === 'ar' ? 'الانتقال لصفحة التواصل' : 'Go to Contact Page'}
            </Link>
          </section>
        </div>
      </Container>
    </div>
  )
}
