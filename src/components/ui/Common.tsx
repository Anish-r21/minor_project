import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, tone = 'blue', icon, onClick }: { label: string; value: number | string; tone?: 'blue' | 'amber' | 'red' | 'green' | 'slate'; icon?: ReactNode; onClick?: () => void }) {
  const tones = { blue: 'border-l-blue-600', amber: 'border-l-amber-500', red: 'border-l-red-600', green: 'border-l-green-600', slate: 'border-l-slate-400' };
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`card border-l-4 ${tones[tone]} flex items-center justify-between p-3 text-left ${onClick ? 'hover:bg-slate-50' : ''}`}>
      <div>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      {icon && <span className="text-slate-400">{icon}</span>}
    </Tag>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <Inbox className="mb-2 text-slate-300" size={36} />
      <p className="font-medium text-slate-700">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}{required && <span className="text-red-600"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 text-sm sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-slate-800">{children}</dd>
    </div>
  );
}

export function Toasts({ items }: { items: { id: string; text: string; type: string }[] }) {
  const cls: Record<string, string> = { success: 'bg-green-700', error: 'bg-red-700', info: 'bg-slate-800' };
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2" aria-live="polite">
      {items.map((t) => <div key={t.id} className={`max-w-sm rounded px-4 py-2.5 text-sm text-white shadow-lg ${cls[t.type]}`}>{t.text}</div>)}
    </div>
  );
}
