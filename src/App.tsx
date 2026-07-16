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
import InternList from "./pages/Intern/InternList";
import CompetencyAssessmentList from "./pages/Competency/CompetencyAssessmentList";
import CompetencyMatrixManage from "./pages/Competency/CompetencyMatrixManage";
import QaReviewList from "./pages/Competency/QaReviewList";
import MySubmissionsList from "./pages/Competency/MySubmissionList";
import MyReviewsList from "./pages/Competency/MyReviewList";
import EvaluationList from "./pages/Evaluation/EvaluationList";
import EvaluationForm from "./pages/Evaluation/EvaluationForm";
import EvaluationDetail from "./pages/Evaluation/EvaluationDetail";

const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const EvaluationFormManage = lazy(() => import("./pages/EvaluationFormManagement/EvaluationFormManage"));
const FptkList = lazy(() => import("./pages/Fptk/FptkList"));
const FptkApprovedList = lazy(() => import("./pages/Fptk/FptkApprovedList"));
const FptkRejectedList = lazy(() => import("./pages/Fptk/FptkRejectedList"));
const FptkHistoryList = lazy(() => import("./pages/Fptk/FptkHistoryList"));
const FptkForm = lazy(() => import("./pages/Fptk/FptkForm"));
const FptkDetail = lazy(() => import("./pages/Fptk/FptkDetail"));
const FptkPending = lazy(() => import("./pages/Fptk/FptkPending"));
const FptkApproval = lazy(() => import("./pages/Fptk/FptkApproval"));
const UserList = lazy(() => import("./pages/UserManagement/UserList"));
const StationList = lazy(() => import("./pages/StationManagement/StationList"));
const AreaList = lazy(() => import("./pages/AreaManagement/AreaList"));
const LineList = lazy(() => import("./pages/LineManagement/LineList"));
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
              path="/fptk/rejected"
              element={
                <ProtectedRoute>
                  <FptkRejectedList />
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
            <Route
              path="/interns"
              element={
                <ProtectedRoute manpowerOnly>
                  <InternList />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/employees"
              element={
                <ProtectedRoute manpowerOnly>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            {/* Station Management — admin only */}
            <Route
              path="/stations"
              element={
                <ProtectedRoute adminOnly>
                  <StationList />
                </ProtectedRoute>
              }
            />
            {/* Area Management — admin only */}
            <Route
              path="/areas"
              element={
                <ProtectedRoute adminOnly>
                  <AreaList />
                </ProtectedRoute>
              }
            />
            {/* Line Management — admin only */}
            <Route
              path="/lines"
              element={
                <ProtectedRoute adminOnly>
                  <LineList />
                </ProtectedRoute>
              }
            />

            {/* Competency Assessment — Leader (area sendiri) atau Admin (semua area).
                Selaras dengan backend EmployeeAssessmentController::isAdmin/isLeader. */}
            <Route
              path="/competency-assessment"
              element={
                <ProtectedRoute assessorOnly>
                  <CompetencyAssessmentList />
                </ProtectedRoute>
              }
            />

            {/* Manage Competency Matrix — admin only (setup rubrik penilaian) */}
            <Route
              path="/manage-competency-matrix"
              element={
                <ProtectedRoute adminOnly>
                  <CompetencyMatrixManage />
                </ProtectedRoute>
              }
            />
            {/* Manage Evaluation Form — admin only */}
            <Route
              path="/manage-evaluation-form"
              element={
                <ProtectedRoute adminOnly>
                  <EvaluationFormManage />
                </ProtectedRoute>
              }
            />
            {/* QA Review — role Quality Assurance (semua area) atau Admin */}
            <Route
              path="/qa-review"
              element={
                <ProtectedRoute qaOnly>
                  <QaReviewList />
                </ProtectedRoute>
              }
            />
            {/* My Submissions — Leader melihat assessment yang dia submit sendiri */}
            <Route
              path="/my-submissions"
              element={
                <ProtectedRoute assessorOnly>
                  <MySubmissionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute qaOnly>
                  <MyReviewsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations"
              element={
                <ProtectedRoute assessorOnly>
                  <EvaluationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/create"
              element={
                <ProtectedRoute assessorOnly>
                  <EvaluationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/:id"
              element={
                <ProtectedRoute assessorOnly>
                  <EvaluationDetail />
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
