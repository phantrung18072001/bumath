import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { getUngraded, UngradedSubmission } from '@/lib/api/submissions'
import { GRADE_BADGE } from '@/lib/constants/grades'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function SubmissionsPage() {
  const navigate = useNavigate()
  const [filterGrade, setFilterGrade] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterLesson, setFilterLesson] = useState('')
  const [filterStudent, setFilterStudent] = useState('')

  const { data = [], isLoading } = useQuery<UngradedSubmission[]>({
    queryKey: ['admin', 'submissions', 'ungraded'],
    queryFn: getUngraded,
  })

  // Derive unique filter options from loaded data
  const uniqueGrades = Array.from(
    new Set(data.map(r => r.lessons.chapters.courses.target_grade))
  ).filter(Boolean)
  const uniqueCourses = Array.from(
    new Set(data.map(r => r.lessons.chapters.courses.title))
  )
  const uniqueLessons = Array.from(
    new Set(data.map(r => r.lessons.title))
  )

  // Apply client-side filters
  const filteredData = data.filter(row =>
    (!filterGrade || row.lessons.chapters.courses.target_grade === filterGrade) &&
    (!filterCourse || row.lessons.chapters.courses.title === filterCourse) &&
    (!filterLesson || row.lessons.title === filterLesson) &&
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
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger className="w-[140px]" aria-label="Lọc theo lớp">
              <SelectValue placeholder="Tất cả lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả lớp</SelectItem>
              {uniqueGrades.map(grade => (
                <SelectItem key={grade} value={grade}>
                  {GRADE_BADGE[grade].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Course filter */}
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-[180px]" aria-label="Lọc theo khóa học">
              <SelectValue placeholder="Tất cả khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả khóa học</SelectItem>
              {uniqueCourses.map(course => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lesson filter */}
          <Select value={filterLesson} onValueChange={setFilterLesson}>
            <SelectTrigger className="w-[180px]" aria-label="Lọc theo bài học">
              <SelectValue placeholder="Tất cả bài học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả bài học</SelectItem>
              {uniqueLessons.map(lesson => (
                <SelectItem key={lesson} value={lesson}>
                  {lesson}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Student name filter */}
          <Input
            placeholder="Tìm học sinh..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-[180px]"
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
                      onClick={() => navigate(`/admin/submissions/${row.id}`)}
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
