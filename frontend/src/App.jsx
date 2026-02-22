import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InquiryList from './pages/InquiryList';
import NewInquiry from './pages/NewInquiry';
import EditInquiry from './pages/EditInquiry';
import Consolidation from './pages/Consolidation';
import ImportExport from './pages/ImportExport';
import Settings from './pages/Settings';
import useAuthStore from './store/authStore';

function RequireAuth({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inquiries" element={<InquiryList />} />
        <Route path="inquiries/new" element={<NewInquiry />} />
        <Route path="inquiries/:id/edit" element={<EditInquiry />} />
        <Route path="consolidation" element={<Consolidation />} />
        <Route path="import" element={<ImportExport />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
