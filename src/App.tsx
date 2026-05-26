import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import StudentLayout from "./components/student/StudentLayout";
import UsersPage from "./pages/admin/UsersPage";
import CoursesPage from "./pages/admin/CoursesPage";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import GradingPage from "./pages/admin/GradingPage";
import PackagesPage from "./pages/admin/PackagesPage";
import StudentCoursesPage from "./pages/student/CoursesPage";
import StudentCourseDetailPage from "./pages/student/CourseDetailPage";
import StudentCataloguePage from "./pages/student/CataloguePage";
import ProfilePage from "./pages/student/ProfilePage";
import ExamSessionsPage from './pages/admin/ExamSessionsPage';
import ExamSessionDetailPage from './pages/admin/ExamSessionDetailPage';
import MockExamsPage from './pages/student/MockExamsPage';
import MockExamAttemptPage from './pages/student/MockExamAttemptPage';
import GioiThieu from './pages/GioiThieu';
import ThanhToan from './pages/ThanhToan';
import HuongDan from './pages/HuongDan';
import TaiLieuPage from './pages/TaiLieuPage';
import TaiLieuAdminPage from './pages/admin/TaiLieuAdminPage';
import ScrollToTop from "./components/shared/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/gioi-thieu" element={<GioiThieu />} />
            <Route path="/thanh-toan" element={<ThanhToan />} />
            <Route path="/huong-dan" element={<HuongDan />} />
            <Route path="/tai-lieu" element={<TaiLieuPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/quan-tri/nguoi-dung" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><UsersPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/khoa-hoc" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><CoursesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/khoa-hoc/:courseSlug" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout fullBleed><StudentCourseDetailPage isAdmin /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/goi-hoc" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><PackagesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/bai-nop" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><SubmissionsPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/bai-nop/:submissionId" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><GradingPage /></AdminLayout></StudentLayout></ProtectedRoute>} />

            <Route path="/quan-tri/tai-lieu" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><TaiLieuAdminPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/de-thi" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><ExamSessionsPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/quan-tri/de-thi/:sessionId" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><StudentLayout><AdminLayout><ExamSessionDetailPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/de-thi" element={<ProtectedRoute><MockExamsPage /></ProtectedRoute>} />
            <Route path="/de-thi/:sessionId" element={<ProtectedRoute><MockExamAttemptPage /></ProtectedRoute>} />
            <Route path="/khoa-hoc" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
            <Route path="/khoa-hoc/:courseSlug" element={<StudentCourseDetailPage />} />
            <Route path="/danh-muc" element={<StudentCataloguePage />} />
            <Route path="/ho-so" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
