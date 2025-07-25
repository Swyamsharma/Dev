import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoginSuccess from "./pages/LoginSuccess";
import ProblemListPage from "./pages/ProblemListPage";
import ProblemDetailPage from "./pages/ProblemDetailPage";

// Private Pages
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProblemListPage from "./pages/admin/AdminProblemListPage";
import ProblemFormPage from "./pages/admin/ProblemFormPage";
import AdminSubmissionsPage from "./pages/admin/AdminSubmissionsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const mainClass = `flex-1 flex flex-col min-h-0 overflow-y-auto ${isHomePage ? '' : 'px-6 py-8'}`;

  return (
    <main className={mainClass}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />
        <Route path="/login/success" element={<LoginSuccess />} />
        <Route path="/problems" element={<ProblemListPage />} />
        <Route path="/problems/:id" element={<ProblemDetailPage />} />

        <Route path='/dashboard' element={<PrivateRoute />}>
          <Route path='/dashboard' element={<DashboardPage />} />
        </Route>
        <Route path='/profile' element={<PrivateRoute />}>
          <Route path='/profile' element={<ProfilePage />} />
        </Route>
        
        <Route path='/admin' element={<AdminRoute />}>
          <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
          <Route path='/admin/problems' element={<AdminProblemListPage />} />
          <Route path='/admin/problems/new' element={<ProblemFormPage />} />
          <Route path='/admin/problems/edit/:id' element={<ProblemFormPage />} />
          <Route path='/admin/submissions' element={<AdminSubmissionsPage />} />
          <Route path='/admin/users' element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </main>
  );
}


function App() {
  return (
    <>
      <Router>
        <div className="flex flex-col h-screen bg-secondary">
          <Header />
          <AppContent />
        </div>
      </Router>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ 
        duration: 4000,
        className: 'toast-style' 
      }} />
    </>
  );
}
export default App;