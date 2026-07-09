import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

import Container from '@/components/layout/Container'
import { MailIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'

type Section = {
  id: string
  title: string
  content: React.ReactNode
}

export default function PrivacyPage() {
  const { lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const [activeId, setActiveId] = useState('intro')
  const brandName =
    lang === 'ar'
      ? settings?.siteNameAr || settings?.siteName || 'البرق السريع'
      : settings?.siteName || settings?.siteNameAr || 'Albarq Al Saree'
  const supportEmail = settings?.contactEmail || 'support@albarqalsaree.com'

  const cmsPrivacyContent =
    lang === 'ar'
      ? settings?.privacyContentAr || settings?.privacyContent || ''
      : settings?.privacyContent || settings?.privacyContentAr || ''

  const meta = useMemo(
    () =>
      lang === 'ar'
        ? {
            breadcrumb: { home: 'الرئيسية', current: 'سياسة الخصوصية' },
            title: 'سياسة الخصوصية',
            subtitle:
              `نحن في ${brandName} نأخذ خصوصيتك على محمل الجد. توضح هذه الوثيقة كيف نقوم بجمع واستخدام وحماية معلوماتك الشخصية.`,
            updatedAt: 'آخر تحديث: 25 أكتوبر 2023',
            toc: 'المحتويات',
            helpTitle: 'هل لديك أسئلة؟',
            helpBody: 'فريق الدعم متاح على مدار الساعة للإجابة على استفسارات الخصوصية.',
            helpCta: 'تواصل مع الدعم',
          }
        : {
            breadcrumb: { home: 'Home', current: 'Privacy Policy' },
            title: 'Privacy Policy',
            subtitle:
              `At ${brandName}, we take your privacy seriously. This document explains how we collect, use, and protect your personal information.`,
            updatedAt: 'Last updated: Oct 25, 2023',
            toc: 'Contents',
            helpTitle: 'Have questions?',
            helpBody: 'Support is available 24/7 to answer privacy-related questions.',
            helpCta: 'Contact support',
          },
    [lang, brandName],
  )

  const sections: Section[] = useMemo(
    () =>
      lang === 'ar'
        ? [
            {
              id: 'intro',
              title: '١. مقدمة',
              content: (
                <p className="text-base leading-8 text-muted">
                  توضح هذه السياسة أنواع المعلومات التي نجمعها عند استخدامك لخدماتنا، وكيفية استخدامها، والخيارات
                  المتاحة لك للتحكم في بياناتك.
                </p>
              ),
            },
            {
              id: 'collect',
              title: '٢. جمع البيانات',
              content: (
                <ul className="list-disc ps-5 text-base leading-8 text-muted">
                  <li>
                    <span className="font-extrabold text-navy">المعلومات الشخصية:</span> الاسم، البريد الإلكتروني، رقم
                    الهاتف، وعنوان التوصيل.
                  </li>
                  <li>
                    <span className="font-extrabold text-navy">معلومات الدفع:</span> تفاصيل البطاقات والمحافظ الرقمية
                    (يتم التعامل معها بشكل آمن ومشفر قدر الإمكان).
                  </li>
                  <li>
                    <span className="font-extrabold text-navy">بيانات الاستخدام:</span> سجل الطلبات، المطاعم المفضلة،
                    وتقييمات الخدمة.
                  </li>
                </ul>
              ),
            },
            {
              id: 'use',
              title: '٣. كيف نستخدم المعلومات',
              content: (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">معالجة الطلبات</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      توصيل الطعام إلى موقعك بدقة، وإبلاغك بحالة الطلب والوقت المتوقع.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">التخصيص</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      تقديم توصيات مناسبة بناءً على تفضيلاتك السابقة.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">دعم العملاء</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      الرد على استفساراتك وحل المشاكل المتعلقة بالطلبات.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">الأمان والحماية</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      الكشف عن الاحتيال ومنع إساءة استخدام خدماتنا.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'cookies',
              title: '٤. ملفات تعريف الارتباط (Cookies)',
              content: (
                <div className="space-y-4">
                  <p className="text-base leading-8 text-muted">
                    نستخدم ملفات تعريف الارتباط وتقنيات تتبع مشابهة لتحسين الأداء وتخصيص التجربة.
                  </p>
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                    <div className="text-sm font-extrabold text-navy">ملاحظة</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      يمكنك ضبط إعدادات المتصفح لرفض ملفات الارتباط. قد يؤثر ذلك على بعض وظائف الموقع.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'security',
              title: '٥. أمن البيانات',
              content: (
                <p className="text-base leading-8 text-muted">
                  نستخدم إجراءات أمنية معقولة لحماية بياناتك. لا توجد وسيلة نقل عبر الإنترنت آمنة بنسبة 100%، لكننا
                  نسعى لاستخدام أفضل الممارسات المتاحة لحماية البيانات الحساسة أثناء النقل.
                </p>
              ),
            },
            {
              id: 'contact',
              title: '٦. تواصل معنا',
              content: (
                <div className="rounded-3xl border border-border bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-navy">لديك مخاوف بشأن الخصوصية؟</div>
                      <div className="mt-1 text-sm text-muted">فريق حماية البيانات جاهز للرد على استفساراتك.</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-navy">
                      {supportEmail}
                      <MailIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ),
            },
          ]
        : [
            {
              id: 'intro',
              title: '1. Introduction',
              content: (
                <p className="text-base leading-8 text-muted">
                  This policy describes what information we collect, how we use it, and what choices you have to
                  control your data.
                </p>
              ),
            },
            {
              id: 'collect',
              title: '2. Data Collection',
              content: (
                <ul className="list-disc ps-5 text-base leading-8 text-muted">
                  <li>
                    <span className="font-extrabold text-navy">Personal info:</span> name, email, phone, and delivery
                    address.
                  </li>
                  <li>
                    <span className="font-extrabold text-navy">Payment info:</span> card/wallet details (handled as
                    securely as possible).
                  </li>
                  <li>
                    <span className="font-extrabold text-navy">Usage data:</span> order history, favorites, and
                    ratings.
                  </li>
                </ul>
              ),
            },
            {
              id: 'use',
              title: '3. How we use information',
              content: (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">Order processing</div>
                    <p className="mt-2 text-sm leading-7 text-muted">Delivering your order accurately and on time.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">Personalization</div>
                    <p className="mt-2 text-sm leading-7 text-muted">Recommendations based on your preferences.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">Customer support</div>
                    <p className="mt-2 text-sm leading-7 text-muted">Responding to inquiries and resolving issues.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-navy">Security</div>
                    <p className="mt-2 text-sm leading-7 text-muted">Detecting fraud and preventing misuse.</p>
                  </div>
                </div>
              ),
            },
            {
              id: 'cookies',
              title: '4. Cookies',
              content: (
                <div className="space-y-4">
                  <p className="text-base leading-8 text-muted">
                    We use cookies and similar tracking technologies to improve performance and personalize your
                    experience.
                  </p>
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                    <div className="text-sm font-extrabold text-navy">Note</div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      You can configure your browser to refuse cookies. This may impact some site functionality.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'security',
              title: '5. Data security',
              content: (
                <p className="text-base leading-8 text-muted">
                  We use reasonable security measures to protect your data. No transmission over the internet is 100%
                  secure, but we follow best practices to safeguard sensitive information.
                </p>
              ),
            },
            {
              id: 'contact',
              title: '6. Contact us',
              content: (
                <div className="rounded-3xl border border-border bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-base font-semibold text-navy">Privacy concerns?</div>
                      <div className="mt-1 text-sm text-muted">Our data protection team is here to help.</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-navy">
                      {supportEmail}
                      <MailIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ),
            },
          ],
    [lang, supportEmail],
  )

  const displayedSections: Section[] = useMemo(() => {
    if (!cmsPrivacyContent.trim()) return sections

    return [
      {
        id: 'cms-privacy',
        title: lang === 'ar' ? 'محتوى سياسة الخصوصية' : 'Privacy Content',
        content: <div className="whitespace-pre-line text-base leading-8 text-muted md:text-[1.0625rem]">{cmsPrivacyContent}</div>,
      },
    ]
  }, [cmsPrivacyContent, lang, sections])

  useEffect(() => {
    if (!displayedSections.length) return
    setActiveId(displayedSections[0].id)
  }, [displayedSections])

  useEffect(() => {
    const elements = displayedSections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]
        if (visible?.target?.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0.1, 0.25, 0.5] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [displayedSections])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative overflow-hidden bg-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(1100px_380px_at_50%_-120px,rgba(255,103,40,0.22),transparent_70%)]" />

      <div className="bg-primary/10">
        <Container className="py-5">
          <div className="text-sm font-bold text-muted">
            <Link to="/home" className="hover:text-primary">
              {meta.breadcrumb.home}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-navy">{meta.breadcrumb.current}</span>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="rounded-[32px] border border-primary/20 bg-white px-6 py-7 shadow-card md:px-10 md:py-10">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-extrabold text-primary">
            {meta.breadcrumb.current}
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-navy md:text-5xl">{meta.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-muted md:text-[1.0625rem]">{meta.subtitle}</p>
          <div className="mt-4 text-sm font-semibold text-muted">{meta.updatedAt}</div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-border bg-white/95 p-5 shadow-card backdrop-blur-sm">
              <div className="text-sm font-semibold text-navy">{meta.toc}</div>
              <div className="mt-4 space-y-2">
                {displayedSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition',
                      activeId === s.id ? 'bg-primary/15 text-navy' : 'text-muted hover:bg-screen hover:text-navy',
                    )}
                    onClick={() => {
                      setActiveId(s.id)
                      scrollTo(s.id)
                    }}
                  >
                    <span className="text-start">{s.title}</span>
                    <span className="text-xs text-muted-2">#</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/[0.08] p-5 shadow-card">
              <div className="text-sm font-semibold text-navy">{meta.helpTitle}</div>
              <p className="mt-2 text-sm leading-7 text-muted">{meta.helpBody}</p>

              <div className="mt-4 space-y-2.5">
                <Link
                  to="/contact"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-soft transition hover:brightness-105"
                >
                  {meta.helpCta}
                </Link>
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-screen"
                >
                  <MailIcon className="h-4 w-4" />
                  {supportEmail}
                </a>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {displayedSections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className={clsx(
                  'scroll-mt-28 rounded-3xl border bg-white p-6 shadow-card transition md:p-7',
                  activeId === s.id ? 'border-primary/35 ring-1 ring-primary/20' : 'border-border',
                )}
              >
                <h2 className="text-xl font-semibold text-navy">{s.title}</h2>
                <div className="mt-4">{s.content}</div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
