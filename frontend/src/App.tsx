import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import RosterPage from './pages/RosterPage';
import TwinPage from './pages/TwinPage';
import ExplanationPage from './pages/ExplanationPage';
import ScenariosPage from './pages/ScenariosPage';
import SignalsPage from './pages/SignalsPage';
import DatasheetPage from './pages/DatasheetPage';
import NursingDeskPage from './pages/NursingDeskPage';
import CathLabTriagePage from './pages/CathLabTriagePage';
import AuditVaultPage from './pages/AuditVaultPage';

import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Error">
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<AppLayout />}>
                <Route path="/roster" element={<ErrorBoundary fallbackTitle="Roster Page Error"><RosterPage /></ErrorBoundary>} />
                <Route path="/patients/:id" element={<ErrorBoundary fallbackTitle="Twin Page Error"><TwinPage /></ErrorBoundary>} />
                <Route path="/patients/:id/explanation" element={<ErrorBoundary fallbackTitle="Explanation Page Error"><ExplanationPage /></ErrorBoundary>} />
                <Route path="/patients/:id/scenarios" element={<ErrorBoundary fallbackTitle="Scenarios Page Error"><ScenariosPage /></ErrorBoundary>} />
                <Route path="/patients/:id/signals" element={<ErrorBoundary fallbackTitle="Signals Page Error"><SignalsPage /></ErrorBoundary>} />
                <Route path="/datasheet" element={<ErrorBoundary fallbackTitle="Datasheet Page Error"><DatasheetPage /></ErrorBoundary>} />
                <Route path="/nursing-desk" element={<ErrorBoundary fallbackTitle="Nursing Desk Error"><NursingDeskPage /></ErrorBoundary>} />
                <Route path="/cath-lab-triage" element={<ErrorBoundary fallbackTitle="Cath Lab Triage Error"><CathLabTriagePage /></ErrorBoundary>} />
                <Route path="/audit-vault" element={<ErrorBoundary fallbackTitle="Audit Vault Error"><AuditVaultPage /></ErrorBoundary>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
