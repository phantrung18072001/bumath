import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-3 flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}bumath.jpeg`} alt="BuMath-X" className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-lg font-extrabold">
                Bu<span className="text-primary">Math</span>-X
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nền tảng học Toán online hàng đầu cho học sinh lớp 7–9.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 font-bold">Khóa học</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[7, 8, 9].map((l) => (
                <li key={l}>
                  <Link to={`/class/lop-${l}`} className="transition-colors hover:text-primary">
                    Toán lớp {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="mb-3 font-bold">Chương trình</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/on-thi-chuyen" className="transition-colors hover:text-primary">Ôn thi chuyên</Link></li>
              <li><Link to="#" className="transition-colors hover:text-primary">Học cơ bản</Link></li>
              <li><Link to="#" className="transition-colors hover:text-primary">Học nâng cao</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 font-bold">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> 0123.456.789
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> contact@bumath-x.vn
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © 2026 BuMath-X. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
