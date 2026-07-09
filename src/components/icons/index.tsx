import type { SVGProps, CSSProperties } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  /** Icon size in px (overrides default 20px). */
  size?: number
}

const base = 'h-5 w-5'

function cls(baseCls: string, extra?: string) {
  return extra ? `${baseCls} ${extra}` : baseCls
}

function iconClass(size: number | undefined, className?: string) {
  const baseCls = size ? '' : base
  if (!className) return baseCls
  return baseCls ? cls(baseCls, className) : className
}

function iconStyle(size: number | undefined, style?: CSSProperties): CSSProperties | undefined {
  if (!size) return style
  return { width: size, height: size, ...style }
}

export const MenuIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const HomeIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9.5V20h14V9.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 20v-6h5v6" />
  </svg>
)

export const ChevronDownIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
  </svg>
)

export const PlusIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
  </svg>
)

export const MinusIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
  </svg>
)

export const ArrowLeftIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

export const ArrowRightIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export const ArrowIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

export const CartIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3.5 5h2l2.2 10.1a1 1 0 00.98.8h8.86a1 1 0 00.97-.75L20.2 9H8.1" />
    <circle cx="10" cy="19" r="1.6" strokeWidth={1.9} />
    <circle cx="17" cy="19" r="1.6" strokeWidth={1.9} />
  </svg>
)

export const ShoppingCartIcon = CartIcon

export const CheckIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export const DeleteIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-8 0l1 14h8l1-14" />
  </svg>
)

export const UserIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
)

export const LogoutIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M10 5.5H7.75A2.75 2.75 0 005 8.25v7.5a2.75 2.75 0 002.75 2.75H10" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M14 8.5L18 12l-4 3.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M9 12h9" />
  </svg>
)

export const MailIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18V8H3v8z" />
  </svg>
)

export const LockIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 11c1.657 0 3 1.343 3 3v3H9v-3c0-1.657 1.343-3 3-3zm6-1V8a6 6 0 10-12 0v2"
    />
  </svg>
)

export const EyeIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

export const EyeOffIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.944-9.543-7a9.964 9.964 0 012.13-3.568" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.26 6.26A9.964 9.964 0 0112 5c4.478 0 8.269 2.944 9.543 7a9.97 9.97 0 01-4.29 5.152" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
)

export const SearchIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z" />
  </svg>
)

export const FilterIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18l-7 8v7l-4 2v-9L3 4z" />
  </svg>
)

export const GlobeIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="9" strokeWidth={1.9} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M3 12h18" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 3.1c2.7 2.2 4.2 5.3 4.2 8.9 0 3.6-1.5 6.7-4.2 8.9-2.7-2.2-4.2-5.3-4.2-8.9 0-3.6 1.5-6.7 4.2-8.9z" />
  </svg>
)

export const HeartIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)

export const StarIcon = ({ filled, size, className, style, ...props }: IconProps & { filled?: boolean }) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.01 6.198a1 1 0 00.95.69h6.52c.969 0 1.371 1.24.588 1.81l-5.275 3.833a1 1 0 00-.364 1.118l2.01 6.198c.3.921-.755 1.688-1.54 1.118l-5.275-3.833a1 1 0 00-1.176 0l-5.275 3.833c-.784.57-1.838-.197-1.539-1.118l2.01-6.198a1 1 0 00-.364-1.118L.98 11.625c-.783-.57-.38-1.81.588-1.81h6.52a1 1 0 00.95-.69l2.01-6.198z"
    />
  </svg>
)

export const TruckIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17a2 2 0 104 0m-4 0a2 2 0 104 0m-4 0H5a2 2 0 01-2-2V7a2 2 0 012-2h11a2 2 0 012 2v8a2 2 0 01-2 2h-1m-6 0h6m0 0a2 2 0 104 0m-4 0a2 2 0 104 0m0 0h1a2 2 0 002-2v-3.586a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0019.586 8H17"
    />
  </svg>
)

export const ClockIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const DirectionIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 19-7-4-7 4 7-19z" />
  </svg>
)

export const XIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export const LocationIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
)

export const TargetIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
    <circle cx="12" cy="12" r="7" strokeWidth={2} />
    <circle cx="12" cy="12" r="3" strokeWidth={2} />
  </svg>
)

export const PhoneIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5.5c0-.83.67-1.5 1.5-1.5h3c.66 0 1.24.43 1.43 1.06l.9 2.95c.16.52 0 1.1-.4 1.46l-1.3 1.18a15.9 15.9 0 006.74 6.74l1.18-1.3c.36-.4.94-.56 1.46-.4l2.95.9c.63.19 1.06.77 1.06 1.43v3c0 .83-.67 1.5-1.5 1.5H19C9.61 22 2 14.39 2 5v.5z"
    />
  </svg>
)

export const GoogleIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    {/* Simple "G" mark */}
    <path d="M12 2a10 10 0 100 20 9.7 9.7 0 009.8-8.4H12v-3h9.8A10 10 0 0012 2z" />
  </svg>
)

