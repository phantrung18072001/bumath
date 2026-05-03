import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
          <p className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>Chào mừng trở lại!</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Tiếp tục hành trình học Toán của bạn</p>
        </motion.div>

        <div className="bm-clay-card max-w-[400px] w-full">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1e3a5f' }}>Đăng nhập</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-base font-normal" style={{ color: '#1e3a5f' }} htmlFor="phone">
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
            <label className="text-base font-normal" style={{ color: '#1e3a5f' }} htmlFor="password">
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

        <p className="mt-4 text-center text-sm" style={{ color: '#6B7280' }}>
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="font-bold hover:underline" style={{ color: '#F97316' }}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}
