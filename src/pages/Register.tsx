import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { supabase } from '@/lib/supabase'
import { isValidVnPhone, toE164 } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'

const registerSchema = z
  .object({
    phone: z
      .string()
      .refine(isValidVnPhone, { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' }),
    fullName: z.string().min(1, 'Vui lòng nhập tên học sinh'),
    yearOfBirth: z.coerce
      .number()
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
  const { user, loading } = useAuth()

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

  // Redirect already-authenticated users
  useEffect(() => {
    if (!loading && user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const onSubmit = async (values: RegisterFormValues) => {
    const { error } = await supabase.auth.signUp({
      phone: toE164(values.phone),
      password: values.password,
      options: {
        data: {
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
      toast.success('Tài khoản đã được tạo. Vui lòng chờ xét duyệt.')
      navigate('/pending')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-6">
        <span className="text-2xl font-extrabold tracking-tight">
          Bu<span className="text-primary">Math</span>-X
        </span>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-lg max-w-[480px] w-full mx-4">
        <h1 className="text-xl font-semibold leading-[1.3] mb-6">Tạo tài khoản</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Số điện thoại */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal leading-[1.5]">
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
                  <FormLabel className="text-base font-normal leading-[1.5]">
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

            {/* Năm sinh */}
            <FormField
              control={form.control}
              name="yearOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal leading-[1.5]">
                    Năm sinh
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2010"
                      min={1990}
                      max={2020}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
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
                  <FormLabel className="text-base font-normal leading-[1.5]">
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

            {/* Mật khẩu */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal leading-[1.5]">
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
                  <FormLabel className="text-base font-normal leading-[1.5]">
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

            <Button
              type="submit"
              size="lg"
              className="w-full min-h-[48px]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Đăng ký
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
