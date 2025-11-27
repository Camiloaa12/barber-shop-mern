import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { BarberDashboard } from "./pages/BarberDashboard"
import { BarberAnalytics } from "./pages/BarberAnalytics"
import { AdminDashboard } from "./pages/AdminDashboard"
import { Unauthorized } from "./pages/Unauthorized"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Barber Routes */}
          <Route
            path="/barber/dashboard"
            element={
              <ProtectedRoute allowedRoles={["barbero", "admin"]}>
                <BarberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barber/analytics"
            element={
              <ProtectedRoute allowedRoles={["barbero", "admin"]}>
                <BarberAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Legacy Redirects or Root Redirect */}
          <Route path="/barber-dashboard" element={<Navigate to="/barber/dashboard" />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
