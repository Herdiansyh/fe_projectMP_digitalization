import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

import Unauthorized from "./pages/Unauthorized";
import OperatorList from "./pages/Operator/OperatorList";
import OperatorCreate from "./pages/Operator/OperatorCreate";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operators"
            element={
              <ProtectedRoute allowedRoles={["HR Admin"]}>
                <OperatorList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/operators/create"
            element={
              <ProtectedRoute allowedRoles={["HR Admin"]}>
                <OperatorCreate />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
