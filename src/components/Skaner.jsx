"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Camera, Scan, Keyboard, Zap, Play, Square } from "lucide-react"

export default function ScannerInput({ onScan, onError, allowManualInput = false }) {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [cameraStarted, setCameraStarted] = useState(false)

  const codeReaderRef = useRef(null)
  const controlsRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader()
    return () => {
      // Полная очистка при размонтировании
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      console.log("Starting camera...")
      setCameraStarted(true)
      setScanning(true)
      setIsActive(false)

      // Получаем доступ к камере
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      // Сохраняем поток
      streamRef.current = stream

      // Подключаем к видео элементу
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      console.log("Camera stream started")

      // Запускаем сканирование
      const controls = await codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          console.log("Code scanned:", result.getText())
          setIsActive(true)
          onScan?.(result.getText())

          // Останавливаем камеру после успешного сканирования
          setTimeout(() => {
            setIsActive(false)
            stopCamera()
          }, 800)
        } else if (error && error.name !== "NotFoundException" && error.name !== "NotFoundException2") {
          console.warn("Scanner error:", error)
          onError?.(error)
        }
      })

      controlsRef.current = controls
      console.log("Scanner controls created")
    } catch (err) {
      console.error("Failed to start camera:", err)
      onError?.(err)
      setCameraStarted(false)
      setScanning(false)
    }
  }

  const stopCamera = () => {
    console.log("Stopping camera...")

    // Останавливаем декодер
    if (controlsRef.current) {
      try {
        controlsRef.current.stop()
        console.log("Scanner controls stopped")
      } catch (e) {
        console.warn("Error stopping scanner controls:", e)
      }
      controlsRef.current = null
    }

    // Останавливаем все треки медиа потока
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
          console.log("Camera track stopped:", track.kind, "state:", track.readyState)
        } catch (e) {
          console.warn("Error stopping track:", e)
        }
      })
      streamRef.current = null
    }

    // Получаем поток из видео элемента как запасной вариант
    if (videoRef.current && videoRef.current.srcObject) {
      const videoStream = videoRef.current.srcObject
      videoStream.getTracks().forEach((track) => {
        try {
          track.stop()
          console.log("Video element track stopped:", track.kind, "state:", track.readyState)
        } catch (e) {
          console.warn("Error stopping video track:", e)
        }
      })
    }

    // Очищаем видео элемент
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
      console.log("Video element cleared")
    }

    // Обновляем состояния
    setScanning(false)
    setCameraStarted(false)
    setIsActive(false)

    console.log("Camera stopped completely")
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan?.(manualInput.trim())
      setManualInput("")
    }
  }

  return (
    <div className="space-y-4">
      {/* Показываем переключатель только если allowManualInput */}
      {allowManualInput && (
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setShowManualInput(false)
              if (cameraStarted) {
                stopCamera()
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              !showManualInput ? "bg-white text-violet-600 shadow-sm" : "text-slate-600"
            }`}
          >
            <Camera className="w-4 h-4" />
            Камера
          </button>
          <button
            type="button"
            onClick={() => {
              setShowManualInput(true)
              if (cameraStarted) {
                stopCamera()
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showManualInput ? "bg-white text-violet-600 shadow-sm" : "text-slate-600"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Ввод
          </button>
        </div>
      )}

      {/* Ручной ввод */}
      {allowManualInput && showManualInput && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200/50">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg mb-3">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Ручной ввод</h3>
            <p className="text-sm text-slate-600">Введите код устройства</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Код устройства..."
              className="w-full px-4 py-3 bg-white/70 border border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 outline-none transition-all text-center font-mono"
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Добавить
            </button>
          </form>
        </div>
      )}

      {/* Видео и управление камерой */}
      {(!allowManualInput || (allowManualInput && !showManualInput)) && (
        <>
          <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-lg">
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-40 object-cover" />

            {/* Рамка сканирования - показываем только когда камера активна */}
            {cameraStarted && scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`relative w-24 h-24 transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                >
                  <div
                    className={`absolute inset-0 rounded-xl border-2 transition-colors duration-300 ${
                      isActive
                        ? "border-emerald-400 shadow-lg shadow-emerald-400/50"
                        : "border-white shadow-lg shadow-white/30"
                    }`}
                  >
                    {[
                      "top-left:-top-1 -left-1 border-l-3 border-t-3 rounded-tl-lg",
                      "top-right:-top-1 -right-1 border-r-3 border-t-3 rounded-tr-lg",
                      "bottom-left:-bottom-1 -left-1 border-l-3 border-b-3 rounded-bl-lg",
                      "bottom-right:-bottom-1 -right-1 border-r-3 border-b-3 rounded-br-lg",
                    ].map((corner, index) => (
                      <div
                        key={index}
                        className={`absolute w-4 h-4 transition-colors duration-300 ${corner.split(":")[1]} ${
                          isActive ? "border-emerald-400" : "border-white"
                        }`}
                      ></div>
                    ))}
                  </div>

                  {!isActive && (
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent">
                      <div className="h-full bg-emerald-400 animate-pulse rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Индикатор успешного сканирования */}
            {isActive && (
              <div className="absolute inset-0 bg-emerald-400/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-emerald-500 text-white p-3 rounded-xl animate-pulse shadow-lg">
                  <Scan className="w-6 h-6" />
                </div>
              </div>
            )}

            {/* Индикатор готовности */}
            {!cameraStarted && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-60" />
                  <p className="text-lg font-semibold mb-1">Камера не запущена</p>
                  <p className="text-sm text-slate-300">Нажмите "Запустить камеру" для начала</p>
                </div>
              </div>
            )}
          </div>

          {/* Панель управления */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              {!cameraStarted ? (
                <>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span className="text-slate-600 font-medium">Остановлена</span>
                </>
              ) : scanning ? (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-600 font-medium">Сканирует</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-600 font-medium">Запущена</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!cameraStarted ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Запустить камеру
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Остановить камеру
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
