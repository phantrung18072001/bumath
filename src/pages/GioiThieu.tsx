import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import {
  Trophy,
  GraduationCap,
  Users,
  Star,
  Phone,
  BookOpen,
  Target,
  Award,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";

const STATS = [
  { icon: Calendar, value: "6+", label: "Năm kinh nghiệm", color: "text-primary" },
  { icon: Users, value: "15+", label: "Học sinh đỗ chuyên KHTN", color: "text-emerald-600" },
  { icon: Trophy, value: "100%", label: "Tỉ lệ đỗ chuyên Toán", color: "text-amber-500" },
  { icon: Star, value: "100%", label: "Tỉ lệ đỗ chuyên KHTN", color: "text-rose-500" },
];

const ACHIEVEMENTS = [
  {
    year: "Lớp 9",
    title: "Giải Nhất HSG Toán cấp Tỉnh",
    location: "Nghệ An",
    icon: Trophy,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    year: "Lớp 10",
    title: "Huy chương Vàng Toán Bắc Trung Bộ",
    location: "Đạt học bổng Violet",
    icon: Award,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    year: "Lớp 11",
    title: "Giải Ba HSG Toán cấp Quốc gia",
    location: "THPT Chuyên Phan Bội Châu",
    icon: Trophy,
    color: "bg-primary/5 text-primary border-primary/20",
  },
  {
    year: "Lớp 12",
    title: "Giải Ba HSG Toán cấp Quốc gia + Giải Nhì cấp Tỉnh",
    location: "THPT Chuyên Phan Bội Châu",
    icon: Trophy,
    color: "bg-primary/5 text-primary border-primary/20",
  },
  {
    year: "ĐH",
    title: "Công Nghệ Thông Tin — ĐH Công Nghệ, ĐHQGHN",
    location: "Hà Nội",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
];

const TEACHING_HIGHLIGHTS = [
  "Nhận dạy từ lớp 6–9: ôn thi Toán Điều Kiện, vào trường Top công lập",
  "Luyện thi chuyên Toán, chuyên Toán-Tin các trường ở Hà Nội, Bình Dương, Hải Phòng, HCM, Đồng Nai, Thái Bình...",
  "Ôn thi HSG Toán cấp THPT",
  "Lộ trình học tập rõ ràng, giáo trình tự soạn, đúng trọng tâm, không lan man",
  "Dạy rất dễ hiểu, nhiệt tình hỗ trợ học sinh ngoài giờ học",
  "Có hơn 6 năm gia sư 1:1 (2020–2023) và dạy nhóm nhỏ từ 2024 đến nay",
];

const GioiThieu = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-amber-50/40 py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container max-w-4xl relative text-center">
            <Badge variant="secondary" className="mb-4 text-sm font-medium px-4 py-1">
              Về BuMath-X
            </Badge>
            <h1 className="text-4xl sm:text-6xl leading-[1.2] font-extrabold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              Học Toán đúng cách<br />
              <span className="text-primary">Hiểu thật sự</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              BuMath-X được xây dựng để giúp học sinh THCS học Toán theo cách tư duy, không phải
              ghi nhớ máy móc. Mỗi bài giảng đều được thiết kế để học sinh thực sự hiểu bản chất.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="cursor-pointer">
                <Link to="/danh-muc">Xem khoá học</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="cursor-pointer">
                <a href="/#tu-van">Liên hệ tư vấn</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-card">
          <div className="container py-12">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
                  <div className="mt-1 text-sm text-muted-foreground font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Teacher Profile */}
        <section className="container py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Giáo viên <span className="text-primary">BuMath-X</span>
              </h2>
              <p className="mt-3 text-muted-foreground">Đội ngũ giảng viên chất lượng cao, tận tâm với học sinh</p>
            </div>

            <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-5">
                  {/* Teacher photo */}
                  <div className="md:col-span-2 bg-gradient-to-br from-primary/20 to-amber-100/60 flex flex-col items-center justify-center py-12 px-8 gap-4">
                    <div className="w-40 h-40 rounded-full border-4 border-primary/30 overflow-hidden shadow-lg bg-white">
                      <img
                        src="/bumathx.png"
                        alt="Thầy Hoàng Anh - giáo viên BuMath-X"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold">Lê Hoàng Anh</div>
                      <div className="text-sm text-muted-foreground mt-1">Sinh năm 2001</div>
                      <Badge className="mt-3 bg-primary text-primary-foreground">Giáo viên Toán</Badge>
                    </div>
                    <Separator className="w-full" />
                    <div className="w-full space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>0379 172 879</span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>ĐH Công Nghệ — ĐHQG Hà Nội (CNTT)</span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>THPT Chuyên Phan Bội Châu, Nghệ An</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="md:col-span-3 p-8 space-y-8">
                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                        <div className="text-2xl font-extrabold text-amber-600">6+</div>
                        <div className="text-xs text-muted-foreground mt-1">Năm kinh nghiệm</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                        <div className="text-2xl font-extrabold text-emerald-600">100%</div>
                        <div className="text-xs text-muted-foreground mt-1">Đỗ chuyên Toán</div>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                        <div className="text-2xl font-extrabold text-primary">15+</div>
                        <div className="text-xs text-muted-foreground mt-1">HS đỗ chuyên KHTN</div>
                      </div>
                    </div>

                    {/* Teaching highlights */}
                    <div>
                      <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Đối tượng giảng dạy & phương pháp
                      </h3>
                      <ul className="space-y-2">
                        {TEACHING_HIGHLIGHTS.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievement Timeline */}
        <section className="bg-muted/40 py-20">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Thành tích <span className="text-primary">nổi bật</span>
              </h2>
              <p className="mt-3 text-muted-foreground">Hành trình học thuật và giảng dạy</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <Card className="overflow-hidden border-primary/20 shadow-md">
                <div className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] bg-muted">
                  <img
                    src="/gioithieu.jpg"
                    alt="Hồ sơ thành tích và hình ảnh giáo viên Lê Hoàng Anh"
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
              </Card>

              <div className="space-y-0">
                {ACHIEVEMENTS.map(({ year, title, location, icon: Icon, color }, index) => (
                  <div key={title} className="flex gap-5">
                    {/* Icon + connecting line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background shrink-0 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < ACHIEVEMENTS.length - 1 && (
                        <div className="w-px bg-border flex-1 min-h-[32px] my-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`flex-1 ${index < ACHIEVEMENTS.length - 1 ? "pb-6" : ""}`}>
                      <span className="text-xs font-bold text-muted-foreground">{year}</span>
                      <Card className="mt-1 hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4">
                          <div className="font-semibold text-sm leading-snug">{title}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {location}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why BuMath */}
        <section className="container py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Tại sao chọn <span className="text-primary">BuMath-X</span>?
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "Lộ trình rõ ràng", desc: "Giáo trình tự soạn, đúng trọng tâm, không lan man — từng bước học sinh đều biết mình đang ở đâu." },
                { icon: TrendingUp, title: "Tỉ lệ đỗ cao", desc: "100% học sinh ôn thi chuyên Toán đỗ được trường chuyên ở Hà Nội, HCM, Hải Phòng và nhiều tỉnh thành khác." },
                { icon: Users, title: "Hỗ trợ tận tâm", desc: "Thầy nhiệt tình hỗ trợ học sinh ngoài giờ học — không để các em loay hoay một mình với bài tập." },
                { icon: BookOpen, title: "Nội dung sâu", desc: "Học đúng bản chất, không học vẹt. Bài giảng được thiết kế để học sinh thực sự hiểu, không chỉ làm đúng theo mẫu." },
                { icon: Award, title: "Giáo viên có thực lực", desc: "Thầy Hoàng Anh đã giành giải Ba Quốc gia và Huy chương Vàng Bắc Trung Bộ — dạy từ chính trải nghiệm thi đấu thực chiến." },
                { icon: CheckCircle2, title: "Đa dạng đầu ra", desc: "Từ vào lớp 10 công lập, chuyên Toán, đến HSG THPT — BuMath-X hỗ trợ mọi mục tiêu của học sinh." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-bold">{title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container max-w-2xl text-center space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Sẵn sàng bắt đầu chưa?
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              Liên hệ thầy Hoàng Anh để được tư vấn lộ trình phù hợp, hoặc xem ngay danh mục khoá học.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="cursor-pointer">
                <Link to="/danh-muc">Xem danh mục khoá học</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="cursor-pointer bg-white border-white text-primary hover:bg-white/90 hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  0379 172 879
                </span>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default GioiThieu;
