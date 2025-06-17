"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Camera, Scan, Keyboard, Zap } from "lucide-react"

export default function ScannerInput({ onScan, onError }) {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const codeReaderRef = useRef(null)
  const controlsRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader()

    return () => {
      stopScanning()
    }
  }, [])

  const startScan = async () => {
    try {
      setScanning(true)
      const controls = await codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          setIsActive(true)
          onScan?.(result.getText())

          setTimeout(() => {
            setIsActive(false)
            stopScanning()
          }, 800)
        } else if (error && error.name !== "NotFoundException" && error.name !== "NotFoundException2") {
          // Игнорируем NotFoundException и NotFoundException2 - это нормальные ошибки когда код не найден
          console.warn("Scanner error:", error)
          onError?.(error)
        }
        // Если это NotFoundException/NotFoundException2, просто игнорируем - это означает что код не найден в текущем кадре
      })

      controlsRef.current = controls

      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject
      }
    } catch (err) {
      onError?.(err)
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setScanning(false)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan?.(manualInput.trim())
      setManualInput("")
      setShowManualInput(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Компактный переключатель режимов */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setShowManualInput(false)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            !showManualInput ? "bg-white text-violet-600 shadow-sm" : "text-slate-600"
          }`}
        >
          <Camera className="w-4 h-4" />
          Камера
        </button>
        <button
          type="button"
          onClick={() => setShowManualInput(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showManualInput ? "bg-white text-violet-600 shadow-sm" : "text-slate-600"
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Ввод
        </button>
      </div>

      {/* Компактный ручной ввод */}
      {showManualInput && (
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

      {/* Компактный сканер камеры */}
      {!showManualInput && (
        <>
          {/* Зона сканирования */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-lg">
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-40 object-cover" />

            {/* Рамка сканирования */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`relative w-24 h-24 transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                <div
                  className={`absolute inset-0 rounded-xl border-2 transition-colors duration-300 ${
                    isActive
                      ? "border-emerald-400 shadow-lg shadow-emerald-400/50"
                      : scanning
                        ? "border-white shadow-lg shadow-white/30"
                        : "border-slate-400"
                  }`}
                >
                  {/* Углы рамки */}
                  {[
                    "top-left:-top-1 -left-1 border-l-3 border-t-3 rounded-tl-lg",
                    "top-right:-top-1 -right-1 border-r-3 border-t-3 rounded-tr-lg",
                    "bottom-left:-bottom-1 -left-1 border-l-3 border-b-3 rounded-bl-lg",
                    "bottom-right:-bottom-1 -right-1 border-r-3 border-b-3 rounded-br-lg",
                  ].map((corner, index) => (
                    <div
                      key={index}
                      className={`absolute w-4 h-4 transition-colors duration-300 ${corner.split(":")[1]} ${
                        isActive ? "border-emerald-400" : scanning ? "border-white" : "border-slate-400"
                      }`}
                    ></div>
                  ))}
                </div>

                {/* Анимированная линия сканирования */}
                {scanning && !isActive && (
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent">
                    <div className="h-full bg-emerald-400 animate-pulse rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Индикатор успешного сканирования */}
            {isActive && (
              <div className="absolute inset-0 bg-emerald-400/20 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-emerald-500 text-white p-3 rounded-xl animate-pulse shadow-lg">
                  <Scan className="w-6 h-6" />
                </div>
              </div>
            )}

            {/* Оверлей когда камера не активна */}
            {!scanning && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <Scan className="w-8 h-8 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium">Готов к сканированию</p>
                </div>
              </div>
            )}
          </div>

          {/* Компактное управление камерой */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              {scanning ? (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-600 font-medium">Активна</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span className="text-slate-600 font-medium">Готов</span>
                </>
              )}
            </div>

            {scanning ? (
              <button
                type="button"
                onClick={stopScanning}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium text-sm"
              >
                Стоп
              </button>
            ) : (
              <button
                type="button"
                onClick={startScan}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all font-medium text-sm flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Сканировать
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
