import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { profile } = useAuth();

  // Role-aware redirect: students go to /courses, others go to /
  const homeLink = profile?.role === 'student' ? '/khoa-hoc' : '/';

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Trang không tìm thấy</p>
        <Link to={homeLink} className="text-primary underline hover:text-primary/90">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
