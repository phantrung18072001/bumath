import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserPlus, BookOpen, PlayCircle, FileText, CheckCircle2,
  BarChart2, ClipboardList, Phone, ArrowRight, Search,
  GraduationCap, Bell, UserCircle, CreditCard, HelpCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

/* ─── SVG Illustrations ─── */
function IllustRegister() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* top bar */}
      <rect width="280" height="32" rx="12" fill="#E2E8F0"/>
      <rect width="280" height="20" y="12" fill="#E2E8F0"/>
      <circle cx="20" cy="16" r="5" fill="#FC8181"/>
      <circle cx="36" cy="16" r="5" fill="#F6AD55"/>
      <circle cx="52" cy="16" r="5" fill="#68D391"/>
      {/* logo */}
      <rect x="110" y="38" width="60" height="10" rx="5" fill="#F97316" opacity="0.9"/>
      {/* inputs */}
      <rect x="20" y="58" width="240" height="22" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      <rect x="30" y="65" width="64" height="8" rx="3" fill="#CBD5E1"/>
      <rect x="20" y="86" width="240" height="22" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      <rect x="30" y="93" width="80" height="8" rx="3" fill="#CBD5E1"/>
      <rect x="20" y="114" width="240" height="22" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      <rect x="30" y="121" width="56" height="8" rx="3" fill="#CBD5E1"/>
      {/* button */}
      <rect x="20" y="144" width="240" height="20" rx="8" fill="#F97316"/>
      <rect x="98" y="150" width="84" height="8" rx="4" fill="white" opacity="0.9"/>
    </svg>
  );
}

function IllustCatalog() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* header */}
      <rect x="12" y="12" width="120" height="10" rx="5" fill="#1E293B" opacity="0.7"/>
      {/* filter pills */}
      <rect x="12" y="30" width="46" height="16" rx="8" fill="#F97316"/>
      <rect x="64" y="30" width="40" height="16" rx="8" fill="#E2E8F0"/>
      <rect x="110" y="30" width="40" height="16" rx="8" fill="#E2E8F0"/>
      <rect x="156" y="30" width="50" height="16" rx="8" fill="#E2E8F0"/>
      {/* cards */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={12 + i*88} y="56" width="80" height="102" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
          <rect x={12 + i*88} y="56" width="80" height="6" rx="10" fill={["#F97316","#38BDF8","#34D399"][i]}/>
          <rect x={20 + i*88} y="72" width={["28","28","28"][i]} height="22" rx="6" fill={["#FED7AA","#E0F2FE","#D1FAE5"][i]}/>
          <text x={34 + i*88} y="88" textAnchor="middle" fontSize="12" fontWeight="700" fill={["#F97316","#0284C7","#059669"][i]}>{[7,8,9][i]}</text>
          <rect x={20 + i*88} y="100" width="56" height="7" rx="3" fill="#CBD5E1"/>
          <rect x={20 + i*88} y="113" width="44" height="6" rx="3" fill="#E2E8F0"/>
          <rect x={20 + i*88} y="125" width="50" height="6" rx="3" fill="#E2E8F0"/>
          <rect x={20 + i*88} y="143" width="56" height="11" rx="5" fill="#F97316" opacity="0.9"/>
        </g>
      ))}
    </svg>
  );
}

function IllustEnroll() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* card */}
      <rect x="40" y="12" width="200" height="146" rx="12" fill="white" stroke="#F97316" strokeWidth="2"/>
      {/* badge */}
      <rect x="96" y="22" width="88" height="16" rx="8" fill="#F97316"/>
      <rect x="110" y="27" width="60" height="6" rx="3" fill="white" opacity="0.9"/>
      {/* icon */}
      <rect x="114" y="46" width="52" height="28" rx="8" fill="#FED7AA"/>
      <rect x="130" y="55" width="20" height="10" rx="3" fill="#F97316"/>
      {/* price */}
      <rect x="76" y="82" width="128" height="12" rx="6" fill="#F97316" opacity="0.15"/>
      <rect x="90" y="85" width="100" height="6" rx="3" fill="#F97316" opacity="0.8"/>
      {/* checks */}
      {[0,1,2].map(i=>(
        <g key={i}>
          <circle cx="62" cy={106 + i*14} r="5" fill="#D1FAE5"/>
          <rect x="71" y={102 + i*14} width="90" height="6" rx="3" fill="#E2E8F0"/>
        </g>
      ))}
      {/* button */}
      <rect x="56" y="148" width="168" height="6" rx="3" fill="#F97316" opacity="0.3"/>
    </svg>
  );
}

