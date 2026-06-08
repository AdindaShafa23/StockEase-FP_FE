import type { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'green' | 'red' | 'amber' | 'slate'

interface Props {
  tone?: Tone
  children: ReactNode
  className?: string
}

const toneClass: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
}

/** Badge kecil untuk status (mis. stok rendah, jenis transaksi). */
export default function Badge({ tone = 'slate', children, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
