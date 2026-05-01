import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { isValidVnPhone, phoneToEmail } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { user, loading, profile } = useAuth()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect already-authenticated users based on role
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin/users')
      } else if (profile.role === 'teacher') {
        // Teacher redirects to landing page until Phase 8 adds teacher routes
        navigate('/')
      } else {
        // Student
        navigate('/courses')
      }
    }
  }, [user, loading, profile, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPhoneError('')
    setFormError('')

    if (!isValidVnPhone(phone)) {
      setPhoneError('Số điện thoại không hợp lệ (VD: 0912345678)')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(phone),
        password,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('invalid login') || msg.includes('invalid') || msg.includes('credentials')) {
          setFormError('Số điện thoại hoặc mật khẩu không đúng.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setFormError('Lỗi kết nối. Vui lòng thử lại.')
        } else {
          setFormError('Số điện thoại hoặc mật khẩu không đúng.')
        }
      } else {
          // Redirect handled by useEffect once profile loads via AuthContext
        }
    } catch {
      setFormError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-6">
        <span className="text-2xl font-extrabold tracking-tight">
          Bu<span className="text-primary">Math</span>-X
        </span>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-lg max-w-[400px] w-full mx-4">
        <h1 className="text-xl font-semibold leading-[1.3] mb-6">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Số điện thoại */}
          <div className="space-y-1">
            <label className="text-base font-normal leading-[1.5]" htmlFor="phone">
              Số điện thoại
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="0912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
            {phoneError && (
              <p className="text-sm font-normal text-destructive">{phoneError}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1">
            <label className="text-base font-normal leading-[1.5]" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Form-level error */}
          {formError && (
            <p className="text-sm font-normal text-destructive">{formError}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full min-h-[48px]"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-medium">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  )
}
