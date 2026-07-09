import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Container from '@/components/layout/Container'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppSelector } from '@/store/hooks'

type Section = {
  id: string
  title: string
  icon?: React.ReactNode
  content: React.ReactNode
}

export default function TermsPage() {
  const { lang } = useI18n()
  const settings = useAppSelector((state) => state.settings.data)
  const [activeId, setActiveId] = useState('accept')
  const brandName =
    lang === 'ar'
      ? settings?.siteNameAr || settings?.siteName || 'البرق السريع'
      : settings?.siteName || settings?.siteNameAr || 'Albarq Al Saree'

  const cmsTermsContent =
    lang === 'ar'
      ? settings?.termsContentAr || settings?.termsContent || ''
      : settings?.termsContent || settings?.termsContentAr || ''

  const meta = useMemo(
    () =>
      lang === 'ar'
        ? {
            breadcrumb: { home: 'الرئيسية', current: 'الشروط والأحكام' },
            title: 'الشروط والأحكام',
            updatedAt: 'آخر تحديث: 20 مايو 2024',
            toc: 'محتويات الصفحة',
          }
        : {
            breadcrumb: { home: 'Home', current: 'Terms & Conditions' },
            title: 'Terms & Conditions',
            updatedAt: 'Last updated: May 20, 2024',
            toc: 'On this page',
          },
    [lang],
  )

  const sections: Section[] = useMemo(
    () =>
      lang === 'ar'
        ? [
            {
              id: 'accept',
              title: '١. قبول الشروط',
              content: (
                <p className="text-base leading-8 text-muted">
                  {`بمجرد استخدامك لمنصة ${brandName} فأنت توافق على الالتزام بجميع الشروط والأحكام المنصوص عليها في هذه`}
                  الصفحة. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى التوقف عن استخدام الموقع أو التطبيق فوراً.
                  نحتفظ بالحق في تحديث هذه الشروط في أي وقت دون إشعار مسبق.
                </p>
              ),
            },
            {
              id: 'account',
              title: '٢. حساب المستخدم',
              content: (
                <div className="space-y-3 text-base leading-8 text-muted">
                  <p>
                    للوصول إلى بعض مزايا خدمتنا، قد تحتاج إلى إنشاء حساب. أنت مسؤول عن الحفاظ على سرية معلومات حسابك
                    وكلمة المرور الخاصة بك.
                  </p>
                  <ul className="list-disc ps-5">
                    <li>يجب أن تكون المعلومات المقدمة دقيقة ومحدثة دائماً.</li>
                    <li>يمنع استخدام حسابات الغير دون إذن صريح.</li>
                    <li>يحق للمنصة تعليق أو إغلاق الحساب في حال الاشتباه في نشاط احتيالي.</li>
                  </ul>
                </div>
              ),
            },
            {
              id: 'orders',
              title: '٣. الطلبات والدفع',
              content: (
                <div className="space-y-5">
                  <p className="text-base leading-8 text-muted">
                    عند تقديم طلب عبر منصتنا، أنت توافق على دفع قيمة الطلب ورسوم التوصيل والضرائب المطبقة. تتم معالجة
                    الطلبات وفقاً لتوافر المنتجات لدى المطعم.
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                      <div className="text-sm font-extrabold">تأكيد الطلب</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        يتم تأكيد الطلب بعد الضغط على زر التأكيد. ستصلك رسالة تتضمن رقم الطلب ووقت الوصول المتوقع.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                      <div className="text-sm font-semibold text-navy">وسائل الدفع</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        نقبل الدفع بالبطاقات الائتمانية، Apple Pay، والدفع عند الاستلام (في المناطق المحددة).
                      </p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'cancellation',
              title: '٤. الإلغاء والاسترجاع',
              content: (
                <div className="space-y-4">
                  <p className="text-base leading-8 text-muted">
                    نحن نسعى لضمان رضاكم، ولكن هناك ضوابط لعملية الإلغاء. تختلف سياسة الإلغاء بحسب حالة الطلب.
                  </p>
                  <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                    <div className="border-s-4 border-primary ps-4">
                      <div className="text-sm font-semibold text-navy">سياسة الإلغاء:</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        يمكنك إلغاء الطلب خلال دقائق محدودة من وقت الطلب. بعد بدء تجهيز الطلب، قد يتم فرض رسوم إلغاء
                        كاملة.
                      </p>
                    </div>
                  </div>
                  <p className="text-base leading-8 text-muted">
                    في حال وجود خطأ في الطلب أو تأخر غير مبرر، يرجى التواصل مع فريق الدعم فوراً.
                  </p>
                </div>
              ),
            },
            {
              id: 'privacy',
              title: '٥. الخصوصية والبيانات',
              content: (
                <div className="space-y-3 text-base leading-8 text-muted">
                  <p>
                    نلتزم بحماية بياناتك الشخصية. يوضح قسم سياسة الخصوصية كيف نجمع بياناتك ونستخدمها ونحميها.
                  </p>
                  <p>
                    باستخدامك لخدماتنا، فأنت توافق على جمع ومعالجة البيانات وفقاً لسياسة الخصوصية الخاصة بنا.
                  </p>
                </div>
              ),
            },
          ]
        : [
            {
              id: 'accept',
              title: '1. Acceptance of Terms',
              content: (
                <p className="text-base leading-8 text-muted">
                  {`By using the ${brandName} platform, you agree to comply with these Terms & Conditions. If you do not agree`}
                  with any part of these terms, please stop using the website or the app. We may update these terms at
                  any time.
                </p>
              ),
            },
            {
              id: 'account',
              title: '2. User Account',
              content: (
                <div className="space-y-3 text-base leading-8 text-muted">
                  <p>
                    To access some features, you may need to create an account. You are responsible for maintaining the
                    confidentiality of your account information.
                  </p>
                  <ul className="list-disc ps-5">
                    <li>Information must be accurate and up to date.</li>
                    <li>Do not use someone else's account without permission.</li>
                    <li>We may suspend accounts in case of suspected fraud.</li>
                  </ul>
                </div>
              ),
            },
            {
              id: 'orders',
              title: '3. Orders & Payments',
              content: (
                <div className="space-y-5">
                  <p className="text-base leading-8 text-muted">
                    When you place an order, you agree to pay the order value, delivery fees, and applicable taxes.
                    Orders are processed based on restaurant availability.
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                      <div className="text-sm font-extrabold">Order confirmation</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        Your order is confirmed after you click the confirm button. You will receive an order number and
                        an estimated delivery time.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                      <div className="text-sm font-semibold text-navy">Payment methods</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        We accept cards, Apple Pay, and Cash on Delivery (in selected areas).
                      </p>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: 'cancellation',
              title: '4. Cancellation & Refunds',
              content: (
                <div className="space-y-4">
                  <p className="text-base leading-8 text-muted">
                    We aim to ensure your satisfaction. Cancellation policies may vary depending on the order status.
                  </p>
                  <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                    <div className="border-s-4 border-primary ps-4">
                      <div className="text-sm font-semibold text-navy">Cancellation policy:</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        You may cancel within a limited time after placing the order. Once the restaurant starts
                        preparing, a full cancellation fee may apply.
                      </p>
                    </div>
                  </div>
                  <p className="text-base leading-8 text-muted">
                    If there is a mistake or an unreasonable delay, please contact support.
                  </p>
                </div>
              ),
            },
            {
              id: 'privacy',
              title: '5. Privacy & Data',
              content: (
                <div className="space-y-3 text-base leading-8 text-muted">
                  <p>
                    We are committed to protecting your personal data. Please review our Privacy Policy to understand how
                    we collect and use information.
                  </p>
                  <p>By using our services, you agree to data processing as described in the Privacy Policy.</p>
                </div>
              ),
            },
          ],
    [lang, brandName],
  )

  const displayedSections: Section[] = useMemo(() => {
    if (!cmsTermsContent.trim()) return sections

    return [
      {
        id: 'cms-terms',
        title: lang === 'ar' ? 'محتوى الشروط والأحكام' : 'Terms Content',
        content: <div className="whitespace-pre-line text-base leading-8 text-muted md:text-[1.0625rem]">{cmsTermsContent}</div>,
      },
    ]
  }, [cmsTermsContent, lang, sections])

  useEffect(() => {
    if (!displayedSections.length) return
    setActiveId(displayedSections[0].id)
  }, [displayedSections])

  useEffect(() => {
    const ids = displayedSections.map((s) => s.id)

    const elements = ids
      .map((id) => document.getElementById(id))
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
    <div className="relative bg-screen">
      {/* Breadcrumb */}
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

      {/* Hero */}
      <Container className="py-12">
        <div>
          <h1 className="text-3xl font-semibold text-navy md:text-5xl">{meta.title}</h1>
          <div className="mt-2 text-sm font-semibold text-muted">{meta.updatedAt}</div>
        </div>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row">
          {/* Sidebar (placed first so it appears on start side depending on RTL/LTR) */}
          <aside className="w-full lg:w-[320px]">
            <div className="rounded-3xl border border-border bg-white p-5 shadow-card">
              <div className="text-sm font-extrabold">{meta.toc}</div>
              <div className="mt-4 space-y-2">
                {displayedSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={
                      'flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition ' +
                      (activeId === s.id ? 'bg-primary/15 text-navy' : 'text-muted hover:bg-screen hover:text-navy')
                    }
                    onClick={() => {
                      setActiveId(s.id)
                      scrollTo(s.id)
                    }}
                  >
                    <span className="text-start">{s.title}</span>
                    <span className="text-xs text-navy/40">#</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {displayedSections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 rounded-3xl border border-border bg-white p-6 shadow-card">
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
