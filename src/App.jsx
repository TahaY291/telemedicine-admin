import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import DoctorManagement from "./pages/DoctorManagement";
import PatientManagement from "./pages/PatientManagement";
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from "./pages/Login";
import LoadingSpinner from "./components/LoadingSpinner";
import ChangePassword from "./pages/ChangePassword";
import VerifyEmail from "./pages/VerifyEmail";
import FeedBackManagement from "./pages/FeedBackManagement";
import AppointmentMonitoring from "./pages/AppointmentMonitoring";
import AdminReports from "./pages/AdminReports";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation()
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Unauthenticated: only show login
  if (!user || user.role !== "admin") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="signup" element={<Login mode="signup" />} />
      </Routes>
    );
  }

if (location.pathname === "/") {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/admin" replace />}
      />
    </Routes>
  );
}

  // Authenticated: show full app
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Navbar />
        <main className="p-6 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/doctor-management" element={<DoctorManagement />} />
            <Route path="/admin/patient-management" element={<PatientManagement />} />
            <Route path="/admin/change-password" element={<ChangePassword />} />
            <Route path="/admin/verify-email" element={<VerifyEmail />} />
            <Route path="/admin/appointments" element={<AppointmentMonitoring />} />
            <Route path="/admin/feedback-management" element={<FeedBackManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App
