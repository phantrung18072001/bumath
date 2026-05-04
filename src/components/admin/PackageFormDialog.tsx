import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  PackageWithGrades,
  GradeValue,
  insertPackage,
  updatePackage,
} from '@/lib/api/packages'

const packageSchema = z.object({
  name: z.string().min(1, 'Tên gói học không được để trống.'),
  description: z.string().optional(),
  price_vnd: z.coerce.number().min(0, 'Giá phải ≥ 0.'),
  grades: z.array(z.enum(['grade_7', 'grade_8', 'grade_9', 'advanced']))
    .min(1, 'Vui lòng chọn ít nhất một lớp.'),
})

type PackageFormValues = z.infer<typeof packageSchema>

const GRADE_OPTIONS = [
  { value: 'grade_7' as GradeValue, label: 'Lớp 7' },
  { value: 'grade_8' as GradeValue, label: 'Lớp 8' },
  { value: 'grade_9' as GradeValue, label: 'Lớp 9' },
  { value: 'advanced' as GradeValue, label: 'Ôn chuyên' },
]

interface PackageFormDialogProps {
  open: boolean
  package: PackageWithGrades | null
  onSuccess: () => void
  onClose: () => void
}

export default function PackageFormDialog({
  open,
  package: pkg,
  onSuccess,
  onClose,
}: PackageFormDialogProps) {
  const isEditing = !!pkg

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      description: '',
      price_vnd: 0,
      grades: [],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: pkg?.name ?? '',
        description: pkg?.description ?? '',
        price_vnd: pkg?.price_vnd ?? 0,
        grades: pkg?.package_grades.map(pg => pg.grade as GradeValue) ?? [],
      })
    }
  }, [open, pkg, form])

  const mutation = useMutation({
    mutationFn: async (values: PackageFormValues) => {
      const payload = {
        name: values.name,
        description: values.description ?? null,
        price_vnd: values.price_vnd,
        grades: values.grades,
      }
      if (isEditing) {
        return updatePackage(pkg.id, payload)
      }
      return insertPackage(payload)
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Đã cập nhật gói học.' : 'Đã tạo gói học thành công.')
      onSuccess()
    },
    onError: () => {
      toast.error('Lưu không thành công. Vui lòng kiểm tra lại thông tin.')
    },
  })

  function onSubmit(values: PackageFormValues) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa gói học' : 'Tạo gói học mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên gói học</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Gói Toán lớp 7 + 8" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về gói học..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price_vnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (VND)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="1.500.000"
                      value={field.value ? Number(field.value).toLocaleString('vi-VN') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        field.onChange(raw === '' ? 0 : Number(raw))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grades"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Lớp phủ{' '}
                    <span className="font-normal text-muted-foreground">
                      (chọn ít nhất một lớp)
                    </span>
                  </FormLabel>
                  <Controller
                    control={form.control}
                    name="grades"
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {GRADE_OPTIONS.map(({ value, label }) => (
                          <div key={value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`grade-${value}`}
                              checked={field.value.includes(value)}
                              onCheckedChange={(checked) => {
                                const current = field.value
                                field.onChange(
                                  checked
                                    ? [...current, value]
                                    : current.filter((g) => g !== value)
                                )
                              }}
                            />
                            <label
                              htmlFor={`grade-${value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="min-h-[48px]">
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {isEditing ? 'Cập nhật gói học' : 'Lưu gói học'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
