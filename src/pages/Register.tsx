import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { supabase } from '@/lib/supabase'
import { isValidVnPhone, toE164, phoneToEmail } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'

const registerSchema = z
  .object({
    phone: z
      .string()
      .refine(isValidVnPhone, { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' }),
    fullName: z.string().min(1, 'Vui lòng nhập tên học sinh'),
    yearOfBirth: z.coerce
      .number({ invalid_type_error: 'Vui lòng chọn năm sinh' })
      .min(1990, 'Năm sinh không hợp lệ')
      .max(2020, 'Năm sinh không hợp lệ'),
    address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const { user, loading, profile } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '',
      fullName: '',
      yearOfBirth: undefined,
      address: '',
      password: '',
      confirmPassword: '',
    },
  })

  const { formState: { isSubmitting } } = form

  // Redirect authenticated users (handles both pre-existing session and post-registration auto-login)
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/quan-tri/nguoi-dung')
      } else {
        navigate('/khoa-hoc')
      }
    }
  }, [user, loading, profile, navigate])

  const onSubmit = async (values: RegisterFormValues) => {
    const { error } = await supabase.auth.signUp({
      email: phoneToEmail(values.phone),
      password: values.password,
      options: {
        data: {
          phone: toE164(values.phone),
          full_name: values.fullName,
          year_of_birth: values.yearOfBirth,
          address: values.address,
        },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Lỗi kết nối. Vui lòng thử lại.')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Đăng ký thành công!')
      // useEffect will redirect once profile loads
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 relative overflow-x-hidden isolate">
      {/* Floating math symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        {/* Row 1 — ~6% */}
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '3%',  left: '2%',   fontSize: '52px' }}>π</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '6%',  left: '18%',  fontSize: '36px' }}>θ</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '4%',  left: '36%',  fontSize: '44px' }}>∑</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '8%',  left: '56%',  fontSize: '40px' }}>∞</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '3%',  left: '74%',  fontSize: '48px' }}>√</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '6%',  right: '2%',  fontSize: '38px' }}>φ</span>
        {/* Row 2 — ~32% */}
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '29%', left: '1%',   fontSize: '60px' }}>∫</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '33%', left: '16%',  fontSize: '38px' }}>Δ</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '28%', left: '40%',  fontSize: '44px' }}>×</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '35%', left: '60%',  fontSize: '34px' }}>≠</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '30%', left: '78%',  fontSize: '50px' }}>÷</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '34%', right: '2%',  fontSize: '42px' }}>ω</span>
        {/* Row 3 — ~58% */}
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '55%', left: '3%',   fontSize: '46px' }}>α</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '60%', left: '20%',  fontSize: '56px' }}>±</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '54%', left: '44%',  fontSize: '38px' }}>β</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '62%', left: '62%',  fontSize: '46px' }}>≤</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '56%', left: '80%',  fontSize: '40px' }}>σ</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '60%', right: '1%',  fontSize: '54px' }}>γ</span>
        {/* Row 4 — ~84% */}
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '82%', left: '4%',   fontSize: '48px' }}>∂</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '87%', left: '22%',  fontSize: '40px' }}>λ</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '81%', left: '44%',  fontSize: '52px' }}>μ</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '88%', left: '66%',  fontSize: '36px' }}>ε</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '83%', left: '82%',  fontSize: '44px' }}>∇</span>
        <span className="bm-float-symbol-light hidden sm:block" style={{ top: '86%', right: '1%',  fontSize: '50px' }}>∈</span>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="bg-white rounded-2xl p-2 shadow-2xl">
            <img src="/bumathx.png" alt="BuMath-X logo" className="h-32 w-auto rounded-xl" />
          </div>
        </motion.div>

        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.18 }}
        >
          <p className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>Bắt đầu học Toán thôi!</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Hàng nghìn bài giảng THCS đang chờ bạn</p>
        </motion.div>

        <div className="bm-clay-card max-w-[520px] w-full">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1e3a5f' }}>Tạo tài khoản</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Số điện thoại */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal" style={{ color: '#1e3a5f' }}>
                        Số điện thoại
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="0912 345 678"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tên học sinh */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal" style={{ color: '#1e3a5f' }}>
                        Tên học sinh
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nguyễn Văn A"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Năm sinh */}
                <FormField
                  control={form.control}
                  name="yearOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal" style={{ color: '#1e3a5f' }}>
                        Năm sinh
                      </FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn năm sinh" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => 2020 - i).map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Địa chỉ */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal" style={{ color: '#1e3a5f' }}>
                        Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Hà Nội"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mật khẩu */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal" style={{ color: '#1e3a5f' }}>
                        Mật khẩu
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            disabled={isSubmitting}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Xác nhận mật khẩu */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal" style={{ color: '#1e3a5f' }}>
                        Xác nhận mật khẩu
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            disabled={isSubmitting}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                            aria-label={
                              showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="bm-btn-cta w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Đăng ký
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-bold text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