function IllustMyCourses() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      <rect x="12" y="12" width="100" height="10" rx="5" fill="#1E293B" opacity="0.7"/>
      {/* course rows */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x="12" y={32 + i*44} width="256" height="38" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
          <rect x="20" y={38 + i*44} width="28" height="26" rx="6" fill={["#FED7AA","#E0F2FE","#D1FAE5"][i]}/>
          <text x="34" y={55 + i*44} textAnchor="middle" fontSize="11" fontWeight="700" fill={["#F97316","#0284C7","#059669"][i]}>{[7,8,9][i]}</text>
          <rect x="56" y={40 + i*44} width="80" height="7" rx="3" fill="#CBD5E1"/>
          <rect x="56" y={52 + i*44} width="140" height="5" rx="2.5" fill="#E2E8F0"/>
          {/* progress bar bg */}
          <rect x="56" y={62 + i*44} width="140" height="4" rx="2" fill="#F1F5F9"/>
          {/* progress fill */}
          <rect x="56" y={62 + i*44} width={[100,60,30][i]} height="4" rx="2" fill="#F97316"/>
          <rect x="204" y={40 + i*44} width="30" height="22" rx="6" fill={["#FED7AA","#E0F2FE","#D1FAE5"][i]}/>
          <rect x="210" y={49 + i*44} width="18" height="5" rx="2" fill={["#F97316","#0284C7","#059669"][i]}/>
        </g>
      ))}
    </svg>
  );
}

function IllustVideo() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* video player */}
      <rect x="12" y="12" width="256" height="118" rx="10" fill="#1E293B"/>
      {/* math decoration */}
      <text x="36" y="50" fontSize="11" fill="white" opacity="0.15" fontFamily="monospace">x² + 2x + 1</text>
      <text x="160" y="80" fontSize="10" fill="white" opacity="0.12" fontFamily="monospace">= (x+1)²</text>
      {/* play button */}
      <circle cx="140" cy="68" r="22" fill="white" opacity="0.15"/>
      <circle cx="140" cy="68" r="16" fill="#F97316"/>
      <polygon points="136,62 136,74 150,68" fill="white"/>
      {/* progress bar */}
      <rect x="12" y="136" width="256" height="4" rx="2" fill="#E2E8F0"/>
      <rect x="12" y="136" width="110" height="4" rx="2" fill="#F97316"/>
      <circle cx="122" cy="138" r="5" fill="#F97316"/>
      {/* time */}
      <rect x="12" y="146" width="30" height="6" rx="3" fill="#CBD5E1"/>
      <rect x="238" y="146" width="30" height="6" rx="3" fill="#CBD5E1"/>
    </svg>
  );
}

function IllustDownload() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* pdf card */}
      <rect x="60" y="16" width="160" height="110" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      {/* pdf icon */}
      <rect x="100" y="28" width="80" height="60" rx="8" fill="#FEE2E2"/>
      <rect x="112" y="40" width="56" height="8" rx="4" fill="#EF4444" opacity="0.8"/>
      <rect x="112" y="54" width="40" height="5" rx="2.5" fill="#FCA5A5"/>
      <rect x="112" y="63" width="48" height="5" rx="2.5" fill="#FCA5A5"/>
      <rect x="112" y="72" width="36" height="5" rx="2.5" fill="#FCA5A5"/>
      {/* filename */}
      <rect x="76" y="96" width="128" height="8" rx="4" fill="#CBD5E1"/>
      <rect x="100" y="108" width="80" height="6" rx="3" fill="#E2E8F0"/>
      {/* download button */}
      <rect x="72" y="134" width="136" height="26" rx="8" fill="#F97316"/>
      <rect x="104" y="143" width="72" height="8" rx="4" fill="white" opacity="0.9"/>
      {/* download arrow icon */}
      <rect x="116" y="145" width="4" height="10" rx="2" fill="#F97316" opacity="0"/>
    </svg>
  );
}

