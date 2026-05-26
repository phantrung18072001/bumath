import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { getAllSubmissions, SubmissionsFilter } from '@/lib/api/submissions'
import { GRADE_BADGE } from '@/lib/constants/grades'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AdminListCard,
  AdminListFilterRow,
  AdminListPaginationFooter,
} from '@/components/admin/AdminListCard'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

interface ComboboxOption { value: string; label: string }

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  width = 'w-[180px]',
}: {
  options: ComboboxOption[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  disabled?: boolean
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn('justify-between font-normal', width)}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ minWidth: 'var(--radix-popover-trigger-width)', width: 'auto' }}>
        <Command>
          <CommandInput placeholder="Tìm..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              <CommandItem className="px-4 py-2" value="all" onSelect={() => { onChange('all'); setOpen(false) }}>
                <Check className={cn('mr-2 h-4 w-4', value === 'all' ? 'opacity-100' : 'opacity-0')} />
                {placeholder}
              </CommandItem>
              {options.map(opt => (
                <CommandItem className="px-4 py-2" key={opt.value} value={opt.label} onSelect={() => { onChange(opt.value); setOpen(false) }}>
                  <Check className={cn('mr-2 h-4 w-4', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const GRADE_OPTIONS: ComboboxOption[] = Object.entries(GRADE_BADGE).map(([value, { label }]) => ({ value, label }))

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'all' | 'graded' | 'ungraded'>('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [lessonFilter, setLessonFilter] = useState('all')
  const [studentSearch, setStudentSearch] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'all' as 'all' | 'graded' | 'ungraded',
    grade: 'all',
    course: 'all',
    lesson: 'all',
    studentName: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filters: SubmissionsFilter = {
    status: appliedFilters.status,
    grade: appliedFilters.grade,
    course: appliedFilters.course,
    lesson: appliedFilters.lesson,
    studentName: appliedFilters.studentName,
    page: currentPage,
    pageSize,
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'submissions', filters],
    queryFn: () => getAllSubmissions(filters),
  })

  const submissions = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const hasActiveFilter = appliedFilters.status !== 'all'
    || appliedFilters.grade !== 'all'
    || appliedFilters.course !== 'all'
    || appliedFilters.lesson !== 'all'
    || appliedFilters.studentName !== ''

  const handleStatusChange = (value: string) => { setStatusFilter(value as 'all' | 'graded' | 'ungraded') }
  const handleGradeChange = (v: string) => { setGradeFilter(v); setCourseFilter('all'); setLessonFilter('all') }
  const handleCourseChange = (v: string) => { setCourseFilter(v); setLessonFilter('all') }
  const handleStudentSearch = (v: string) => { setStudentSearch(v) }
  const applyFilters = () => {
    setAppliedFilters({
      status: statusFilter,
      grade: gradeFilter,
      course: courseFilter,
      lesson: lessonFilter,
      studentName: studentSearch,
    })
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chấm bài"
        description="Danh sách bài nộp với lọc theo trạng thái, lớp, khóa học, bài học và tìm theo học sinh."
      />

      <AdminListCard
        filters={(
          <AdminListFilterRow>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-[190px] shrink-0 rounded-lg" aria-label="Lọc theo trạng thái">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ungraded">Chưa chấm</SelectItem>
              <SelectItem value="graded">Đã chấm</SelectItem>
            </SelectContent>
          </Select>
          <SearchableSelect
            options={GRADE_OPTIONS}
            value={gradeFilter}
            onChange={handleGradeChange}
            placeholder="Tất cả lớp"
            width="w-[170px]"
          />
          <SearchableSelect
            options={[]}
            value={courseFilter}
            onChange={handleCourseChange}
            placeholder="Tất cả khóa học"
            disabled={gradeFilter === 'all'}
            width="w-[200px]"
          />
          <SearchableSelect
            options={[]}
            value={lessonFilter}
            onChange={setLessonFilter}
            placeholder="Tất cả bài học"
            disabled={courseFilter === 'all'}
            width="w-[200px]"
          />
          <Input
            placeholder="Tìm học sinh..."
            value={studentSearch}
            onChange={(e) => handleStudentSearch(e.target.value)}
            className="h-10 min-w-[260px] rounded-lg"
            aria-label="Tìm học sinh theo tên"
          />
          <Button className="h-10 shrink-0 rounded-lg" onClick={applyFilters}>
            Tìm kiếm
          </Button>
          </AdminListFilterRow>
        )}
        totalLabel={`${totalCount} bài nộp`}
        footer={(
          <AdminListPaginationFooter
            pageSize={pageSize}
            onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1) }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            onGoPage={setCurrentPage}
          />
        )}
      >

        {isError ? (
          <p className="py-8 text-center text-destructive">Không thể tải dữ liệu. Vui lòng thử lại.</p>
        ) : isLoading ? (
          <div aria-busy="true" aria-label="Đang tải...">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {hasActiveFilter ? 'Không có kết quả cho bộ lọc này.' : 'Không có bài nộp nào.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Bài học</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.profiles.full_name}</TableCell>
                  <TableCell>{row.lessons.chapters.courses.title}</TableCell>
                  <TableCell>{row.lessons.title}</TableCell>
                  <TableCell>
                    {new Date(row.submitted_at).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {row.score !== null ? (
                      <Badge className="bg-orange-100 text-orange-800 border-0 font-mono">
                        {row.score}/10
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Chưa chấm</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/quan-tri/bai-nop/${row.id}`)}
                    >
                      Chấm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        )}
      </AdminListCard>
    </div>
  )
}
