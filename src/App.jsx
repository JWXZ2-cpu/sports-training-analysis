import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { LanguageProvider } from "./locales/index.jsx";
import { ROLE_HOME } from "./styles/sharedStyles.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AthleteGuard from "./components/AthleteGuard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Login from "./pages/Login.jsx";
import AthleteHome from "./pages/AthleteHome.jsx";
import AthleteReport from "./pages/AthleteReport.jsx";
import AthleteDiary from "./pages/AthleteDiary.jsx";
import AthleteSummary from "./pages/AthleteSummary.jsx";
import AthleteNotification from "./pages/AthleteNotification.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import CoachHome from "./pages/CoachHome.jsx";
import CoachAISuggestion from "./pages/CoachAISuggestion.jsx";
import DoctorHome from "./pages/DoctorHome.jsx";
import DoctorAthleteDetail from "./pages/DoctorAthleteDetail.jsx";
import DoctorConflictCheck from "./pages/DoctorConflictCheck.jsx";
import AssistantHome from "./pages/AssistantHome.jsx";
import AssistantProfile from "./pages/AssistantProfile.jsx";
import ManagerHome from "./pages/ManagerHome.jsx";
import ManagerAttendance from "./pages/ManagerAttendance.jsx";
import ManagerProfile from "./pages/ManagerProfile.jsx";
import RolePlaceholder from "./pages/RolePlaceholder.jsx";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 登录页 */}
      <Route path="/login" element={user ? <NavigateToRole /> : <Login />} />

      {/* 运动员界面 — 全部包裹 AthleteGuard，首次登录强制体测 */}
      <Route path="/athlete" element={
        <ProtectedRoute allowedRoles={["athlete"]}>
          <AthleteGuard>
            <AthleteHomeWrapper />
          </AthleteGuard>
        </ProtectedRoute>
      } />
      <Route path="/athlete/report/:id" element={
        <ProtectedRoute allowedRoles={["athlete"]}>
          <AthleteGuard>
            <AthleteReport />
          </AthleteGuard>
        </ProtectedRoute>
      } />
      <Route path="/athlete/diary" element={
        <ProtectedRoute allowedRoles={["athlete"]}>
          <AthleteGuard>
            <AthleteDiary />
          </AthleteGuard>
        </ProtectedRoute>
      } />
      <Route path="/athlete/summary" element={
        <ProtectedRoute allowedRoles={["athlete"]}>
          <AthleteGuard>
            <AthleteSummary />
          </AthleteGuard>
        </ProtectedRoute>
      } />
      <Route path="/athlete/profile" element={
        <ProtectedRoute allowedRoles={["athlete"]}>
          <AthleteGuard>
            <MyProfile />
          </AthleteGuard>
        </ProtectedRoute>
      } />
      <Route path="/athlete/notify" element={
        <ProtectedRoute allowedRoles={["athlete"]}>
          <AthleteGuard>
            <AthleteNotification />
          </AthleteGuard>
        </ProtectedRoute>
      } />

      {/* 主教练界面（单页Tab切换） */}
      <Route path="/coach" element={
        <ProtectedRoute allowedRoles={["head_coach"]}>
          <CoachHome />
        </ProtectedRoute>
      } />
      {/* AI辅助计划（独立页面，从计划Tab跳转） */}
      <Route path="/coach/ai-suggestion" element={
        <ProtectedRoute allowedRoles={["head_coach"]}>
          <CoachAISuggestion onBack={() => window.location.href = "/coach"} />
        </ProtectedRoute>
      } />

      {/* 助教界面 */}
      <Route path="/assistant" element={
        <ProtectedRoute allowedRoles={["assistant"]}>
          <AssistantHome />
        </ProtectedRoute>
      } />
      <Route path="/assistant/profile" element={
        <ProtectedRoute allowedRoles={["assistant"]}>
          <AssistantProfile />
        </ProtectedRoute>
      } />

      {/* 队医界面 */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorHomeWrapper />
        </ProtectedRoute>
      } />
      <Route path="/doctor/athlete/:id" element={
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorAthleteDetail />
        </ProtectedRoute>
      } />
      <Route path="/doctor/conflict-check" element={
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorConflictCheckWrapper />
        </ProtectedRoute>
      } />

      {/* 管理人员界面 */}
      <Route path="/manager" element={
        <ProtectedRoute allowedRoles={["manager"]}>
          <ManagerHomeWrapper />
        </ProtectedRoute>
      } />
      <Route path="/manager/attendance" element={
        <ProtectedRoute allowedRoles={["manager"]}>
          <ManagerAttendance />
        </ProtectedRoute>
      } />
      <Route path="/manager/profile" element={
        <ProtectedRoute allowedRoles={["manager"]}>
          <ManagerProfile />
        </ProtectedRoute>
      } />

      {/* 根路径 */}
      <Route path="/" element={<NavigateToRole />} />
      <Route path="*" element={<NavigateToRole />} />
    </Routes>
  );
}

// 运动员首页包装器：处理反馈流程跳转
function AthleteHomeWrapper() {
  const handleStartFeedback = () => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent("startFeedback"));
  };
  const handleGoSummary = () => { window.location.href = "/athlete/summary"; };
  return <AthleteHome onStartFeedback={handleStartFeedback} onGoSummary={handleGoSummary} />;
}

// 队医首页包装器
function DoctorHomeWrapper() {
  const handleGoAthleteDetail = (id) => { window.location.href = `/doctor/athlete/${id}`; };
  const handleGoConflictCheck = () => { window.location.href = "/doctor/conflict-check"; };
  return <DoctorHome onGoAthleteDetail={handleGoAthleteDetail} onGoConflictCheck={handleGoConflictCheck} />;
}

// 管理人员首页包装器
function ManagerHomeWrapper() {
  return <ManagerHome />;
}

// 队医冲突检查包装器
function DoctorConflictCheckWrapper() {
  const handleBack = () => { window.location.href = "/doctor"; };
  return <DoctorConflictCheck onBack={handleBack} />;
}

function NavigateToRole() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return <Navigate to={ROLE_HOME[user.role] || "/login"} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
