import { motion } from 'framer-motion'
import { BookOpen, Zap, Target, Trophy, Star } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PricingPackage {
  name: string
  price: string
  ariaPrice: string
  icon: LucideIcon
  highlight: boolean
}

const PRICING_PACKAGES: PricingPackage[] = [
  { name: 'Lớp 7',     price: '1,5M đ', ariaPrice: '1,5 triệu đồng', icon: BookOpen, highlight: false },
  { name: 'Lớp 8',     price: '1,5M đ', ariaPrice: '1,5 triệu đồng', icon: BookOpen, highlight: false },
  { name: 'Cấp tốc',   price: '2M đ',   ariaPrice: '2 triệu đồng',   icon: Zap,      highlight: false },
  { name: 'Ôn chuyên', price: '3M đ',   ariaPrice: '3 triệu đồng',   icon: Target,   highlight: false },
  { name: 'Tứ trụ',    price: '2,5M đ', ariaPrice: '2,5 triệu đồng', icon: Trophy,   highlight: false },
  { name: 'Toàn bộ',   price: '4M đ',   ariaPrice: '4 triệu đồng',   icon: Star,     highlight: true  },
] as const

function scrollToConsultation() {
  document.getElementById('tu-van')?.scrollIntoView({ behavior: 'smooth' })
}

export default function PricingSection() {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-16 md:py-20">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Học phí <span className="text-primary">minh bạch</span>
          </h2>
          <p className="mx-auto max-w-md font-normal text-muted-foreground">
            Chọn gói phù hợp — học phí rõ ràng, không phí ẩn
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon
            return (
              <motion.article
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card
                  className={cn(
                    'group flex h-full cursor-pointer flex-col overflow-hidden border shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                    pkg.highlight && 'border-primary border-2'
                  )}
                >
                  <CardHeader className="flex-1 px-5 pb-3 pt-5">
                    {pkg.highlight && (
                      <span
                        aria-label="Gói phổ biến nhất"
                        className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary"
                      >
                        Phổ biến
                      </span>
                    )}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold">{pkg.name}</h3>
                    <div
                      className="mt-1 text-3xl font-bold text-primary"
                      aria-label={`Giá: ${pkg.ariaPrice}`}
                    >
                      {pkg.price}
                    </div>
                  </CardHeader>
                  <CardFooter className="px-5 pb-5 pt-0">
                    <Button
                      className="min-h-[44px] w-full shadow-lg shadow-primary/25"
                      aria-label={`Đăng ký tư vấn gói ${pkg.name}`}
                      onClick={scrollToConsultation}
                    >
                      Đăng ký tư vấn
                    </Button>
                  </CardFooter>
                </Card>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
