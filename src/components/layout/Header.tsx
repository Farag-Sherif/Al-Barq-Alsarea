import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import clsx from 'clsx'

import Container from './Container'
import Logo from './Logo'
import Button from '@/components/ui/Button'
import { resolveApiErrorMessage } from '@/api'
import { CartIcon, GlobeIcon, LogoutIcon, MenuIcon, UserIcon, XIcon, SearchIcon } from '@/components/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleMobileMenu } from '@/store/slices/uiSlice'
import { logoutThunk } from '@/store/thunks/authThunks'
import { useI18n } from '@/i18n/I18nProvider'
import { toast } from '@/lib/toast'

type Props = {
  variant?: 'light' | 'dark'
}

export default function Header({ variant = 'light' }: Props) {
  const dispatch = useAppDispatch()
  const mobileMenuOpen = useAppSelector((s) => s.ui.mobileMenuOpen)
  const auth = useAppSelector((s) => s.auth)
  const cartCount = useAppSelector((s) => s.cart.items.reduce((acc, i) => acc + i.quantity, 0))

  const { lang, t, toggleLang, dir } = useI18n()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const isDark = variant === 'dark'

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      if (mobileMenuOpen) {
        dispatch(toggleMobileMenu())
      }
    }
  }

  async function onLogout() {
    try {
      await dispatch(logoutThunk()).unwrap()
      toast.success(t('toast.logout'))
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, t('toast.failed')))
    }
  }

  function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          clsx(
            'text-base font-medium transition',
            isActive
              ? 'text-primary font-semibold'
              : isDark
                ? 'text-white/80 hover:text-white'
                : 'text-navy hover:text-primary',
          )
        }
      >
        {children}
      </NavLink>
    )
  }

  return (
    <header className={clsx(isDark ? 'bg-navy text-white' : 'bg-surface text-navy', 'sticky top-0 z-50 shadow-sm')}>
      <Container className="py-3 md:py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-6">
          {/* Start side (logo + nav) */}
          <div className="flex flex-1 items-center gap-4 md:gap-6 lg:gap-10">
            <Logo variant={isDark ? 'dark' : 'light'} size="md" />

            <nav className="hidden xl:flex items-center gap-8">
              <NavItem to="/home">{t('nav.home')}</NavItem>
              <NavItem to="/about">{t('nav.about')}</NavItem>
              <NavItem to="/restaurants?all=1">{t('nav.restaurants')}</NavItem>
              <NavItem to="/contact">{t('nav.contact')}</NavItem>
            </nav>

            <form 
              onSubmit={handleSearch} 
              className={clsx(
                "hidden sm:flex flex-1 max-w-[200px] md:max-w-xs relative",
                dir === 'rtl' ? 'mr-auto' : 'ml-auto'
              )}
            >
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن مطعم...' : 'Search for a restaurant...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  'w-full h-10 rounded-full border text-sm outline-none transition-colors',
                  dir === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10',
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40' 
                    : 'bg-screen border-border text-navy placeholder:text-muted focus:border-primary focus:bg-white'
                )}
                dir="auto"
              />
              <button 
                type="submit" 
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors",
                  dir === 'rtl' ? 'left-3' : 'right-3'
                )}
              >
                <SearchIcon size={18} className={isDark ? 'text-white/60' : 'text-muted'} />
              </button>
            </form>
          </div>

          {/* End side */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex items-center gap-2.5">
              <button
                type="button"
                className={clsx(
                  'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold tracking-tight shadow-input transition',
                  isDark ? 'border-white/20 bg-white/5 text-white/85 hover:bg-white/10' : 'border-border bg-white text-navy/85 hover:bg-screen',
                )}
                onClick={toggleLang}
              >
                <GlobeIcon size={18} className={isDark ? 'text-white' : 'text-navy'} />
                {lang === 'ar' ? t('lang.ar') : t('lang.en')}
              </button>

              <Link
                to="/cart"
                className={clsx(
                  'relative inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-input transition',
                  isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-border bg-white hover:bg-screen',
                )}
                aria-label={t('nav.cart')}
              >
                <CartIcon size={19} className={isDark ? 'text-white' : 'text-navy'} />
                {cartCount > 0 ? (
                  <span className="absolute -top-1 -start-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-extrabold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </div>

            {auth.user ? (
              <div className="hidden md:flex items-center gap-2.5 ps-1 md:gap-3 md:ps-2">
                <Link
                  to="/account"
                  className={clsx(
                    'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold tracking-tight shadow-input transition',
                    isDark
                      ? 'border-white/20 bg-white/5 text-white/85 hover:bg-white/10 hover:text-white'
                      : 'border-border bg-white text-navy/85 hover:bg-screen hover:text-primary',
                  )}
                >
                  <UserIcon size={18} />
                  {t('nav.account')}
                </Link>
                <Button
                  variant={isDark ? 'outlineOnDark' : 'outline'}
                  size="sm"
                  onClick={onLogout}
                  className="h-10 rounded-full px-4 text-[15px] font-semibold tracking-tight"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogoutIcon size={17} />
                    <span>{t('account.logout')}</span>
                  </span>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className={clsx('text-[15px] font-semibold tracking-tight hover:text-primary', isDark ? 'text-white' : 'text-navy')}>
                  {t('nav.login')}
                </Link>
                <Link to="/register">
                  <Button size="sm" className="h-10 rounded-full px-5 text-[15px] font-semibold tracking-tight">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}

            <button
              type="button"
              className={clsx(
                'inline-flex lg:hidden items-center justify-center rounded-2xl p-2 shadow-input',
                isDark ? 'border border-white/10 bg-white/5 text-white' : 'border border-border bg-white text-navy',
              )}
              onClick={() => dispatch(toggleMobileMenu())}
              aria-label="menu"
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen ? (
          <div
            className={clsx(
              'lg:hidden mt-4 rounded-2xl border p-4 shadow-card',
              isDark ? 'border-white/10 bg-navy text-white' : 'border-border bg-white text-navy',
            )}
          >
            <form 
              onSubmit={handleSearch} 
              className="relative mb-4 sm:hidden"
            >
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن مطعم...' : 'Search for a restaurant...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  'w-full h-11 rounded-full border text-sm outline-none transition-colors',
                  dir === 'rtl' ? 'pr-4 pl-10' : 'pl-4 pr-10',
                  isDark 
                    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40' 
                    : 'bg-screen border-border text-navy placeholder:text-muted focus:border-primary focus:bg-white'
                )}
                dir="auto"
              />
              <button 
                type="submit" 
                className={clsx(
                  "absolute top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors",
                  dir === 'rtl' ? 'left-3' : 'right-3'
                )}
              >
                <SearchIcon size={18} className={isDark ? 'text-white/60' : 'text-muted'} />
              </button>
            </form>

            <nav className="flex flex-col gap-3">
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive
                    ? 'text-base text-primary font-semibold'
                    : isDark
                      ? 'text-base font-medium text-white/80'
                      : 'text-base font-medium text-navy/80'
                }
                onClick={() => dispatch(toggleMobileMenu())}
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? 'text-base text-primary font-semibold'
                    : isDark
                      ? 'text-base font-medium text-white/80'
                      : 'text-base font-medium text-navy/80'
                }
                onClick={() => dispatch(toggleMobileMenu())}
              >
                {t('nav.about')}
              </NavLink>
              <NavLink
                to="/restaurants?all=1"
                className={({ isActive }) =>
                  isActive
                    ? 'text-base text-primary font-semibold'
                    : isDark
                      ? 'text-base font-medium text-white/80'
                      : 'text-base font-medium text-navy/80'
                }
                onClick={() => dispatch(toggleMobileMenu())}
              >
                {t('nav.restaurants')}
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive
                    ? 'text-base text-primary font-semibold'
                    : isDark
                      ? 'text-base font-medium text-white/80'
                      : 'text-base font-medium text-navy/80'
                }
                onClick={() => dispatch(toggleMobileMenu())}
              >
                {t('nav.contact')}
              </NavLink>
            </nav>

            <div
              className={clsx(
                'lg:hidden mt-4 border-t pt-4',
                isDark ? 'border-white/10 bg-navy/0 text-white' : 'border-border bg-white/0 text-navy',
              )}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-2 text-base font-medium transition hover:border-solid"
                    onClick={toggleLang}
                  >
                    <GlobeIcon />
                    {lang === 'ar' ? t('lang.ar') : t('lang.en')}
                  </button>

                  <Link
                    to="/cart"
                    className={clsx(
                      'relative inline-flex w-full items-center justify-center rounded-2xl px-3 py-2 text-base font-medium',
                      isDark ? 'border border-white/20 hover:bg-white/10' : 'border border-border hover:bg-screen',
                    )}
                    aria-label={t('nav.cart')}
                    onClick={() => dispatch(toggleMobileMenu())}
                  >
                    <CartIcon />
                    <span className="sr-only">{t('nav.cart')}</span>
                    {cartCount > 0 ? (
                      <span className="absolute -top-1 -start-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-extrabold text-white">
                        {cartCount}
                      </span>
                    ) : null}
                  </Link>
                </div>

                {auth.user ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      to="/account"
                      className="w-full text-center text-base font-medium hover:text-primary"
                      onClick={() => dispatch(toggleMobileMenu())}
                    >
                      {t('nav.account')}
                    </Link>
                    <Button
                      variant={isDark ? 'outlineOnDark' : 'outline'}
                      size="sm"
                      onClick={onLogout}
                      className="w-full rounded-2xl text-base"
                    >
                      {t('account.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      to="/login"
                      onClick={() => dispatch(toggleMobileMenu())}
                      className="w-full text-center text-base font-medium hover:text-primary"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link to="/register" onClick={() => dispatch(toggleMobileMenu())} className="w-full">
                      <Button size="sm" className="w-full rounded-2xl px-5 text-base">
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  )
}
