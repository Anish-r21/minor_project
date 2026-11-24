import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, title, onClose, children, footer, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`mt-10 w-full rounded bg-white shadow-lg ${wide ? 'max-w-2xl' : 'max-w-md'}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, disabled, onConfirm, onCancel, children }: {
  open: boolean; title: string; message?: ReactNode; confirmLabel?: string; danger?: boolean; disabled?: boolean; onConfirm: () => void; onCancel: () => void; children?: ReactNode;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}
      footer={<><button className="btn-secondary" onClick={onCancel}>Cancel</button><button className={danger ? 'btn-danger' : 'btn-primary'} disabled={disabled} onClick={onConfirm}>{confirmLabel}</button></>}>
      {message && <div className="text-sm text-slate-700">{message}</div>}
      {children}
    </Modal>
  );
}
