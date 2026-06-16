'use client'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

const variants = {
  primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-indigo-200',
  secondary: 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-200',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-200',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-200',
  outline: 'border-3 border-indigo-400 text-indigo-600 hover:bg-indigo-50',
}

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-xl',
  md: 'px-5 py-3 text-base rounded-2xl',
  lg: 'px-7 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-3xl',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 hover:-translate-y-0.5
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  )
}
