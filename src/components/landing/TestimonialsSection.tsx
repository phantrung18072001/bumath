import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    school: "Đỗ THPT Chuyên Sư Phạm",
    avatar: "MA",
    content: "Nhờ BuMath-X mà em đã tự tin làm bài thi chuyên. Video giảng rất dễ hiểu, trợ giảng chấm bài rất kỹ!",
    rating: 5,
  },
  {
    name: "Trần Đức Huy",
    school: "Đỗ THPT Chuyên Khoa học Tự nhiên",
    avatar: "DH",
    content: "Kiểm tra hàng tuần giúp em rèn luyện áp lực thi thật. Bài chấm có phê chi tiết rất hữu ích.",
    rating: 5,
  },
  {
    name: "Lê Thị Hạnh",
    school: "Đỗ THPT Chuyên Ngoại ngữ",
    avatar: "TH",
    content: "Lộ trình học rõ ràng, dễ theo dõi tiến độ. Em thích nhất phần chat hỏi đáp với trợ giảng.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Học sinh nói gì về <span className="text-primary">BuMath-X</span>?
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Hàng trăm học sinh đã đỗ trường chuyên nhờ luyện tập với BuMath-X
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full border-0 shadow-md">
                <CardContent className="p-6">
                  <Quote className="mb-3 h-8 w-8 text-primary/20" />
                  <p className="mb-4 text-sm leading-relaxed text-foreground/80">{t.content}</p>
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.school}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
