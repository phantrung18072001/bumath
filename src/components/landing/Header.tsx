import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const classLevels = [
  { name: "Lớp 7", slug: "lop-7" },
  { name: "Lớp 8", slug: "lop-8" },
  { name: "Lớp 9", slug: "lop-9" },
  { name: "Lớp 10", slug: "lop-10" },
  { name: "Lớp 11", slug: "lop-11" },
  { name: "Lớp 12", slug: "lop-12" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [classDropdown, setClassDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-black text-primary-foreground text-lg">
            B
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Bu<span className="text-primary">Math</span>-X
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setClassDropdown(true)}
            onMouseLeave={() => setClassDropdown(false)}
          >
            <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground">
              Lớp học <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {classDropdown && (
              <div className="absolute left-0 top-full w-40 rounded-xl border bg-card p-2 shadow-lg">
                {classLevels.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/class/${c.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/on-thi-chuyen"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
          >
            Ôn thi chuyên
          </Link>
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="tel:0123456789"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <Phone className="h-4 w-4" />
            0123.456.789
          </a>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Đăng nhập
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Đăng ký</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="space-y-1">
            {classLevels.map((c) => (
              <Link
                key={c.slug}
                to={`/class/${c.slug}`}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/on-thi-chuyen"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              Ôn thi chuyên
            </Link>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/login" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full" size="sm">
                Đăng ký
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
