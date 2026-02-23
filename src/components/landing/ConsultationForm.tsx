import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ConsultationForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Đã gửi yêu cầu tư vấn! Chúng tôi sẽ liên hệ sớm nhất.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Đăng ký <span className="text-primary">tư vấn miễn phí</span>
            </h2>
            <p className="text-muted-foreground">
              Để lại thông tin, đội ngũ BuMath-X sẽ tư vấn lộ trình học phù hợp cho bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-lg">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Họ và tên *" required />
              <Input placeholder="Số điện thoại *" type="tel" required />
            </div>
            <Input placeholder="Email" type="email" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {[7, 8, 9, 10, 11, 12].map((l) => (
                  <SelectItem key={l} value={String(l)}>
                    Lớp {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Ghi chú thêm (trường chuyên mong muốn, mục tiêu...)" rows={3} />
            <Button type="submit" className="w-full gap-2 shadow-lg shadow-primary/25" size="lg" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationForm;
