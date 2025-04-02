import { Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import VerifyEmail from "./pages/VerifyEmail";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedVerifyRoute from "./components/ProtectedVerifyRoute";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import History from "./pages/History";

function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<SignupPage />} />
        
        {/* Protect Verify Route if Email is Already Verified */}
        <Route
          path="/verify"
          element={
            <ProtectedVerifyRoute>
              <VerifyEmail />
            </ProtectedVerifyRoute>
          }
        />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<LoginPage />} />

        {/* Protect Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
