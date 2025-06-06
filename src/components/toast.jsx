"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, X, Zap } from "lucide-react"

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Анимация появления
    const showTimer = setTimeout(() => setIsVisible(true), 50)

    if (duration > 0) {
      // Анимация прогресса
      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 50)
          if (newProgress <= 0) {
            clearInterval(progressTimer)
            handleClose()
            return 0
          }
          return newProgress
        })
      }, 50)

      return () => {
        clearTimeout(showTimer)
        clearInterval(progressTimer)
      }
    }

    return () => clearTimeout(showTimer)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-white/90 border-emerald-200/50 shadow-emerald-100/20",
          progress: "bg-gradient-to-r from-emerald-400 to-teal-400",
          glow: "shadow-emerald-500/20",
        }
      case "error":
        return {
          container: "bg-white/90 border-rose-200/50 shadow-rose-100/20",
          progress: "bg-gradient-to-r from-rose-400 to-red-400",
          glow: "shadow-rose-500/20",
        }
      default:
        return {
          container: "bg-white/90 border-emerald-200/50 shadow-emerald-100/20",
          progress: "bg-gradient-to-r from-emerald-400 to-teal-400",
          glow: "shadow-emerald-500/20",
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`fixed top-1 right-6 z-50 transition-all duration-500 ease-out ${
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div
        className={`relative overflow-hidden backdrop-blur-2xl border rounded-2xl shadow-2xl ${styles.container} ${styles.glow} max-w-sm group hover:scale-105 transition-all duration-300`}
      >
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-xl"></div>

        {/* Основной контент */}
        <div className="relative p-4 flex items-start gap-3">
          {/* Иконка с анимацией */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
              {getIcon()}
            </div>
            {type === "success" && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Текст сообщения */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{message}</p>
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-2 hover:bg-slate-100/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group/close"
          >
            <X className="w-4 h-4 text-slate-400 group-hover/close:text-slate-600 transition-colors" />
          </button>
        </div>

        {/* Прогресс-бар */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50">
            <div
              className={`h-full transition-all duration-75 ease-linear ${styles.progress} shadow-lg`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
            </div>
          </div>
        )}

        {/* Анимированный блик */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
      </div>
    </div>
  )
}
