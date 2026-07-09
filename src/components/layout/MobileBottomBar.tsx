import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

import { CartIcon, HomeIcon, ListIcon, UserIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setMobileMenuOpen } from '@/store/slices/uiSlice'

type NavItemProps = {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
  badge?: number
  onClick?: () => void
}

function NavItem({ to, label, icon, end = false, badge = 0, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'relative inline-flex h-full flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-extrabold transition',
          isActive ? 'text-primary' : 'text-muted hover:text-navy',
        )
      }
    >
      <span className="relative inline-flex items-center justify-center">
        {icon}
        {badge > 0 ? (
          <span className="absolute -top-1 -start-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function MobileBottomBar() {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const auth = useAppSelector((s) => s.auth)
  const cartCount = useAppSelector((s) => s.cart.items.reduce((acc, i) => acc + i.quantity, 0))

  const accountPath = auth.user ? '/account' : '/login'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(9,22,44,0.08)] backdrop-blur md:hidden"
      aria-label="mobile bottom navigation"
    >
      <div className="grid h-[68px] grid-cols-4 gap-1">
        <NavItem
          to="/home"
          end
          label={t('nav.home')}
          icon={<HomeIcon className="h-5 w-5" />}
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />

        <NavItem
          to="/restaurants?all=1"
          label={t('nav.restaurants')}
          icon={<ListIcon className="h-5 w-5" />}
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />

        <NavItem
          to="/cart"
          label={t('nav.cart')}
          icon={<CartIcon className="h-5 w-5" />}
          badge={cartCount}
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />

        <NavItem
          to={accountPath}
          label={auth.user ? t('nav.account') : t('nav.login')}
          icon={<UserIcon className="h-5 w-5" />}
          onClick={() => dispatch(setMobileMenuOpen(false))}
        />
      </div>
    </nav>
  )
}

