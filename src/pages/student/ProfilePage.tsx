import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StudentLayout from '@/components/student/StudentLayout'
import { getMyPackages, UserPackageWithDetails } from '@/lib/api/user-packages'
import { useAuth } from '@/contexts/AuthContext'

const GRADE_BADGE: Record<string, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

function PackageCard({ userPackage: up }: { userPackage: UserPackageWithDetails }) {
  const assignedDate = new Date(up.assigned_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <Card className="bm-clay-card-student">
      <CardContent className="p-4">
        <p className="text-base font-semibold mb-1">{up.package.name}</p>
        {up.package.price_vnd > 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            {formatVND(up.package.price_vnd)}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
          {up.package.package_grades.map(pg => (
            <Badge key={pg.grade} variant="secondary" className={GRADE_BADGE[pg.grade]?.className}>
              {GRADE_BADGE[pg.grade]?.label}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Gán ngày {assignedDate}</p>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { profile } = useAuth()
  const { data: userPackages = [], isLoading } = useQuery<UserPackageWithDetails[]>({
    queryKey: ['my-packages'],
    queryFn: getMyPackages,
  })

  const initials = (profile?.full_name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <StudentLayout>
      <div className="p-8 md:p-12 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Hồ sơ của tôi</h1>

        {/* Identity card */}
        <Card className="bm-clay-card-student mb-8">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-primary">{initials}</span>
            </div>
            <div>
              <p className="text-base font-semibold">{profile?.full_name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active packages section */}
        <h2 className="text-base font-semibold mb-4">Gói học đang sở hữu</h2>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : userPackages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base font-semibold text-foreground mb-1">Bạn chưa có gói học nào</p>
            <p className="text-sm text-muted-foreground">
              Liên hệ giảng viên để được gán gói học phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userPackages.map(up => (
              <PackageCard key={up.id} userPackage={up} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
