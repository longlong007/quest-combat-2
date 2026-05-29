import React from 'react'

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/60 backdrop-blur rounded-2xl p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}