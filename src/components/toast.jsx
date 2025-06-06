"use client"

import { useEffect } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-green-50 border-green-200 text-green-800"
    }
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className={`flex items-center gap-3 p-3 rounded-lg border shadow-lg ${getStyles()}`}>
        {getIcon()}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-black hover:bg-opacity-10 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
