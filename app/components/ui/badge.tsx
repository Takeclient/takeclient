import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-900 border-transparent",
    secondary: "bg-gray-100 text-gray-900 border-transparent",
    destructive: "bg-red-100 text-red-900 border-transparent",
    outline: "text-gray-900 border-gray-200"
  }
  
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export { Badge } 