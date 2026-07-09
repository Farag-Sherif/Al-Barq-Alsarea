import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import './styles/index.css'

import { Provider } from 'react-redux'
import { store } from './store/store'
import { I18nProvider } from '@/i18n/I18nProvider'
import ToastViewport from '@/components/ui/ToastViewport'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration failures in local/dev contexts.
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <I18nProvider>
          <ToastViewport />
          <App />
        </I18nProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