export const GoogleBrandIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M23.49 12.27c0-.81-.07-1.58-.2-2.34H12.24v4.43h6.32a5.4 5.4 0 01-2.35 3.54v2.94h3.8c2.2-2.03 3.48-5.02 3.48-8.57z"
      fill="#4285F4"
    />
    <path
      d="M12.24 23.75c3.17 0 5.82-1.05 7.76-2.85l-3.8-2.94c-1.05.71-2.39 1.12-3.96 1.12-3.02 0-5.58-2.04-6.49-4.78H1.83v3.03a11.72 11.72 0 0010.41 6.42z"
      fill="#34A853"
    />
    <path
      d="M5.75 14.3a7.03 7.03 0 010-4.5V6.77H1.83a11.74 11.74 0 000 10.57l3.92-3.04z"
      fill="#FBBC05"
    />
    <path
      d="M12.24 4.91c1.72 0 3.25.59 4.46 1.75l3.34-3.34C18.05 1.47 15.4.25 12.24.25A11.72 11.72 0 001.83 6.77L5.75 9.8c.91-2.74 3.47-4.89 6.49-4.89z"
      fill="#EA4335"
    />
  </svg>
)

export const FacebookIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.86.24-1.44 1.48-1.44H16.7V5.02c-.3-.04-1.33-.12-2.52-.12-2.5 0-4.2 1.52-4.2 4.32V11H7.5v3h2.48v8h3.52z" />
  </svg>
)

export const FacebookBrandIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      d="M13.56 19.5v-6.17h2.07l.31-2.4h-2.38V9.4c0-.7.19-1.17 1.2-1.17H16V6.08c-.21-.03-1.02-.08-1.94-.08-1.92 0-3.23 1.18-3.23 3.34v1.59H8.66v2.4h2.17v6.17h2.73z"
      fill="#fff"
    />
  </svg>
)

export const InstagramIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth={2} />
    <circle cx="12" cy="12" r="4" strokeWidth={2} />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

export const LinkedInIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10v6.5" />
    <circle cx="8" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 16.5V10m0 2.4c0-1.7 1-2.9 2.6-2.9 1.7 0 2.8 1.1 2.8 3v4"
    />
  </svg>
)

export const TwitterIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M6 5h3.4L18 19h-3.4L6 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M8.2 19L11.8 14.9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12.2 10.3L16 5" />
  </svg>
)

export const YouTubeIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3.2" y="6.2" width="17.6" height="11.6" rx="3.2" strokeWidth={2} />
    <path fill="currentColor" stroke="none" d="M10 9.7v4.6l4.5-2.3L10 9.7z" />
  </svg>
)

export const TikTokIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.3 4.8v8.1a4.1 4.1 0 11-4.1-4.1" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.3 4.8c.7 1.7 2 2.8 3.9 3.2" />
  </svg>
)

export const SnapchatIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      d="M12 4.3c-2.4 0-4.3 1.9-4.3 4.3v1.7c0 .7-.3 1.4-.9 1.9l-.8.7c.9.5 1.7.9 2.7 1 .3.9.8 1.4 1.7 1.7.5.1 1 .2 1.6.2s1.1-.1 1.6-.2c.9-.3 1.4-.8 1.7-1.7 1-.1 1.8-.5 2.7-1l-.8-.7c-.6-.5-.9-1.2-.9-1.9V8.6c0-2.4-1.9-4.3-4.3-4.3z"
    />
  </svg>
)

export const WhatsAppIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.8a8.2 8.2 0 00-7 12.4L4 20l4-.9A8.2 8.2 0 1012 3.8z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 9.3c.2 1.3 1.1 2.8 2.3 3.7 1 .8 2.2 1.3 3.3 1.4l.6-1.3"
    />
  </svg>
)

export const InfoIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01" />
  </svg>
)

export const ListIcon = ({ size, className, style, ...props }: IconProps) => (
  <svg
    {...props}
    className={iconClass(size, className)}
    style={iconStyle(size, style)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

/** Visa payment method badge (card aspect ratio ~40:28) */
export const VisaIcon = ({ size, className, style, ...props }: IconProps) => {
  const h = size ?? 28
  const w = Math.round((h * 40) / 28)
  return (
    <svg
      {...props}
      className={iconClass(size, className)}
      style={size ? { width: w, height: h, ...style } : style}
      viewBox="0 0 40 28"
      fill="none"
    >
      <rect width="40" height="28" rx="4" fill="#1A1F71" />
      <text x="20" y="18" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial,sans-serif">VISA</text>
    </svg>
  )
}

/** Mastercard payment method badge (overlapping circles, card aspect ~40:28) */
export const MastercardIcon = ({ size, className, style, ...props }: IconProps) => {
  const h = size ?? 28
  const w = Math.round((h * 40) / 28)
  return (
    <svg
      {...props}
      className={iconClass(size, className)}
      style={size ? { width: w, height: h, ...style } : style}
      viewBox="0 0 40 28"
      fill="none"
    >
      <rect width="40" height="28" rx="4" fill="#252525" />
      <circle cx="16" cy="14" r="8" fill="#EB001B" />
      <circle cx="24" cy="14" r="8" fill="#F79E1B" />
    </svg>
  )
}
