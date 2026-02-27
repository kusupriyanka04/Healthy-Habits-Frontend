import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AuthPage from "./pages/AuthPages.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Challenges from "./pages/Challenges.jsx";
import Settings from "./pages/Settings.jsx";
import { useEffect } from "react";

// Wrap pages with sidebar layout
const SidebarLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    {/* lg: offset by sidebar width, mobile: offset by top bar height */}
    <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">{children}</main>
  </div>
);

const ToastWrapper = () => {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? "#0a1612" : "#ffffff",
          color: isDark ? "#e8f5f0" : "#0f172a",
          border: isDark ? "1px solid #1a3328" : "1px solid #e2e8f0",
          borderRadius: "12px",
          fontFamily: "Manrope, sans-serif",
          fontSize: "13px",
          fontWeight: "600",
          boxShadow: isDark
            ? "0 8px 30px rgba(0,0,0,0.5)"
            : "0 4px 16px rgba(0,0,0,0.08)",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: isDark ? "#0a1612" : "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: isDark ? "#0a1612" : "#fff",
          },
        },
      }}
    />
  );
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected with Sidebar */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <SidebarLayout>
              <Dashboard />
            </SidebarLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <SidebarLayout>
              <Analytics />
            </SidebarLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <PrivateRoute>
            <SidebarLayout>
              <Challenges />
            </SidebarLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SidebarLayout>
              <Settings />
            </SidebarLayout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    <ToastWrapper />
  </BrowserRouter>
);

const App = () => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => {
        Notification.requestPermission();
      }, 3000);
    }
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
