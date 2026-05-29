import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-ink/60 font-serif">{label}</label>}
      <input
        className={`bg-white/50 border border-sand rounded-xl px-4 py-2.5 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/40 transition-all ${className}`}
        {...props}
      />
    </div>
  )
}