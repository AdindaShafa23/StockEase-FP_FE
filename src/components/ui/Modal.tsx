import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Compound Pattern (Week 12): Modal + Modal.Header / Modal.Body / Modal.Footer.
 * Animasi buka/tutup memakai Framer Motion (Materi 8).
 *
 * Contoh pemakaian:
 *   <Modal open={open} onClose={close}>
 *     <Modal.Header onClose={close}>Judul</Modal.Header>
 *     <Modal.Body>...</Modal.Body>
 *     <Modal.Footer>...</Modal.Footer>
 *   </Modal>
 */
interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

function Modal({ open, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Tutup modal dengan tombol Escape (pola aksesibilitas standar untuk dialog).
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Pindahkan fokus ke dalam modal saat dibuka & kunci scroll body.
  useEffect(() => {
    if (!open) return
    const prevActive = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Fokuskan elemen interaktif pertama di dalam modal.
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      prevActive?.focus() // kembalikan fokus ke pemicu setelah modal ditutup
    }
  }, [open])

  // Focus trap: jaga Tab tetap berputar di dalam modal.
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (!focusables || focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            onKeyDown={handleKeyDown}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface HeaderProps {
  children: ReactNode
  onClose?: () => void
}

function Header({ children, onClose }: HeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
      <h2 className="text-lg font-semibold text-slate-900">{children}</h2>
      {onClose && (
        <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup">
          <X size={20} />
        </button>
      )}
    </div>
  )
}

function Body({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>
}

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer

export default Modal
