import type { ReactNode } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AdminListCard({
  filters,
  totalLabel,
  children,
  footer,
}: {
  filters: ReactNode
  totalLabel: ReactNode
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-none md:p-5">
      {filters}
      <div className="mb-4 pl-1 text-sm text-muted-foreground whitespace-nowrap">
        Tổng số bản ghi: {totalLabel}
      </div>
      {children}
      {footer}
    </div>
  )
}

export function AdminListFilterRow({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-1">{children}</div>
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 2) return [1, 2, 3, 'ellipsis', total]
  if (current >= total - 1) return [1, 'ellipsis', total - 2, total - 1, total]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

export function AdminListPaginationFooter({
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoPage,
}: {
  pageSize: number
  onPageSizeChange: (v: number) => void
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onGoPage: (p: number) => void
}) {
  const safeTotalPages = Math.max(1, totalPages)
  const disablePagination = totalPages <= 0
  const disablePrev = disablePagination || currentPage <= 1
  const disableNext = disablePagination || currentPage >= safeTotalPages

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Số hàng:</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-9 w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={disablePrev ? undefined : onPrev}
              aria-disabled={disablePrev}
              className={disablePrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {buildPageNumbers(currentPage, safeTotalPages).map((page, idx) =>
            page === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={disablePagination ? undefined : () => onGoPage(page)}
                  aria-disabled={disablePagination}
                  className={disablePagination ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={disableNext ? undefined : onNext}
              aria-disabled={disableNext}
              className={disableNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
