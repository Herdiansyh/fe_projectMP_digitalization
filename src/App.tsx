import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import EmployeeList from "./pages/Employee/EmployeeList";

const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const FptkList = lazy(() => import("./pages/Fptk/FptkList"));
const FptkApprovedList = lazy(() => import("./pages/Fptk/FptkApprovedList"));
const FptkHistoryList = lazy(() => import("./pages/Fptk/FptkHistoryList"));
const FptkForm = lazy(() => import("./pages/Fptk/FptkForm"));
const FptkDetail = lazy(() => import("./pages/Fptk/FptkDetail"));
const FptkPending = lazy(() => import("./pages/Fptk/FptkPending"));
const FptkApproval = lazy(() => import("./pages/Fptk/FptkApproval"));
const UserList = lazy(() => import("./pages/UserManagement/UserList"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                color: "#64748b",
              }}
            >
              Loading...
            </div>
          }
        >
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
              path="/fptklist"
              element={
                <ProtectedRoute>
                  <FptkList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/approved"
              element={
                <ProtectedRoute>
                  <FptkApprovedList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/history"
              element={
                <ProtectedRoute>
                  <FptkHistoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/create"
              element={
                <ProtectedRoute
                  allowedRoles={["Staff", "Operator", "Section Head", "Admin"]}
                >
                  <FptkForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/fptk/:noReq"
              element={
                <ProtectedRoute>
                  <FptkDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/pending"
              element={
                <ProtectedRoute>
                  <FptkPending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/:noReq/review"
              element={
                <ProtectedRoute>
                  <FptkApproval />
                </ProtectedRoute>
              }
            />

            {/* User Management — admin only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UserList />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/employees"
              element={
                <ProtectedRoute adminOnly>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
