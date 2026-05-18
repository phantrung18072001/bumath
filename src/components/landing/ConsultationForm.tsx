import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { isValidVnPhone } from "@/lib/validators";

const APPS_SCRIPT_ENDPOINT = import.meta.env.VITE_APPS_SCRIPT_ENDPOINT as string;
const ConsultationForm = () => {
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const sdt = (form.elements.namedItem("sdt") as HTMLInputElement).value;

    if (!isValidVnPhone(sdt)) {
      toast.error("Số điện thoại không hợp lệ (VD: 0912345678)");
      setLoading(false);
      return;
    }

    const data = {
      nam_sinh: (form.elements.namedItem("nam_sinh") as HTMLInputElement).value,
      luc_hoc: (form.elements.namedItem("luc_hoc") as HTMLInputElement).value,
      ho_ten: (form.elements.namedItem("ho_ten") as HTMLInputElement).value,
      sdt,
      khoa_hoc: course,
    };

    try {
      const res = await fetch(APPS_SCRIPT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Đã gửi yêu cầu tư vấn! Chúng tôi sẽ liên hệ sớm nhất.");
        form.reset();
        setCourse("");
      } else {
        toast.error(`Gửi thất bại (${res.status}), vui lòng thử lại.`);
      }
    } catch {
      toast.error("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="tu-van" className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
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
            <Input name="nam_sinh" placeholder="Năm sinh của con:" />
            <Input name="luc_hoc" placeholder="Lực học của con:" />
            <Input name="ho_ten" placeholder="Họ tên phụ huynh: *" required />
            <Input name="sdt" placeholder="SĐT: *" type="tel" required />
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger>
                <SelectValue placeholder="--Khóa học--" />
              </SelectTrigger>
              <SelectContent>
                {[7, 8, 9].map((l) => (
                  <SelectItem key={l} value={`Lớp ${l}`}>
                    Toán lớp {l}
                  </SelectItem>
                ))}
                <SelectItem value="Chuyên">Ôn thi chuyên Toán</SelectItem>
              </SelectContent>
            </Select>
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
