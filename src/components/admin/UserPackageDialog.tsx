import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchPackages } from '@/lib/api/packages'
import {
  getUserPackages,
  assignPackage,
  revokePackage,
  UserPackageWithDetails,
} from '@/lib/api/user-packages'
import { Profile } from '@/types/auth'

const GRADE_BADGE: Record<string, { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

interface UserPackageDialogProps {
  open: boolean
  user: Profile | null
  onClose: () => void
}

export default function UserPackageDialog({ open, user, onClose }: UserPackageDialogProps) {
  const queryClient = useQueryClient()
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<string>>(new Set())

  const { data: allPackages = [] } = useQuery({
    queryKey: ['admin', 'packages'],
    queryFn: fetchPackages,
    enabled: open && !!user,
  })

  const { data: userPackages = [], isLoading: userPackagesLoading } = useQuery<UserPackageWithDetails[]>({
    queryKey: ['admin', 'user-packages', user?.id],
    queryFn: () => getUserPackages(user!.id),
    enabled: open && !!user,
  })

  const assignedPackageIds = new Set(userPackages.map((up) => up.package_id))
  const availablePackages = allPackages.filter((p) => !assignedPackageIds.has(p.id))

  const assignMutation = useMutation({
    mutationFn: () =>
      Promise.all([...selectedPackageIds].map((id) => assignPackage(user!.id, id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-packages', user?.id] })
      const count = selectedPackageIds.size
      setSelectedPackageIds(new Set())
      toast.success(`Đã gán ${count} gói học cho học sinh.`)
    },
    onError: () => {
      toast.error('Gán không thành công. Vui lòng thử lại.')
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (userPackageId: string) => revokePackage(userPackageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-packages', user?.id] })
      toast.success('Đã thu hồi gói học.')
    },
    onError: () => {
      toast.error('Thu hồi không thành công. Vui lòng thử lại.')
    },
  })

  function handleAssign() {
    if (selectedPackageIds.size === 0) return
    assignMutation.mutate()
  }

  function handleClose() {
    setSelectedPackageIds(new Set())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quản lý gói học — {user?.full_name}</DialogTitle>
        </DialogHeader>

        {/* Assigned packages */}
        <div>
          <h3 className="text-sm font-medium mb-2">Gói học đang sở hữu</h3>
          {userPackagesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Đang tải..." />
            </div>
          ) : userPackages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Học sinh chưa có gói học nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên gói</TableHead>
                    <TableHead>Lớp phủ</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPackages.map((up) => (
                    <TableRow key={up.id}>
                      <TableCell className="font-medium">{up.package.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {up.package.package_grades.map((pg) => (
                            <Badge
                              key={pg.grade}
                              variant="secondary"
                              className={GRADE_BADGE[pg.grade]?.className}
                            >
                              {GRADE_BADGE[pg.grade]?.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Thu hồi gói học"
                          onClick={() => revokeMutation.mutate(up.id)}
                          disabled={revokeMutation.isPending && revokeMutation.variables === up.id}
                        >
                          {revokeMutation.isPending && revokeMutation.variables === up.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Assign new package */}
        {availablePackages.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Gán gói học</h3>
            <div className="space-y-2 mb-3">
              {availablePackages.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-muted transition-colors"
                >
                  <Checkbox
                    checked={selectedPackageIds.has(p.id)}
                    onCheckedChange={(checked) => {
                      setSelectedPackageIds((prev) => {
                        const next = new Set(prev)
                        if (checked) next.add(p.id)
                        else next.delete(p.id)
                        return next
                      })
                    }}
                  />
                  <span className="text-sm flex items-center gap-1 flex-wrap">
                    {p.name}
                    {p.package_grades.map((pg) => (
                      <Badge
                        key={pg.grade}
                        variant="secondary"
                        className={GRADE_BADGE[pg.grade]?.className}
                      >
                        {GRADE_BADGE[pg.grade]?.label}
                      </Badge>
                    ))}
                  </span>
                </label>
              ))}
            </div>
            <Button
              className="w-full min-h-[48px]"
              onClick={handleAssign}
              disabled={selectedPackageIds.size === 0 || assignMutation.isPending}
            >
              {assignMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Gán{selectedPackageIds.size > 0 ? ` ${selectedPackageIds.size}` : ''} gói học
            </Button>
          </div>
        )}

        {availablePackages.length === 0 && userPackages.length > 0 && (
          <p className="text-sm text-muted-foreground border-t pt-4">
            Học sinh đã được gán tất cả gói học.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
