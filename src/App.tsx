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
import ChaptersPage from "./pages/admin/ChaptersPage";
import LessonsPage from "./pages/admin/LessonsPage";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import GradingPage from "./pages/admin/GradingPage";
import StudentCoursesPage from "./pages/student/CoursesPage";
import StudentCourseDetailPage from "./pages/student/CourseDetailPage";
import StudentCataloguePage from "./pages/student/CataloguePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><UsersPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><CoursesPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/admin/courses/:courseSlug" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><ChaptersPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/admin/courses/:courseSlug/chapters/:chapterSlug" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><LessonsPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/admin/submissions" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><SubmissionsPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/admin/submissions/:submissionId" element={<ProtectedRoute requiredRole="admin"><StudentLayout><AdminLayout><GradingPage /></AdminLayout></StudentLayout></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
            <Route path="/courses/:courseSlug" element={<StudentCourseDetailPage />} />
            <Route path="/catalogue" element={<StudentCataloguePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
