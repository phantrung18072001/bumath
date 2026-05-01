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
        navigate('/quan-tri/nguoi-dung')
      } else if (profile.role === 'teacher') {
          // D-07: teacher lands on grading queue
          navigate('/quan-tri/bai-nop')
      } else {
        // Student
        navigate('/khoa-hoc')
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
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#F0FDFA' }}>
      <span className="bm-float-symbol hidden sm:block" aria-hidden="true" style={{ top: '8%', left: '6%', fontSize: '36px' }}>π</span>
      <span className="bm-float-symbol hidden sm:block" aria-hidden="true" style={{ top: '15%', right: '8%', fontSize: '40px' }}>√</span>
      <span className="bm-float-symbol hidden sm:block" aria-hidden="true" style={{ top: '55%', left: '4%', fontSize: '32px' }}>±</span>
      <span className="bm-float-symbol hidden sm:block" aria-hidden="true" style={{ top: '20%', right: '15%', fontSize: '44px' }}>×</span>
      <span className="bm-float-symbol hidden sm:block" aria-hidden="true" style={{ top: '70%', right: '6%', fontSize: '36px' }}>÷</span>
      <span className="bm-float-symbol hidden sm:block" aria-hidden="true" style={{ top: '40%', left: '12%', fontSize: '48px' }}>∑</span>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <img src="/bumath.jpeg" alt="BuMath logo" className="h-11 w-auto rounded-lg" />
          <span className="font-baloo text-[30px] font-bold" style={{ color: '#0D9488' }}>BuMath</span>
        </div>

        <div className="bm-clay-card max-w-[400px] w-full">
          <h1 className="font-baloo text-2xl font-bold mb-6" style={{ color: '#134E4A' }}>Đăng nhập</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="font-comic text-base font-normal" style={{ color: '#134E4A' }} htmlFor="phone">
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
            <label className="font-comic text-base font-normal" style={{ color: '#134E4A' }} htmlFor="password">
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
            className="bm-btn-cta w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Đăng nhập
          </Button>
        </form>

        <p className="mt-4 text-center text-sm font-comic" style={{ color: '#5EADA5' }}>
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="font-bold hover:underline" style={{ color: '#0D9488' }}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}
