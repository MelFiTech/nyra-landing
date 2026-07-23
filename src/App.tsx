import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BalanceProvider } from './context/BalanceContext'
import { ToastProvider } from './context/ToastContext'
import { BusinessProvider } from './context/BusinessContext'
import { queryClient } from './lib/queryClient'
import { session } from './lib/api'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import BusinessLandingPage from './pages/BusinessLandingPage'
import AboutPage from './pages/AboutPage'
import PricingPage from './pages/PricingPage'
import AmlKycPolicyPage from './pages/AmlKycPolicyPage'
import LegalCompliancePage from './pages/LegalCompliancePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import CardsPage from './pages/CardsPage'
import TransactionsPage from './pages/TransactionsPage'
import SettingsPage from './pages/SettingsPage'
import WebhooksPage from './pages/WebhooksPage'
import CompliancePage from './pages/CompliancePage'
import DeveloperDocsPage from './pages/DeveloperDocsPage'

function RequireAuth({ children }: { children: ReactNode }) {
  if (!session.token) return <Navigate to="/app/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/business" element={<BusinessLandingPage />} />
      <Route path="/company/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/legal/aml-kyc" element={<AmlKycPolicyPage />} />
      <Route path="/legal/compliance" element={<LegalCompliancePage />} />
      <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/legal/terms" element={<TermsOfServicePage />} />
      <Route path="/docs" element={<DeveloperDocsPage />} />
      <Route path="/app/login" element={<LoginPage />} />
      <Route path="/app/signup" element={<SignupPage />} />
      <Route
        element={
          <RequireAuth>
            <BusinessProvider>
              <AppShell />
            </BusinessProvider>
          </RequireAuth>
        }
      >
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/customers" element={<CustomersPage />} />
        <Route path="/app/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/app/cards" element={<CardsPage />} />
        <Route path="/app/transactions" element={<TransactionsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/webhooks" element={<WebhooksPage />} />
      </Route>
      <Route path="/app/compliance" element={<RequireAuth><CompliancePage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BalanceProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </BalanceProvider>
    </QueryClientProvider>
  )
}

export default App
