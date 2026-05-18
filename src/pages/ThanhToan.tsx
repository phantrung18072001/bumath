import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, Zap, Target, Trophy, Star, CheckCircle2,
  Phone, MessageCircle, ArrowRight, CreditCard,
  ShieldCheck, Clock, Users, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

interface Package {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  badge?: string;
  target: string;
  duration: string;
  features: string[];
  highlight: boolean;
}

const PACKAGES: Package[] = [
  {
    id: "lop7",
    name: "Toán Lớp 7",
    price: "1.500.000 đ",
    priceNum: 1500000,
    icon: BookOpen,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    target: "Học sinh lớp 7 THCS",
    duration: "Trọn năm học",
    features: [
      "Toàn bộ chương trình Đại số & Hình học lớp 7",
      "Video bài giảng chi tiết từng bài",
      "Bài tập có hướng dẫn giải",
      "Kiểm tra định kỳ hàng tuần",
      "Trợ giảng hỗ trợ qua Zalo",
    ],
    highlight: false,
  },
  {
    id: "lop8",
    name: "Toán Lớp 8",
    price: "1.500.000 đ",
    priceNum: 1500000,
    icon: BookOpen,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    target: "Học sinh lớp 8 THCS",
    duration: "Trọn năm học",
    features: [
      "Phương trình bậc nhất, bậc hai",
      "Hình học phẳng — Tam giác đồng dạng",
      "Video bài giảng chi tiết từng bài",
      "Bài tập có hướng dẫn giải",
      "Trợ giảng hỗ trợ qua Zalo",
    ],
    highlight: false,
  },
  {
    id: "captoc",
    name: "Cấp Tốc",
    price: "2.000.000 đ",
    priceNum: 2000000,
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    target: "Học sinh lớp 9 — ôn vào cấp 3",
    duration: "6 tháng",
    features: [
      "Toàn bộ kiến thức lớp 9 trọng tâm",
      "Ôn luyện đề vào lớp 10 các năm",
      "Chiến lược làm bài thi hiệu quả",
      "Đề thi thử có chấm chữa chi tiết",
      "Hỗ trợ trực tiếp 1-1 khi cần",
    ],
    highlight: false,
  },
  {
    id: "onchuyen",
    name: "Ôn Chuyên",
    price: "3.000.000 đ",
    priceNum: 3000000,
    icon: Target,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    target: "Học sinh nhắm thi chuyên Toán",
    duration: "Trọn lộ trình",
    features: [
      "Chuyên đề nâng cao — theo trường chuyên",
      "Đề thi chuyên các năm có giải chi tiết",
      "Phương pháp tư duy giải toán đặc thù",
      "Luyện tập bài toán chọn lọc cấp độ cao",
      "Trợ giảng chấm bài tay — phản hồi cụ thể",
    ],
    highlight: false,
  },
  {
    id: "tutru",
    name: "Tứ Trụ",
    price: "2.500.000 đ",
    priceNum: 2500000,
    icon: Trophy,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    target: "PTNK · CNN · CSP · KHTN",
    duration: "Lộ trình chuyên biệt",
    features: [
      "Lộ trình riêng cho từng trường chuyên",
      "Phân tích đề thi đặc thù từng trường",
      "Kỹ thuật giải nhanh, trình bày đẹp",
      "Chiến lược ôn tập theo từng giai đoạn",
      "Cộng đồng học sinh ôn chuyên cùng nhóm",
    ],
    highlight: false,
  },
  {
    id: "toanbo",
    name: "Toàn Bộ",
    price: "4.000.000 đ",
    priceNum: 4000000,
    icon: Star,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary",
    badge: "Tiết kiệm nhất",
    target: "Học sinh muốn học toàn diện",
    duration: "Không giới hạn thời gian",
    features: [
      "Bao gồm TẤT CẢ các gói trên",
      "Ưu tiên hỗ trợ — phản hồi trong 2 giờ",
      "Tài liệu độc quyền — chỉ có ở BuMath-X",
      "Học không giới hạn — xem lại bất cứ lúc nào",
      "Cập nhật miễn phí khi có nội dung mới",
      "Hỗ trợ trực tiếp 1-1 không giới hạn",
    ],
    highlight: true,
  },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Bảo đảm hoàn tiền 7 ngày", desc: "Không hài lòng — hoàn 100% học phí trong 7 ngày đầu" },
  { icon: Clock, title: "Học mọi lúc mọi nơi", desc: "Video có thể xem lại không giới hạn, học theo tốc độ riêng" },
  { icon: Users, title: "Hỗ trợ tận tâm", desc: "Đội ngũ trợ giảng luôn sẵn sàng qua Zalo, phản hồi nhanh" },
  { icon: Award, title: "Cam kết chất lượng", desc: "95% học sinh đỗ vào trường mục tiêu sau khi học tại BuMath-X" },
];

