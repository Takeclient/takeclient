import * as React from "react"
import { cn } from "@/app/lib/utils"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

export function Dialog({ open = false, onOpenChange = () => {}, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      <div className={cn("relative z-50", open ? "block" : "hidden")}>
        {open && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
        )}
        {children}
      </div>
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ asChild, children, ...props }: any) {
  const { onOpenChange } = React.useContext(DialogContext)
  
  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e)
        onOpenChange(true)
      }
    })
  }
  
  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e)
        onOpenChange(true)
      }}
    >
      {children}
    </button>
  )
}

export function DialogContent({ children, className, ...props }: any) {
  const { open } = React.useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={cn(
          "relative w-full max-w-lg bg-white rounded-xl shadow-2xl",
          "transform transition-all duration-200",
          "p-6",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className, ...props }: any) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {children}
    </div>
  )
}

export function DialogFooter({ children, className, ...props }: any) {
  return (
    <div className={cn("mt-6 flex items-center justify-end space-x-3", className)} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className, ...props }: any) {
  return (
    <h2 className={cn("text-xl font-semibold text-gray-900", className)} {...props}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className, ...props }: any) {
  return (
    <p className={cn("mt-2 text-sm text-gray-600", className)} {...props}>
      {children}
    </p>
  )
} 