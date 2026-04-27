import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Target, BookOpen, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Target, title: "Lộ trình cá nhân", desc: "Chọn trường chuyên → nhận lộ trình học phù hợp" },
  { icon: BookOpen, title: "Từ cơ bản đến đỗ chuyên", desc: "Xây nền vững chắc, tiến dần đến mức độ thi chuyên" },
  { icon: Zap, title: "Toàn bộ chuyên đề cần thiết", desc: "Bao phủ đầy đủ các chuyên đề trọng tâm trong đề thi chuyên" },
  { icon: CheckCircle, title: "Luyện tập và sửa lỗi", desc: "Bài tập có chọn lọc, phân tích lỗi sai và hướng dẫn khắc phục" },
];

const IntensiveSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Trophy className="h-4 w-4" /> Chương trình đặc biệt
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Ôn thi chuyên <span className="text-primary">cấp tốc</span>
            </h2>
            <p className="mb-6 text-muted-foreground">
              Chương trình luyện thi chuyên Toán được thiết kế riêng cho từng trường,
              kết hợp video bài giảng chuyên sâu, bộ đề thi thử và trợ giảng chấm bài tay.
            </p>
            <Link to="/catalogue?grade=advanced">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                Xem khóa học ôn chuyên
              </Button>
            </Link>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntensiveSection;
