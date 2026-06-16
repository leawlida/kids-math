'use client'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  gradient?: string
  onClick?: () => void
}

export function Card({ children, className = '', gradient, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-3xl p-6 shadow-xl
        ${gradient || 'bg-white'}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:-translate-y-1 transition-all duration-200 active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
