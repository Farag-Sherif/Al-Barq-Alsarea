import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

import HomePage from './pages/HomePage'

const RestaurantsPage = lazy(() => import('./pages/RestaurantsPage'))
const RestaurantDetailsPage = lazy(() => import('./pages/RestaurantDetailsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const OrderFailedPage = lazy(() => import('./pages/OrderFailedPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const SocialAuthCallbackPage = lazy(() => import('./pages/SocialAuthCallbackPage'))
const GoogleAuthCallbackPage = lazy(() => import('./pages/GoogleAuthCallbackPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function RouteFallback() {
  return <div className="min-h-[40vh] bg-screen" aria-hidden />
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:id" element={<OrderSuccessPage />} />
          <Route path="/order-failed" element={<OrderFailedPage />} />
          <Route path="/account" element={<AccountPage />} />

          {/* Help / legal */}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* General */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/social/callback" element={<SocialAuthCallbackPage />} />
        <Route path="/social/callback/:provider" element={<SocialAuthCallbackPage />} />
        <Route path="/social/:provider/callback" element={<SocialAuthCallbackPage />} />
        <Route path="/social-auth/callback" element={<SocialAuthCallbackPage />} />
        <Route path="/social-auth/callback/:provider" element={<SocialAuthCallbackPage />} />
        <Route path="/google-auth/callback" element={<GoogleAuthCallbackPage />} />
        <Route path="/auth/social/callback" element={<SocialAuthCallbackPage />} />
        <Route path="/auth/social/callback/:provider" element={<SocialAuthCallbackPage />} />
        <Route path="/auth/social/:provider/callback" element={<SocialAuthCallbackPage />} />
        <Route path="/auth/:provider/callback" element={<SocialAuthCallbackPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/HomePage" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    </>
  )
}
