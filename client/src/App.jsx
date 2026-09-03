import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import FinancialProfile from '@/pages/FinancialProfile'
import CreditScore from '@/pages/CreditScore'
import EmergencyFund from '@/pages/EmergencyFund'
import Investments from '@/pages/Investments'
import P2PLending from '@/pages/P2PLending'
import Insurance from '@/pages/Insurance'
import Goals from '@/pages/Goals'
import CalendarPage from '@/pages/CalendarPage'
import Simulator from '@/pages/Simulator'
import Chatbot from '@/pages/Chatbot'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout title="Dashboard" subtitle="Your financial overview at a glance" />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route element={<AppLayout title="Financial Profile" subtitle="Tell us about your income and expenses" />}>
              <Route path="/profile" element={<FinancialProfile />} />
            </Route>
            <Route element={<AppLayout title="Credit Score" subtitle="Your alternative credit scoring breakdown" />}>
              <Route path="/credit-score" element={<CreditScore />} />
            </Route>
            <Route element={<AppLayout title="Emergency Fund Saver" subtitle="Build your financial safety net" />}>
              <Route path="/emergency-fund" element={<EmergencyFund />} />
            </Route>
            <Route element={<AppLayout title="Micro-Investment Advisor" subtitle="Simulated, low-risk growth ideas" />}>
              <Route path="/investments" element={<Investments />} />
            </Route>
            <Route element={<AppLayout title="P2P Lending" subtitle="Simulated peer-to-peer marketplace" />}>
              <Route path="/p2p-lending" element={<P2PLending />} />
            </Route>
            <Route element={<AppLayout title="Insurance Assistant" subtitle="Scheme matching & eligibility" />}>
              <Route path="/insurance" element={<Insurance />} />
            </Route>
            <Route element={<AppLayout title="Goal Financial Planning" subtitle="Turn ambitions into monthly plans" />}>
              <Route path="/goals" element={<Goals />} />
            </Route>
            <Route element={<AppLayout title="Calendar" subtitle="Monthly overview and forward planning" />}>
              <Route path="/calendar" element={<CalendarPage />} />
            </Route>
            <Route element={<AppLayout title="Expense Simulator" subtitle="Model a what-if monthly budget" />}>
              <Route path="/simulator" element={<Simulator />} />
            </Route>
            <Route element={<AppLayout title="Financial Chatbot" subtitle="Ask FinAssist in your language" />}>
              <Route path="/chatbot" element={<Chatbot />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
