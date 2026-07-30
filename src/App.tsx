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
import HrDecisionsList from "./pages/Evaluation/HrDecisionsList";
import { Toaster } from "react-hot-toast";
import HrDecisionHistory from "./pages/Evaluation/HrDecisionHistory";

const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const EvaluationFormManage = lazy(
  () => import("./pages/EvaluationFormManagement/EvaluationFormManage"),
);
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
const PermissionMatrixPage = lazy(
  () => import("./pages/PermissionMatrix/PermissionMatrixPage"),
);
const AssessmentMonitoringList = lazy(
  () => import("./pages/Competency/AssessmentMonitoringList"),
);
function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            borderRadius: "8px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
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

            {/* ── FPTK ── */}
            <Route
              path="/fptklist"
              element={
                <ProtectedRoute permission="fptk.view_list">
                  <FptkList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/approved"
              element={
                <ProtectedRoute permission="fptk.view_approved">
                  <FptkApprovedList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/rejected"
              element={
                <ProtectedRoute permission="fptk.view_rejected">
                  <FptkRejectedList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/history"
              element={
                <ProtectedRoute permission="fptk.view_history">
                  <FptkHistoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/create"
              element={
                <ProtectedRoute permission="fptk.create">
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
                <ProtectedRoute permission="fptk.approve">
                  <FptkPending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fptk/:noReq/review"
              element={
                <ProtectedRoute permission="fptk.approve">
                  <FptkApproval />
                </ProtectedRoute>
              }
            />

            {/* ── User Management (Data Master → is_admin, bukan permission matrix) ── */}
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UserList />
                </ProtectedRoute>
              }
            />

            {/* ── Manpower (per-user flag can_view_manpower) ── */}
            <Route
              path="/interns"
              element={
                <ProtectedRoute permission="manpower">
                  <InternList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute permission="manpower">
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ── Master Data (Data Master → is_admin, bukan permission matrix) ── */}
            <Route
              path="/stations"
              element={
                <ProtectedRoute adminOnly>
                  <StationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/areas"
              element={
                <ProtectedRoute adminOnly>
                  <AreaList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lines"
              element={
                <ProtectedRoute adminOnly>
                  <LineList />
                </ProtectedRoute>
              }
            />

            {/* ── Permission Matrix (Data Master → is_admin, bukan permission matrix) ── */}
            <Route
              path="/permission-matrix"
              element={
                <ProtectedRoute adminOnly>
                  <PermissionMatrixPage />
                </ProtectedRoute>
              }
            />

            {/* ── Competency ── */}
            <Route
              path="/competency-assessment"
              element={
                <ProtectedRoute permission="competency.assess">
                  <CompetencyAssessmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-competency-matrix"
              element={
                <ProtectedRoute adminOnly>
                  <CompetencyMatrixManage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-evaluation-form"
              element={
                <ProtectedRoute adminOnly>
                  <EvaluationFormManage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qa-review"
              element={
                <ProtectedRoute permission="competency.qa_review">
                  <QaReviewList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <ProtectedRoute permission="competency.assess">
                  <MySubmissionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <ProtectedRoute permission="competency.qa_review">
                  <MyReviewsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment-monitoring"
              element={
                <ProtectedRoute permission="competency.monitor">
                  <AssessmentMonitoringList />
                </ProtectedRoute>
              }
            />

            {/* ── Evaluations ── */}
            <Route
              path="/evaluations"
              element={
                <ProtectedRoute permission="evaluations.view">
                  <EvaluationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/create"
              element={
                <ProtectedRoute permission="evaluations.view">
                  <EvaluationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/hr-decisions"
              element={
                <ProtectedRoute permission="evaluations.hr_decisions">
                  <HrDecisionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/:id/edit"
              element={
                <ProtectedRoute permission="evaluations.view">
                  <EvaluationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/:id"
              element={
                <ProtectedRoute
                  permission={["evaluations.view", "evaluations.hr_decisions"]}
                >
                  <EvaluationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluations/hr-decision-history"
              element={
                <ProtectedRoute
                  permission={["evaluations.view", "evaluations.hr_decisions"]}
                >
                  <HrDecisionHistory />
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
