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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const PAGE_SIZE = 20

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

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 2) return [1, 2, 3, 'ellipsis', total]
  if (current >= total - 1) return [1, 'ellipsis', total - 2, total - 1, total]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

const GRADE_OPTIONS: ComboboxOption[] = Object.entries(GRADE_BADGE).map(([value, { label }]) => ({ value, label }))

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'all' | 'graded' | 'ungraded'>('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [lessonFilter, setLessonFilter] = useState('all')
  const [studentSearch, setStudentSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filters: SubmissionsFilter = {
    status: statusFilter,
    grade: gradeFilter,
    course: courseFilter,
    lesson: lessonFilter,
    studentName: studentSearch,
    page: currentPage,
    pageSize: PAGE_SIZE,
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'submissions', filters],
    queryFn: () => getAllSubmissions(filters),
  })

  const submissions = data?.data ?? []
  const totalCount = data?.total ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const hasActiveFilter = statusFilter !== 'all' || gradeFilter !== 'all' || courseFilter !== 'all' || lessonFilter !== 'all' || studentSearch !== ''

  const handleStatusChange = (value: string) => { setStatusFilter(value as 'all' | 'graded' | 'ungraded'); setCurrentPage(1) }
  const handleGradeChange = (v: string) => { setGradeFilter(v); setCourseFilter('all'); setLessonFilter('all'); setCurrentPage(1) }
  const handleCourseChange = (v: string) => { setCourseFilter(v); setLessonFilter('all'); setCurrentPage(1) }
  const handleStudentSearch = (v: string) => { setStudentSearch(v); setCurrentPage(1) }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold leading-[1.3] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Chấm bài</h1>
        {totalCount > 0 && (
          <Badge className="bg-muted text-muted-foreground hover:bg-muted">
            {totalCount} bài nộp
          </Badge>
        )}
      </div>

      {/* Filter bar — always visible */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
        {/* Status filter — FIRST per UI-SPEC */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]" aria-label="Lọc theo trạng thái">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="ungraded">Chưa chấm</SelectItem>
            <SelectItem value="graded">Đã chấm</SelectItem>
          </SelectContent>
        </Select>

        {/* Grade filter */}
        <SearchableSelect
          options={GRADE_OPTIONS}
          value={gradeFilter}
          onChange={handleGradeChange}
          placeholder="Tất cả lớp"
          width="w-[150px]"
        />

        {/* Course filter */}
        <SearchableSelect
          options={[]}
          value={courseFilter}
          onChange={handleCourseChange}
          placeholder="Tất cả khóa học"
          disabled={gradeFilter === 'all'}
          width="w-[180px]"
        />

        {/* Lesson filter */}
        <SearchableSelect
          options={[]}
          value={lessonFilter}
          onChange={setLessonFilter}
          placeholder="Tất cả bài học"
          disabled={courseFilter === 'all'}
          width="w-[180px]"
        />

        {/* Student name search */}
        <Input
          placeholder="Tìm học sinh..."
          value={studentSearch}
          onChange={(e) => handleStudentSearch(e.target.value)}
          className="w-full sm:w-[200px]"
          aria-label="Tìm học sinh theo tên"
        />
      </div>

      {isError ? (
        <p className="text-destructive py-8 text-center">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </p>
      ) : isLoading ? (
        <div aria-busy="true" aria-label="Đang tải...">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {hasActiveFilter ? 'Không có kết quả cho bộ lọc này.' : 'Không có bài nộp nào.'}
        </div>
      ) : (
        <div className="bm-glass-card p-6 overflow-x-auto">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">{totalCount} bài nộp</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {buildPageNumbers(currentPage, totalPages).map((page, i) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

