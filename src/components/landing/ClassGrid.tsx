import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const classes = [
  { level: 7, slug: "lop-7", desc: "Đại số, Hình học cơ bản", courses: 8, color: "from-orange-400 to-amber-500" },
  { level: 8, slug: "lop-8", desc: "Phương trình, Tam giác đồng dạng", courses: 10, color: "from-sky-400 to-blue-500" },
  { level: 9, slug: "lop-9", desc: "Hệ PT, Đường tròn, Ôn thi vào 10", courses: 15, color: "from-emerald-400 to-green-500" },
  { level: 10, slug: "lop-10", desc: "Tập hợp, Hàm số, Vector", courses: 12, color: "from-violet-400 to-purple-500" },
  { level: 11, slug: "lop-11", desc: "Lượng giác, Tổ hợp, Xác suất", courses: 14, color: "from-rose-400 to-pink-500" },
  { level: 12, slug: "lop-12", desc: "Tích phân, Hình không gian, Ôn thi ĐH", courses: 18, color: "from-primary to-orange-600" },
];

const ClassGrid = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Chọn <span className="text-primary">lớp học</span> của bạn
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Chương trình từ lớp 7 đến lớp 12, biên soạn sát đề thi chuyên & đại học
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link to={`/class/${c.slug}`}>
                <Card className="group cursor-pointer overflow-hidden border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className={`h-2 bg-gradient-to-r ${c.color}`} />
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} font-black text-white text-xl shadow-md`}>
                        {c.level}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h3 className="mb-1 text-lg font-bold">Toán lớp {c.level}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{c.desc}</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                      {c.courses} khóa học
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassGrid;
