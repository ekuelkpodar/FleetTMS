import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/Dashboard';
import { LoadsPage } from './pages/Loads';
import { LoadDetailPage } from './pages/LoadDetail';
import { CustomersPage } from './pages/Customers';
import { CarriersPage } from './pages/Carriers';
import { DriversPage } from './pages/Drivers';
import { EquipmentPage } from './pages/Equipment';
import { LocationsPage } from './pages/Locations';
import { InvoicesPage } from './pages/Invoices';
import { DispatchPage } from './pages/Dispatch';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { MainLayout } from './layouts/MainLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />
      <Route
        path="/loads"
        element={
          <MainLayout>
            <LoadsPage />
          </MainLayout>
        }
      />
      <Route
        path="/dispatch"
        element={
          <MainLayout>
            <DispatchPage />
          </MainLayout>
        }
      />
      <Route
        path="/loads/:id"
        element={
          <MainLayout>
            <LoadDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/customers"
        element={
          <MainLayout>
            <CustomersPage />
          </MainLayout>
        }
      />
      <Route
        path="/carriers"
        element={
          <MainLayout>
            <CarriersPage />
          </MainLayout>
        }
      />
      <Route
        path="/drivers"
        element={
          <MainLayout>
            <DriversPage />
          </MainLayout>
        }
      />
      <Route
        path="/equipment"
        element={
          <MainLayout>
            <EquipmentPage />
          </MainLayout>
        }
      />
      <Route
        path="/locations"
        element={
          <MainLayout>
            <LocationsPage />
          </MainLayout>
        }
      />
      <Route
        path="/billing/invoices"
        element={
          <MainLayout>
            <InvoicesPage />
          </MainLayout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
