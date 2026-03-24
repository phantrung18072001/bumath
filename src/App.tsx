import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import UsersPage from "./pages/admin/UsersPage";
import CoursesPage from "./pages/admin/CoursesPage";
import ChaptersPage from "./pages/admin/ChaptersPage";
import LessonsPage from "./pages/admin/LessonsPage";

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
            <Route path="/pending" element={<Pending />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><CoursesPage /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId" element={<ProtectedRoute requiredRole="admin"><ChaptersPage /></ProtectedRoute>} />
            <Route path="/admin/courses/:courseId/chapters/:chapterId" element={<ProtectedRoute requiredRole="admin"><LessonsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
