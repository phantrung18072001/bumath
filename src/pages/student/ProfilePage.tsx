import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { BookOpen, CalendarClock, MapPin, Package, Phone, UserCircle2 } from 'lucide-react'
import StudentLayout from '@/components/student/StudentLayout'
import { getMyPackages, UserPackageWithDetails } from '@/lib/api/user-packages'
import { useAuth } from '@/contexts/AuthContext'

const GRADE_BADGE: Record<string, { label: string; className: string }> = {
  grade_7:  { label: 'Lớp 7',   className: 'bg-blue-100   text-blue-700   hover:bg-blue-100'   },
  grade_8:  { label: 'Lớp 8',   className: 'bg-green-100  text-green-700  hover:bg-green-100'  },
  grade_9:  { label: 'Lớp 9',   className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' },
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

function PackageCard({ up }: { up: UserPackageWithDetails }) {
  const assignedDate = new Date(up.assigned_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  return (
    <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-primary/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_24px_-16px_hsl(var(--primary)/0.45)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-slate-900">{up.package.name}</h3>
        {up.package.price_vnd > 0 && (
          <span className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-700">
            {formatVND(up.package.price_vnd)}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {up.package.package_grades.map(pg => (
          <Badge key={pg.grade} variant="secondary" className={GRADE_BADGE[pg.grade]?.className}>
            {GRADE_BADGE[pg.grade]?.label}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <CalendarClock className="h-3.5 w-3.5" />
        Gán ngày {assignedDate}
      </div>
    </article>
  )
}

export default function ProfilePage() {
  const { profile } = useAuth()
  const { data: userPackages = [], isLoading } = useQuery<UserPackageWithDetails[]>({
    queryKey: ['my-packages'],
    queryFn: getMyPackages,
  })

  const initials = (profile?.full_name ?? '')
    .split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('')

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-primary/[0.08] p-6 sm:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_260px] md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Hồ sơ học sinh</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Xin chào, {profile?.full_name ?? 'bạn'}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Theo dõi thông tin cá nhân và toàn bộ gói học bạn đang sở hữu trong một không gian gọn gàng, dễ đọc.
              </p>
            </div>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
              <img
                src="https://images.pexels.com/photos/5905559/pexels-photo-5905559.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="Học sinh đang học bài"
                className="h-32 w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_36px_-28px_hsl(var(--primary)/0.5)]">
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src="https://picsum.photos/seed/bumath-study-corner/900/420"
                  alt="Góc học tập của học sinh"
                  className="h-28 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-xl font-bold text-primary">{initials || '?'}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 leading-tight">{profile?.full_name ?? '—'}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">Tài khoản học sinh</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                {profile?.phone ? (
                  <div className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Số điện thoại</p>
                      <p className="text-sm font-medium text-slate-800">{profile.phone}</p>
                    </div>
                  </div>
                ) : null}
                {profile?.year_of_birth ? (
                  <div className="flex items-start gap-2.5">
                    <UserCircle2 className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Năm sinh</p>
                      <p className="text-sm font-medium text-slate-800">{String(profile.year_of_birth)}</p>
                    </div>
                  </div>
                ) : null}
                {profile?.address ? (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Địa chỉ</p>
                      <p className="text-sm font-medium text-slate-800">{profile.address}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thống kê học tập</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-3">
                  <p className="text-xs text-slate-500">Gói học</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{isLoading ? '—' : userPackages.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Trạng thái</p>
                  <p className="mt-1 text-sm font-semibold text-primary">Đang học</p>
                </div>
              </div>
            </section>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_44px_-34px_hsl(var(--primary)/0.55)] sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-slate-900">Gói học đang sở hữu</h2>
            </div>

            {isLoading ? (
              <div className="grid gap-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : userPackages.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <img
                  src="https://images.pexels.com/photos/8471856/pexels-photo-8471856.jpeg?auto=compress&cs=tinysrgb&w=700"
                  alt="Học sinh ôn tập"
                  className="mb-4 h-28 w-44 rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <Package className="h-7 w-7 text-slate-500" aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">Bạn chưa có gói học nào</p>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                  Liên hệ giảng viên để được gán gói học phù hợp với mục tiêu và khối lớp hiện tại.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {userPackages.map((up) => (
                  <PackageCard key={up.id} up={up} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </StudentLayout>
  )
}
