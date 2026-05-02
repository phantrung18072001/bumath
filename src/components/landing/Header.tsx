import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Phone, CreditCard, HelpCircle, LogOut, LayoutDashboard, BookOpen } from "lucide-react";

const staticNavItems = [
  { label: "Giới thiệu", to: "/gioi-thieu" },
  { label: "Danh mục", to: "/danh-muc" },
  { label: "Đề thi", to: "/de-thi" },
  { label: "Tài liệu", to: "/tai-lieu" },
  { label: "Tản mạn Toán & Cuộc sống", to: "/tan-man" },
];

const authNavItems = [
  { label: "Vào học", to: "/khoa-hoc" },
  { label: "Khám phá", to: "/danh-muc" },
  { label: "Đề thi", to: "/de-thi" },
  { label: "Tài liệu", to: "/tai-lieu" },
  { label: "Tản mạn Toán & Cuộc sống", to: "/tan-man" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const isAuthenticated = !loading && !!user;

  const navItems = isAuthenticated ? authNavItems : staticNavItems;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">

      {/* Desktop: grid 2 cols — logo spans 2 rows */}
      <div className="container hidden md:grid grid-cols-[auto_1fr]">

        {/* Logo — row-span-2 */}
        <Link
          to="/"
          className="row-span-2 flex items-center gap-2.5 pr-6"
        >
          <img src={`${import.meta.env.BASE_URL}bumath.jpeg`} alt="BuMath-X" className="h-24 w-24 rounded-xl object-cover" />
          <span className="text-3xl font-extrabold tracking-tight">
            Bu<span className="text-primary">Math</span>-X
          </span>
        </Link>

        {/* Row 1: SĐT / Hướng dẫn / Đăng nhập / Đăng ký / Thanh toán */}
        <div className="flex h-14 items-center justify-end gap-4 border-b border-border/50 pl-6">
          <a
            href="tel:0123456789"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            0123.456.789
          </a>
          <Link
            to="/huong-dan"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Hướng dẫn
          </Link>
          {loading ? (
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-foreground">
                {profile?.full_name || 'Tài khoản'}
              </span>
              {profile?.role === 'student' && (
                <Link to="/khoa-hoc">
                  <Button variant="ghost" size="sm" className="h-7 text-sm gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Vào học
                  </Button>
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link to="/quan-tri/nguoi-dung">
                  <Button variant="outline" size="sm" className="h-7 text-sm gap-1">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Trang quản lý
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-sm gap-1"
                onClick={() => signOut()}
              >
                <LogOut className="h-3.5 w-3.5" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link to="/dang-nhap">
                <Button variant="ghost" size="sm" className="h-7 text-sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/dang-ky">
                <Button size="sm" className="h-7 text-sm">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
          <Link to="/thanh-toan">
            <Button variant="outline" size="sm" className="h-7 text-sm gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Thanh toán
            </Button>
          </Link>
        </div>

        {/* Row 2: Nav links */}
        <nav className="flex h-14 items-center justify-evenly pl-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-1.5 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile: single row */}
      <div className="container flex h-14 items-center justify-between md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}bumath.jpeg`} alt="BuMath-X" className="h-8 w-8 rounded-xl object-cover" />
          <span className="text-lg font-extrabold tracking-tight">
            Bu<span className="text-primary">Math</span>-X
          </span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            0123.456.789
          </div>
          {loading ? (
            <div className="mt-3 h-10 rounded bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2 px-3">
                <span className="text-sm font-medium text-foreground">
                  {profile?.full_name || 'Tài khoản'}
                </span>
              </div>
              {profile?.role === 'student' && (
                <Link to="/khoa-hoc" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full min-h-[48px] gap-1 mb-1 justify-start" size="sm">
                    <BookOpen className="h-4 w-4" />
                    Vào học
                  </Button>
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link to="/quan-tri/nguoi-dung" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full min-h-[48px] gap-1 mb-1" size="sm">
                    <LayoutDashboard className="h-4 w-4" />
                    Trang quản lý
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full min-h-[48px] gap-1"
                size="sm"
                onClick={() => { signOut(); setMobileOpen(false); }}
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Link to="/dang-nhap" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/dang-ky" className="flex-1">
                <Button className="w-full" size="sm">Đăng ký</Button>
              </Link>
            </div>
          )}
          <div className="mt-2">
            <Link to="/thanh-toan" className="block">
              <Button variant="outline" className="w-full gap-1" size="sm">
                <CreditCard className="h-3.5 w-3.5" />
                Thanh toán
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
