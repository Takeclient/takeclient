import * as React from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

interface ToastContextType {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id }
    setToasts((toasts) => [...toasts, newToast])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((toasts) => {
      if (toastId) {
        return toasts.filter((t) => t.id !== toastId)
      }
      return []
    })
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const context = React.useContext(ToastContext)
  if (!context) return null
  
  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex max-h-screen w-full flex-col-reverse gap-2 sm:max-w-md">
      {context.toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  )
}

function ToastItem({ id, title, description, action, variant = "default" }: Toast) {
  const context = React.useContext(ToastContext)
  if (!context) return null
  
  const variants = {
    default: "bg-white border-gray-200",
    destructive: "bg-red-600 text-white border-red-600"
  }
  
  return (
    <div
      className={`pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${variants[variant]}`}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      {action}
      <button
        onClick={() => context.dismiss(id)}
        className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Export a simpler toast function for backward compatibility
export const toast = (props: Omit<Toast, "id">) => {
  // This is a placeholder that will be replaced when ToastProvider is mounted
  console.log("Toast:", props)
} 