function IllustUpload() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* upload zone */}
      <rect x="16" y="14" width="248" height="88" rx="10" fill="white" stroke="#F97316" strokeWidth="1.5" strokeDasharray="6 3"/>
      {/* arrow up */}
      <circle cx="140" cy="42" r="16" fill="#FED7AA"/>
      <rect x="136" y="36" width="8" height="14" rx="3" fill="#F97316"/>
      <polygon points="128,42 140,30 152,42" fill="#F97316"/>
      <rect x="80" y="66" width="120" height="7" rx="3.5" fill="#CBD5E1"/>
      {/* uploaded file */}
      <rect x="16" y="110" width="248" height="30" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
      <rect x="24" y="118" width="20" height="14" rx="4" fill="#FEE2E2"/>
      <rect x="27" y="121" width="14" height="3" rx="1.5" fill="#EF4444"/>
      <rect x="50" y="119" width="80" height="6" rx="3" fill="#CBD5E1"/>
      <rect x="50" y="129" width="50" height="5" rx="2.5" fill="#E2E8F0"/>
      <circle cx="236" cy="125" r="8" fill="#D1FAE5"/>
      <rect x="232" y="123" width="8" height="4" rx="1" fill="#22C55E" opacity="0"/>
      <polygon points="233,125 236,128 241,122" fill="#22C55E" strokeWidth="1.5"/>
      {/* submit button */}
      <rect x="16" y="148" width="248" height="16" rx="6" fill="#F97316" opacity="0.9"/>
      <rect x="100" y="153" width="80" height="6" rx="3" fill="white" opacity="0.9"/>
    </svg>
  );
}

function IllustProgress() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* stat cards row */}
      {[
        { x: 12, label: "Bài đã học", val: "12", color: "#F97316", bg: "#FED7AA" },
        { x: 98, label: "Đang học", val: "3", color: "#0284C7", bg: "#E0F2FE" },
        { x: 184, label: "Hoàn thành", val: "9", color: "#059669", bg: "#D1FAE5" },
      ].map(s => (
        <g key={s.x}>
          <rect x={s.x} y="12" width="80" height="50" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
          <rect x={s.x+10} y="20" width="24" height="14" rx="6" fill={s.bg}/>
          <text x={s.x+22} y="31" textAnchor="middle" fontSize="9" fontWeight="700" fill={s.color}>{s.val}</text>
          <rect x={s.x+10} y="40" width="60" height="6" rx="3" fill="#E2E8F0"/>
        </g>
      ))}
      {/* progress bars */}
      {[
        { y: 76, label: "Chương 1 — Đại số", pct: 220, color: "#F97316" },
        { y: 104, label: "Chương 2 — Hình học", pct: 140, color: "#0284C7" },
        { y: 132, label: "Chương 3 — Thống kê", pct: 60, color: "#059669" },
      ].map(b => (
        <g key={b.y}>
          <rect x="12" y={b.y} width="140" height="6" rx="3" fill="#CBD5E1"/>
          <rect x="12" y={b.y} width={b.pct} height="6" rx="3" fill={b.color}/>
          <rect x="160" y={b.y - 2} width="108" height="10" rx="3" fill="#E2E8F0"/>
        </g>
      ))}
    </svg>
  );
}

function IllustExam() {
  return (
    <svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="280" height="170" rx="12" fill="#F8FAFC"/>
      {/* header bar */}
      <rect x="12" y="12" width="256" height="34" rx="10" fill="#1E293B"/>
      <rect x="22" y="22" width="80" height="8" rx="4" fill="white" opacity="0.7"/>
      {/* timer */}
      <rect x="202" y="18" width="56" height="20" rx="8" fill="#F97316"/>
      <rect x="212" y="23" width="36" height="8" rx="4" fill="white" opacity="0.9"/>
      {/* question rows */}
      {[0,1,2,3].map(i=>(
        <g key={i}>
          <rect x="12" y={54 + i*26} width="256" height="22" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
          <circle cx="26" cy={65 + i*26} r="6" fill="#FED7AA"/>
          <text x="26" y={68 + i*26} textAnchor="middle" fontSize="7" fontWeight="700" fill="#F97316">{i+1}</text>
          <rect x="38" y={61 + i*26} width="120" height="7" rx="3" fill="#CBD5E1"/>
          <circle cx="218" cy={65 + i*26} r="6" fill="#E2E8F0"/>
          {i===1 && <circle cx="218" cy="91" r="4" fill="#F97316"/>}
        </g>
      ))}
      {/* submit */}
      <rect x="64" y="162" width="152" height="4" rx="2" fill="#F97316" opacity="0.4"/>
    </svg>
  );
}

