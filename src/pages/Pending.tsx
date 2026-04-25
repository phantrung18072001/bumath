import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Loader2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const ADMIN_ZALO_NUMBER = '0123456789'

export default function Pending() {
  const navigate = useNavigate()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (loading) return

    // If not authenticated, redirect to login
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    // If approved, redirect to home
    if (profile?.approval_status === 'approved') {
      navigate('/', { replace: true })
    }
  }, [user, profile, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    // Auth state change will clear the session and redirect to /login
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        aria-label="Đang tải..."
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Đang tải...</span>
      </div>
    )
  }

  const isRejected = profile?.approval_status === 'rejected'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="rounded-2xl border bg-card p-6 shadow-lg max-w-[420px] w-full mx-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Icon */}
          <Clock className="mx-auto h-12 w-12 text-primary" />

          {/* Heading */}
          <h1 className="text-[28px] font-semibold leading-[1.2]">
            {isRejected ? 'Tài khoản bị từ chối' : 'Tài khoản đang chờ xét duyệt'}
          </h1>

          {/* Body */}
          <p className="text-base font-normal leading-[1.5]">
            {isRejected
              ? 'Tài khoản bị từ chối. Vui lòng liên hệ để biết thêm.'
              : 'Yêu cầu của bạn đã được ghi nhận. Vui lòng chờ trong vòng 24 giờ.'}
          </p>

          {/* Contact */}
          <p className="text-base font-normal leading-[1.5] text-muted-foreground">
            Liên hệ Zalo để được hỗ trợ nhanh hơn: {ADMIN_ZALO_NUMBER}
          </p>

          {/* Về trang chủ */}
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full min-h-[48px] gap-2">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>

          {/* Đăng xuất button */}
          <Button
            variant="ghost"
            className="w-full min-h-[48px]"
            onClick={handleSignOut}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
}
