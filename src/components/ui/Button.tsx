import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
}

/** Tombol reusable dengan beberapa varian (memakai class util dari index.css). */
export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <button className={clsx(variantClass[variant], className)} {...rest}>
      {children}
    </button>
  )
}
