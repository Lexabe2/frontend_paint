"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, X, Zap, Loader2, AlertCircle } from "lucide-react"

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
  const initCamera = async () => {
    try {
      setIsLoading(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setStream(mediaStream)
      setError(null)
    } catch (err) {
      console.error("Camera error:", err)
      setError("Не удалось получить доступ к камере")
    } finally {
      setIsLoading(false)
    }
  }

  initCamera()

  return () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    stream?.getTracks().forEach((track) => track.stop())
  }
}, [])


  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleTakePhoto = async () => {
    if (isCapturing) return

    setIsCapturing(true)

    // Небольшая задержка для визуального эффекта
    await new Promise((resolve) => setTimeout(resolve, 200))

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.png`, { type: "image/png" })
          const previewUrl = URL.createObjectURL(blob)
          onCapture(file, previewUrl)
        }
        setIsCapturing(false)
      },
      "image/png",
      0.9,
    )
  }

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null // <== очистить видео
    }

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
    }

    setStream(null) // <== сбрасываем состояние потока
    onClose()
  }


  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-rose-200/50 shadow-xl p-6 mb-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl shadow-lg mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-rose-900 mb-2">Ошибка камеры</h3>
          <p className="text-rose-700 mb-4">{error}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden mb-4">
      {/* Заголовок */}
      <div className="p-4 border-b border-slate-200/50 bg-gradient-to-r from-violet-50/50 to-purple-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Камера</h3>
              <p className="text-sm text-slate-600">Сделайте снимок устройства</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      </div>

      {/* Видео превью */}
      <div className="p-4">
        <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-lg">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm font-medium">Подключение к камере...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 sm:h-80 object-cover"
            style={{ transform: "scaleX(-1)" }} // Зеркальное отображение
          />

          {/* Рамка для фокуса */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-48 h-32 sm:w-64 sm:h-40">
              <div className="absolute inset-0 rounded-xl border-2 border-white/50 shadow-lg">
                {/* Углы рамки */}
                {[
                  "top-left:-top-1 -left-1 border-l-4 border-t-4 rounded-tl-xl",
                  "top-right:-top-1 -right-1 border-r-4 border-t-4 rounded-tr-xl",
                  "bottom-left:-bottom-1 -left-1 border-l-4 border-b-4 rounded-bl-xl",
                  "bottom-right:-bottom-1 -right-1 border-r-4 border-b-4 rounded-br-xl",
                ].map((corner, index) => (
                  <div
                    key={index}
                    className={`absolute w-6 h-6 border-white transition-all duration-300 ${corner.split(":")[1]}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Эффект вспышки при съемке */}
          {isCapturing && <div className="absolute inset-0 bg-white animate-pulse z-20"></div>}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Кнопки управления */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-medium border border-slate-200/50"
          >
            <X className="w-4 h-4" />
            Отмена
          </button>

          <button
            onClick={handleTakePhoto}
            disabled={isLoading || isCapturing}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Съемка...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Снимок
              </>
            )}
          </button>
        </div>

        {/* Подсказка */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/50">
          <p className="text-sm text-blue-700 text-center">💡 Наведите камеру на устройство и нажмите "Снимок"</p>
        </div>
      </div>
    </div>
  )
}