function scrollToContact() {
  document.getElementById("lien-he")?.scrollIntoView({ behavior: "smooth" });
}

export default function ThanhToan() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-14 md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
          <div className="container relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10 border-0 px-4 py-1.5 text-sm font-semibold">
                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                Học phí minh bạch — Không phí ẩn
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mb-4 text-4xl font-black tracking-tight md:text-5xl"
            >
              Chọn gói học{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                phù hợp với bạn
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
            >
              Đầu tư cho tương lai học sinh — học phí hợp lý, chất lượng vượt trội,
              hỗ trợ tận tâm trong suốt hành trình chinh phục Toán học.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                { icon: ShieldCheck, text: "Hoàn tiền 7 ngày" },
                { icon: Users, text: "1000+ học sinh" },
                { icon: Award, text: "95% đỗ chuyên" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-16 md:pb-20">
          <div className="container">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PACKAGES.map((pkg, i) => {
                const Icon = pkg.icon;
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    <div
                      className={cn(
                        "group relative flex h-full flex-col rounded-2xl border-2 bg-card shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer",
                        pkg.highlight
                          ? "border-primary shadow-primary/20 shadow-lg"
                          : pkg.borderColor
                      )}
                      onClick={scrollToContact}
                    >
                      {pkg.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md">
                            <Star className="h-3 w-3 fill-current" />
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Icon + name */}
                        <div className="mb-4 flex items-start gap-3">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", pkg.bgColor)}>
                            <Icon className={cn("h-6 w-6", pkg.color)} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{pkg.name}</h3>
                            <p className="text-xs text-muted-foreground">{pkg.target}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-1">
                          <span className={cn("text-3xl font-black", pkg.highlight ? "text-primary" : pkg.color)}>
                            {pkg.price}
                          </span>
                        </div>
                        <p className="mb-5 text-xs text-muted-foreground">{pkg.duration}</p>

                        {/* Features */}
                        <ul className="space-y-2.5">
                          {pkg.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", pkg.highlight ? "text-primary" : pkg.color)} />
                              <span className="text-muted-foreground">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="mt-auto p-6 pt-0">
                        <Button
                          className={cn(
                            "min-h-[44px] w-full gap-2 cursor-pointer",
                            pkg.highlight ? "shadow-lg shadow-primary/25" : "variant-outline"
                          )}
                          variant={pkg.highlight ? "default" : "outline"}
                          onClick={scrollToContact}
                        >
                          Đăng ký tư vấn
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-y bg-muted/30 py-14 md:py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
                Tại sao chọn <span className="text-primary">BuMath-X</span>?
              </h2>
              <p className="text-muted-foreground">Cam kết mang lại trải nghiệm học tập tốt nhất</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 font-bold text-sm">{b.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact / CTA */}
        <section id="lien-he" className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-14 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-xl text-center"
            >
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Đăng ký ngay — <span className="text-primary">tư vấn miễn phí</span>
              </h2>
              <p className="mb-6 text-muted-foreground">
                Liên hệ trực tiếp để được tư vấn gói học phù hợp và nhận thông tin tài khoản thanh toán.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a href="https://zalo.me/0379172879" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/25 sm:w-auto">
                    <MessageCircle className="h-5 w-5" />
                    Nhắn Zalo ngay
                  </Button>
                </a>
                <Link to="/#tu-van">
                  <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
                    <Phone className="h-4 w-4" />
                    0379 172 879
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Phản hồi trong vòng <span className="font-semibold text-foreground">30 phút</span> trong giờ hành chính
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
