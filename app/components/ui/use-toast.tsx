import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return createPortal(
    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white ${bgColor} shadow-lg transition-opacity duration-300 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button type="button" onClick={() => setIsVisible(false)} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>,
    document.body
  )
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = useCallback((props: ToastProps) => {
    setToast(props)
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  const ToastComponent = toast ? <Toast {...toast} onClose={hideToast} /> : null

  return { showToast, hideToast, ToastComponent }
}
