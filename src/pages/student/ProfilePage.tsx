import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Package } from 'lucide-react'
import StudentLayout from '@/components/student/StudentLayout'
import { getMyPackages, UserPackageWithDetails } from '@/lib/api/user-packages'
import { useAuth } from '@/contexts/AuthContext'

const GRADE_BADGE: Record<string, { label: string; className: string }> = {
  grade_7:  { label: 'Lớp 7',   className: 'bg-blue-100   text-blue-700   hover:bg-blue-100'   },
  grade_8:  { label: 'Lớp 8',   className: 'bg-green-100  text-green-700  hover:bg-green-100'  },
  grade_9:  { label: 'Lớp 9',   className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

function PackageCard({ up }: { up: UserPackageWithDetails }) {
  const assignedDate = new Date(up.assigned_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  return (
    <div className="bm-clay-card-student p-4 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground leading-snug">{up.package.name}</p>
        {up.package.price_vnd > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {formatVND(up.package.price_vnd)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {up.package.package_grades.map(pg => (
          <Badge key={pg.grade} variant="secondary" className={GRADE_BADGE[pg.grade]?.className}>
            {GRADE_BADGE[pg.grade]?.label}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Gán ngày {assignedDate}</p>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, user } = useAuth()
  const { data: userPackages = [], isLoading } = useQuery<UserPackageWithDetails[]>({
    queryKey: ['my-packages'],
    queryFn: getMyPackages,
  })

  const firstName = (profile?.full_name ?? '').split(' ').filter(Boolean).pop() ?? ''
  const initials = (profile?.full_name ?? '')
    .split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('')

  const uniqueGrades = new Set(
    userPackages.flatMap(up => up.package.package_grades.map(pg => pg.grade))
  ).size

  return (
    <StudentLayout>
      {/* ── Hero Banner ────────────────────────────────────────── */}
      <div className="relative h-44 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1400&q=70"
          alt=""
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-indigo-500/50" />
        {/* Decorative math symbols */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          <span className="absolute text-white/20 text-5xl font-light top-3 left-10">∑</span>
          <span className="absolute text-white/15 text-4xl top-8 left-[22%]">π</span>
          <span className="absolute text-white/20 text-6xl top-4 right-[30%]">∞</span>
          <span className="absolute text-white/15 text-3xl bottom-5 right-16">√</span>
          <span className="absolute text-white/10 text-5xl bottom-3 left-[55%]">∫</span>
          <span className="absolute text-white/10 text-4xl top-2 right-10">φ</span>
        </div>
        <div className="relative z-10 h-full flex items-end px-6 pb-5">
          <div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Hồ sơ học sinh</p>
            <p className="text-white text-xl font-bold drop-shadow-sm">
              Xin chào{firstName ? `, ${firstName}` : ''}!
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-12 relative z-10">

        {/* Greeting heading */}
        <h1 className="text-2xl font-bold text-foreground mb-5 pt-12">
          Xin chào, {profile?.full_name ?? 'bạn'}!
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Profile Card ────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="bm-clay-card-student">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white shadow-md flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-primary">{initials || '?'}</span>
                </div>
                <div className="w-full text-left">
                  <p className="text-base font-bold text-foreground text-center leading-snug mb-3">
                    {profile?.full_name ?? '—'}
                  </p>
                  <Separator className="mb-3" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Thông tin cá nhân
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Email', value: user?.email ?? '—' },
                      { label: 'Số điện thoại', value: profile?.phone ?? '—' },
                      { label: 'Năm sinh', value: profile?.year_of_birth ? String(profile.year_of_birth) : '—' },
                      { label: 'Địa chỉ', value: profile?.address ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium text-foreground break-all">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Stats */}
                <div className="w-full grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center gap-0.5 p-2 bg-primary/5 rounded-xl">
                    <span className="text-xl font-bold text-primary">{isLoading ? '—' : userPackages.length}</span>
                    <span className="text-xs text-muted-foreground">Gói học</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 p-2 bg-primary/5 rounded-xl">
                    <span className="text-xl font-bold text-primary">{isLoading ? '—' : uniqueGrades}</span>
                    <span className="text-xs text-muted-foreground">Khối lớp</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study illustration */}
            <div className="relative rounded-2xl overflow-hidden h-36 hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=70"
                alt="Học sinh đang học tập"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold leading-snug drop-shadow">
                Học giỏi mỗi ngày, tiến xa hơn mỗi bước!
              </p>
            </div>
          </div>

          {/* ── Right: Packages ──────────────────────── */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6 lg:mt-0">
              Gói học đang sở hữu
            </h2>

            {isLoading ? (
              <div className="grid gap-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : userPackages.length === 0 ? (
              <Card className="bm-clay-card-student">
                <CardContent className="py-14 flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Bạn chưa có gói học nào</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                      Liên hệ giảng viên để được gán gói học phù hợp với lớp của bạn.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {userPackages.map(up => (
                  <PackageCard key={up.id} up={up} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