const STEP_ILLUSTRATIONS: Record<number, React.ReactNode> = {
  1: <IllustRegister />,
  2: <IllustCatalog />,
  3: <IllustEnroll />,
  4: <IllustMyCourses />,
  5: <IllustVideo />,
  6: <IllustDownload />,
  7: <IllustUpload />,
  8: <IllustProgress />,
  9: <IllustExam />,
};

interface Step {
  number: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  tips: string[];
  color: string;
  bgColor: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: UserPlus,
    title: "Đăng ký tài khoản",
    desc: "Tạo tài khoản miễn phí để bắt đầu hành trình học Toán cùng BuMath-X.",
    tips: [
      "Truy cập trang Đăng ký và điền đầy đủ thông tin",
      "Xác nhận email — tài khoản sẽ được duyệt trong vòng 24 giờ",
      "Sau khi được duyệt, bạn có thể đăng nhập và vào học ngay",
    ],
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    number: 2,
    icon: Search,
    title: "Xem danh mục khóa học",
    desc: "Khám phá toàn bộ khóa học được phân loại theo lớp và chương trình học.",
    tips: [
      "Vào mục Danh mục trên thanh điều hướng",
      "Lọc theo lớp (7, 8, 9) hoặc chương trình Ôn chuyên",
      "Xem thông tin chi tiết từng khóa — mô tả, số bài học, nội dung",
    ],
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  {
    number: 3,
    icon: GraduationCap,
    title: "Đăng ký khóa học",
    desc: "Chọn khóa học phù hợp và liên hệ để kích hoạt quyền truy cập.",
    tips: [
      "Chọn gói học phù hợp tại trang Thanh toán",
      "Liên hệ qua Zalo hoặc gọi điện để được hỗ trợ",
      "Nhận thông tin kích hoạt khóa học trong vòng 1 giờ",
    ],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    number: 4,
    icon: BookOpen,
    title: "Vào học — Khóa học của tôi",
    desc: "Truy cập danh sách khóa học đã đăng ký và bắt đầu học.",
    tips: [
      "Đăng nhập và chọn Vào học từ thanh điều hướng",
      "Tất cả khóa học đã kích hoạt hiển thị ở đây",
      "Nhấp vào khóa học để xem danh sách chương và bài học",
    ],
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    number: 5,
    icon: PlayCircle,
    title: "Xem video bài giảng",
    desc: "Học qua video bài giảng được soạn công phu, dễ hiểu và trực quan.",
    tips: [
      "Chọn bài học muốn xem — video phát ngay trên trình duyệt",
      "Có thể tua lại, xem lại bất kỳ lúc nào",
      "Ghi chú quan trọng ngay trong quá trình xem",
    ],
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    number: 6,
    icon: FileText,
    title: "Tải và làm bài tập",
    desc: "Mỗi bài học đều đi kèm bài tập có chọn lọc để củng cố kiến thức.",
    tips: [
      "Tải file bài tập (PDF) ngay trong trang bài học",
      "Làm bài tập sau khi xem xong video bài giảng",
      "Nộp bài trực tiếp trên hệ thống để được chấm",
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    number: 7,
    icon: ClipboardList,
    title: "Nộp bài và nhận phản hồi",
    desc: "Trợ giảng chấm bài thủ công và cho phản hồi chi tiết từng bước giải.",
    tips: [
      "Chụp ảnh bài làm hoặc scan file PDF rồi upload lên hệ thống",
      "Trợ giảng chấm và phản hồi trong vòng 24 giờ",
      "Xem nhận xét chi tiết để biết mình sai ở đâu và cách khắc phục",
    ],
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    number: 8,
    icon: BarChart2,
    title: "Theo dõi tiến độ học tập",
    desc: "Xem lại tiến trình học, những bài đã hoàn thành và kết quả bài nộp.",
    tips: [
      "Vào trang Hồ sơ để xem tiến độ tổng quan",
      "Các bài đã học được đánh dấu hoàn thành",
      "Kết quả bài nộp hiển thị ngay trong trang bài học",
    ],
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    number: 9,
    icon: CheckCircle2,
    title: "Thi thử — Đề thi",
    desc: "Làm đề thi thử để kiểm tra trình độ và làm quen với dạng đề thực tế.",
    tips: [
      "Vào mục Đề thi trên thanh điều hướng",
      "Chọn đề thi phù hợp với mục tiêu và lớp học",
      "Nộp bài để nhận kết quả và phân tích lỗi sai",
    ],
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
];

const FEATURES = [
  {
    icon: Bell,
    title: "Thông báo",
    desc: "Nhận thông báo khi có bài học mới, kết quả chấm bài hoặc thông tin quan trọng.",
  },
  {
    icon: UserCircle,
    title: "Hồ sơ cá nhân",
    desc: "Xem và cập nhật thông tin cá nhân, theo dõi lịch sử học tập.",
  },
  {
    icon: CreditCard,
    title: "Thanh toán & Gói học",
    desc: "Xem thông tin gói học đang sử dụng và liên hệ để nâng cấp khi cần.",
  },
  {
    icon: HelpCircle,
    title: "Hỗ trợ kỹ thuật",
    desc: "Gặp sự cố kỹ thuật? Liên hệ ngay qua Zalo để được hỗ trợ nhanh chóng.",
  },
];

export default function HuongDan() {
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium shadow-sm">
                <HelpCircle className="h-4 w-4 text-primary" />
                Hướng dẫn sử dụng BuMath-X
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mb-4 text-4xl font-black tracking-tight md:text-5xl"
            >
              Bắt đầu học{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                chỉ trong 5 phút
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
              className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
            >
              Hướng dẫn chi tiết từng bước — từ lúc đăng ký đến khi hoàn thành khóa học
              và nhận phản hồi từ trợ giảng.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link to="/dang-ky">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                  Đăng ký ngay <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/danh-muc">
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" /> Xem khóa học
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-16 md:pb-20">
          <div className="container">
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
                Quy trình học tập{" "}
                <span className="text-primary">từng bước</span>
              </h2>
              <p className="text-muted-foreground">
                Theo dõi các bước sau để tận dụng tối đa trải nghiệm học tại BuMath-X
              </p>
            </div>

            <div className="space-y-5">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                  >
                    <div className="rounded-2xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-stretch">
                        {/* Left: icon + content */}
                        <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start">
                          {/* Step number + icon */}
                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:gap-1">
                            <div className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl",
                              step.bgColor
                            )}>
                              <Icon className={cn("h-6 w-6", step.color)} />
                            </div>
                            <span className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-bold",
                              step.bgColor, step.color
                            )}>
                              Bước {step.number}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="mb-1 text-base font-bold">{step.title}</h3>
                            <p className="mb-3 text-sm text-muted-foreground">{step.desc}</p>
                            <ul className="space-y-1.5">
                              {step.tips.map((tip) => (
                                <li key={tip} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0", step.color)} />
                                  <span className="text-foreground/80">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Right: illustration */}
                        <div className={cn(
                          "flex items-center justify-center border-t p-4 md:w-72 md:border-l md:border-t-0 md:p-5",
                          step.bgColor
                        )}>
                          <div className="w-full max-w-[260px]">
                            {STEP_ILLUSTRATIONS[step.number]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Other features */}
        <section className="border-y bg-muted/30 py-14 md:py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
                Tính năng <span className="text-primary">khác</span>
              </h2>
              <p className="text-muted-foreground">Các tính năng bổ sung giúp trải nghiệm học tốt hơn</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1 font-bold text-sm">{f.title}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-14 md:py-20">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Còn câu hỏi nào không?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Liên hệ ngay để được hỗ trợ — đội ngũ BuMath-X luôn sẵn sàng giải đáp.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a href="https://zalo.me/0379172879" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/25 sm:w-auto">
                    <Phone className="h-4 w-4" />
                    Nhắn Zalo — 0379 172 879
                  </Button>
                </a>
                <Link to="/dang-ky">
                  <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
                    <UserPlus className="h-4 w-4" />
                    Tạo tài khoản miễn phí
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
