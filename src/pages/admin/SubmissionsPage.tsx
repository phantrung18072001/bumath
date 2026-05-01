import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { getUngraded, UngradedSubmission } from '@/lib/api/submissions'
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

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const [filterGrade, setFilterGrade] = useState('all')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterLesson, setFilterLesson] = useState('all')
  const [filterStudent, setFilterStudent] = useState('')

  const { data = [], isLoading } = useQuery<UngradedSubmission[]>({
    queryKey: ['admin', 'submissions', 'ungraded'],
    queryFn: getUngraded,
  })

  // Derive cascading filter options
  const uniqueGrades = Array.from(
    new Set(data.map(r => r.lessons.chapters.courses.target_grade))
  ).filter(Boolean)

  const gradeFiltered = filterGrade === 'all' ? data : data.filter(r => r.lessons.chapters.courses.target_grade === filterGrade)
  const uniqueCourses = Array.from(new Set(gradeFiltered.map(r => r.lessons.chapters.courses.title)))

  const courseFiltered = filterCourse === 'all' ? gradeFiltered : gradeFiltered.filter(r => r.lessons.chapters.courses.title === filterCourse)
  const uniqueLessons = Array.from(new Set(courseFiltered.map(r => r.lessons.title)))

  // Apply client-side filters
  const filteredData = data.filter(row =>
    (filterGrade === 'all' || row.lessons.chapters.courses.target_grade === filterGrade) &&
    (filterCourse === 'all' || row.lessons.chapters.courses.title === filterCourse) &&
    (filterLesson === 'all' || row.lessons.title === filterLesson) &&
    (!filterStudent || row.profiles.full_name.toLowerCase().includes(filterStudent.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold leading-[1.3]">Chấm bài</h1>
        {data.length > 0 && (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            {data.length} bài chờ chấm
          </Badge>
        )}
      </div>

      {/* Filter bar */}
      {!isLoading && data.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          {/* Grade filter */}
          <SearchableSelect
            options={uniqueGrades.map(g => ({ value: g, label: GRADE_BADGE[g].label }))}
            value={filterGrade}
            onChange={(v) => { setFilterGrade(v); setFilterCourse('all'); setFilterLesson('all') }}
            placeholder="Tất cả lớp"
            width="w-full"
          />

          {/* Course filter — depends on grade */}
          <SearchableSelect
            options={uniqueCourses.map(c => ({ value: c, label: c }))}
            value={filterCourse}
            onChange={(v) => { setFilterCourse(v); setFilterLesson('all') }}
            placeholder="Tất cả khóa học"
            disabled={filterGrade === 'all'}
            width="w-full"
          />

          {/* Lesson filter — depends on course */}
          <SearchableSelect
            options={uniqueLessons.map(l => ({ value: l, label: l }))}
            value={filterLesson}
            onChange={setFilterLesson}
            placeholder="Tất cả bài học"
            disabled={filterCourse === 'all'}
            width="w-full"
          />

          {/* Student name filter */}
          <Input
            placeholder="Tìm học sinh..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-full"
            aria-label="Tìm học sinh theo tên"
          />
        </div>
      )}

      {/* Result count */}
      {!isLoading && data.length > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          Hiển thị {filteredData.length} / {data.length} bài nộp
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredData.length === 0 && data.length > 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Không tìm thấy bài nộp nào phù hợp với bộ lọc.
        </p>
      ) : data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Không có bài nào chờ chấm.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Bài học</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
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
    </div>
  )
}
