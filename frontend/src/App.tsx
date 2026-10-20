import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import DoctorLandingPage from './pages/DoctorLandingPage';
import LoginPage from './pages/LoginPage';
import PatientPortalPage from './pages/PatientPortalPage';
import DoctorTwinPage from './pages/DoctorTwinPage';
import RosterPage from './pages/RosterPage';
import ExplanationPage from './pages/ExplanationPage';
import ScenariosPage from './pages/ScenariosPage';
import SignalsPage from './pages/SignalsPage';
import DatasheetPage from './pages/DatasheetPage';
import NursingDeskPage from './pages/NursingDeskPage';
import CathLabTriagePage from './pages/CathLabTriagePage';
import AuditVaultPage from './pages/AuditVaultPage';

import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Error">
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/doctor" element={<DoctorLandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Patient Portal Routes (Isolated, Minimal, Beating Heart) */}
              <Route path="/patient" element={<Navigate to="/patient/CT-3092" replace />} />
              <Route path="/patient/:id" element={<ErrorBoundary fallbackTitle="Patient Portal Error"><PatientPortalPage /></ErrorBoundary>} />

              {/* Doctor CCU Portal Routes (Surveillance Roster, Windkessel ODE, CCU Desk) */}
              <Route element={<AppLayout />}>
                <Route path="/doctor/roster" element={<ErrorBoundary fallbackTitle="Roster Page Error"><RosterPage /></ErrorBoundary>} />
                <Route path="/doctor/patients/:id" element={<ErrorBoundary fallbackTitle="Doctor Twin Page Error"><DoctorTwinPage /></ErrorBoundary>} />
                <Route path="/doctor/patients/:id/explanation" element={<ErrorBoundary fallbackTitle="Explanation Page Error"><ExplanationPage /></ErrorBoundary>} />
                <Route path="/doctor/patients/:id/scenarios" element={<ErrorBoundary fallbackTitle="Scenarios Page Error"><ScenariosPage /></ErrorBoundary>} />
                <Route path="/doctor/patients/:id/signals" element={<ErrorBoundary fallbackTitle="Signals Page Error"><SignalsPage /></ErrorBoundary>} />
                <Route path="/doctor/datasheet" element={<ErrorBoundary fallbackTitle="Datasheet Page Error"><DatasheetPage /></ErrorBoundary>} />
                <Route path="/doctor/nursing-desk" element={<ErrorBoundary fallbackTitle="Nursing Desk Error"><NursingDeskPage /></ErrorBoundary>} />
                <Route path="/doctor/cath-lab-triage" element={<ErrorBoundary fallbackTitle="Cath Lab Triage Error"><CathLabTriagePage /></ErrorBoundary>} />
                <Route path="/doctor/audit-vault" element={<ErrorBoundary fallbackTitle="Audit Vault Error"><AuditVaultPage /></ErrorBoundary>} />
              </Route>

              {/* Backward compatibility redirects */}
              <Route path="/roster" element={<Navigate to="/doctor/roster" replace />} />
              <Route path="/nursing-desk" element={<Navigate to="/doctor/nursing-desk" replace />} />
              <Route path="/cath-lab-triage" element={<Navigate to="/doctor/cath-lab-triage" replace />} />
              <Route path="/audit-vault" element={<Navigate to="/doctor/audit-vault" replace />} />
              <Route path="/datasheet" element={<Navigate to="/doctor/datasheet" replace />} />
              <Route path="/patients/:id" element={<ErrorBoundary fallbackTitle="Patient Portal Error"><PatientPortalPage /></ErrorBoundary>} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
