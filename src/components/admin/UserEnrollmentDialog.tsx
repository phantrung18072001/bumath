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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchCourses, Course } from '@/lib/api/courses'
import {
  getUserEnrollments,
  addEnrollment,
  removeEnrollment,
  EnrollmentWithCourse,
} from '@/lib/api/enrollments'
import { Profile } from '@/types/auth'

// Grade badge colors matching UI-SPEC (same palette as CoursesPage)
const GRADE_BADGE: Record<Course['target_grade'], { label: string; className: string }> = {
  grade_7: { label: 'Lớp 7', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  grade_8: { label: 'Lớp 8', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  grade_9: { label: 'Lớp 9', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  advanced: { label: 'Ôn chuyên', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
}

function GradeBadge({ grade }: { grade: Course['target_grade'] }) {
  const { label, className } = GRADE_BADGE[grade] ?? GRADE_BADGE.grade_7
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}

interface UserEnrollmentDialogProps {
  open: boolean
  user: Profile | null
  onClose: () => void
}

export default function UserEnrollmentDialog({ open, user, onClose }: UserEnrollmentDialogProps) {
  const queryClient = useQueryClient()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // Fetch all courses available in the system
  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ['admin', 'courses'],
    queryFn: fetchCourses,
    enabled: open && !!user,
  })

  // Fetch enrollments for this specific user
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ['admin', 'enrollments', user?.id],
    queryFn: () => getUserEnrollments(user!.id),
    enabled: open && !!user,
  })

  // Courses the user is NOT yet enrolled in (available to add)
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id))
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id))

  const addMutation = useMutation({
    mutationFn: () => addEnrollment(user!.id, selectedCourseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments', user?.id] })
      setSelectedCourseId('')
      toast.success('Đã thêm khóa học cho học sinh.')
    },
    onError: () => {
      toast.error('Thêm không thành công. Học sinh có thể đã đăng ký khóa học này.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (enrollmentId: string) => removeEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'enrollments', user?.id] })
      toast.success('Đã xóa khóa học khỏi danh sách của học sinh.')
    },
    onError: () => {
      toast.error('Xóa không thành công. Vui lòng thử lại.')
    },
  })

  function handleAdd() {
    if (!selectedCourseId) return
    addMutation.mutate()
  }

  function handleClose() {
    setSelectedCourseId('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quản lý khóa học — {user?.full_name}</DialogTitle>
        </DialogHeader>

        {/* Current enrollments */}
        <div>
          <h3 className="text-sm font-medium mb-2">Khóa học đã đăng ký</h3>
          {enrollmentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Đang tải..." />
            </div>
          ) : enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Học sinh chưa đăng ký khóa học nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khóa học</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{enrollment.course.title}</TableCell>
                      <TableCell>
                        <GradeBadge grade={enrollment.course.target_grade} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Xóa khóa học"
                          onClick={() => removeMutation.mutate(enrollment.id)}
                          disabled={removeMutation.isPending && removeMutation.variables === enrollment.id}
                        >
                          {removeMutation.isPending && removeMutation.variables === enrollment.id ? (
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

        {/* Add new enrollment */}
        {availableCourses.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Thêm khóa học</h3>
            <div className="flex gap-2">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="flex-1 min-h-[48px]">
                  <SelectValue placeholder="Chọn khóa học..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <span className="flex items-center gap-2">
                        {course.title}
                        <GradeBadge grade={course.target_grade} />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="min-h-[48px]"
                onClick={handleAdd}
                disabled={!selectedCourseId || addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Thêm
              </Button>
            </div>
          </div>
        )}

        {availableCourses.length === 0 && enrollments.length > 0 && (
          <p className="text-sm text-muted-foreground border-t pt-4">
            Học sinh đã đăng ký tất cả khóa học hiện có.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
