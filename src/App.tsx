import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { DashboardLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';

import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { Weather } from '@/pages/Weather';
import { CropRecommendation } from '@/pages/CropRecommendation';
import { DiseaseDetection } from '@/pages/DiseaseDetection';
import { MarketPrices } from '@/pages/MarketPrices';
import { AIAssistant } from '@/pages/AIAssistant';
import { Schemes } from '@/pages/Schemes';
import { FarmCalendar } from '@/pages/FarmCalendar';
import { Irrigation } from '@/pages/Irrigation';
import { Fertilizer } from '@/pages/Fertilizer';
import { News } from '@/pages/News';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { Contact } from '@/pages/Contact';
import { About } from '@/pages/About';
import { SearchPage } from '@/pages/Search';
import { Admin } from '@/pages/Admin';
import { WhySmart } from '@/pages/WhySmart';
import { SmartAnalytics } from '@/pages/SmartAnalytics';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout><Landing /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/why-smart" element={<Layout><WhySmart /></Layout>} />
                <Route path="/login" element={<Layout><Login /></Layout>} />
                <Route path="/signup" element={<Layout><Signup /></Layout>} />
                <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />

                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                <Route path="/weather" element={<ProtectedRoute><DashboardLayout><Weather /></DashboardLayout></ProtectedRoute>} />
                <Route path="/crop-recommendation" element={<ProtectedRoute><DashboardLayout><CropRecommendation /></DashboardLayout></ProtectedRoute>} />
                <Route path="/disease-detection" element={<ProtectedRoute><DashboardLayout><DiseaseDetection /></DashboardLayout></ProtectedRoute>} />
                <Route path="/market-prices" element={<ProtectedRoute><DashboardLayout><MarketPrices /></DashboardLayout></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><DashboardLayout><AIAssistant /></DashboardLayout></ProtectedRoute>} />
                <Route path="/schemes" element={<ProtectedRoute><DashboardLayout><Schemes /></DashboardLayout></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><DashboardLayout><FarmCalendar /></DashboardLayout></ProtectedRoute>} />
                <Route path="/irrigation" element={<ProtectedRoute><DashboardLayout><Irrigation /></DashboardLayout></ProtectedRoute>} />
                <Route path="/fertilizer" element={<ProtectedRoute><DashboardLayout><Fertilizer /></DashboardLayout></ProtectedRoute>} />
                <Route path="/news" element={<ProtectedRoute><DashboardLayout><News /></DashboardLayout></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><SmartAnalytics /></DashboardLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><DashboardLayout><SearchPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><DashboardLayout><Admin /></DashboardLayout></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Layout><Landing /></Layout>} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
