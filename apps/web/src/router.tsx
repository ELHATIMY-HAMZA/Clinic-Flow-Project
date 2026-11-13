import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './auth/AuthContext.js';
import { AppLayout } from './components/AppLayout.js';
import { AppointmentsPage } from './pages/AppointmentsPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { PatientDetailsPage } from './pages/PatientDetailsPage.js';
import { PatientsPage } from './pages/PatientsPage.js';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
