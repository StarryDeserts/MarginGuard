import { AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ModalOverlay, ModalPanel } from '../motion/ModalTransition'
import { Button } from './Button'

type ModalProps = {
  open: boolean
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, subtitle, children, footer, onClose }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <ModalOverlay>
          <ModalPanel className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-guard-border-strong bg-guard-surface p-4 shadow-2xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
              </div>
              <Button aria-label="Close modal" variant="ghost" size="sm" icon={<X className="h-5 w-5" />} onClick={onClose} />
            </div>
            {children}
            {footer ? <div className="mt-5 border-t border-guard-border pt-4">{footer}</div> : null}
          </ModalPanel>
        </ModalOverlay>
      ) : null}
    </AnimatePresence>
  )
}
