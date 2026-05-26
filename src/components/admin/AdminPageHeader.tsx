import type { ReactNode } from 'react'

export const ADMIN_PAGE_HEADER_ACTION_BUTTON_CLASS =
  "min-h-[48px] rounded-xl bg-primary px-5 text-primary-foreground hover:bg-primary/90 border-0";

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export default function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-none">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description ? <p className="text-sm text-slate-600">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  )
}
