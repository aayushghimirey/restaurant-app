import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page, totalPages, totalElements, pageSize, onPageChange,
}: PaginationProps) {
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
      <p className="text-xs text-slate-500">
        Showing <span className="text-slate-300">{from}–{to}</span> of{' '}
        <span className="text-slate-300">{totalElements}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          className="btn-icon disabled:opacity-30"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i : Math.max(0, page - 2) + i;
          if (p >= totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                background: p === page ? 'var(--color-brand-500)' : undefined,
              }}
              className={`w-7 h-7 text-xs rounded-lg transition-all ${
                p === page
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          className="btn-icon disabled:opacity-30"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
