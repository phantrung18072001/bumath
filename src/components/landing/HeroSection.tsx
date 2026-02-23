import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium shadow-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span>Nền tảng học Toán #1 cho học sinh lớp 7–12</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-6xl"
          >
            Chinh phục{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Toán học
            </span>{" "}
            cùng BuMath-X
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
          >
            Hệ thống bài giảng video, bài tập, kiểm tra hàng tuần và trợ giảng
            hỗ trợ 1-1 giúp bạn tự tin đỗ trường chuyên.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="gap-2 text-base font-semibold shadow-lg shadow-primary/25">
                Bắt đầu học ngay <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 text-base">
              <Play className="h-4 w-4" /> Xem giới thiệu
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6"
          >
            {[
              { value: "500+", label: "Bài giảng" },
              { value: "1000+", label: "Học sinh" },
              { value: "95%", label: "Đỗ chuyên" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-primary md:text-3xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
