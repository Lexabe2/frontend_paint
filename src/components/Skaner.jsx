"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { Camera, CameraOff, Scan } from 'lucide-react'

export default function ScannerInput({ onScan, onError }) {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [isActive, setIsActive] = useState(false)
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
        } else if (error && error.name !== "NotFoundException") {
          onError?.(error)
        }
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

  return (
    <div className="space-y-3">
      {/* Компактная зона сканирования */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} muted autoPlay playsInline className="w-full h-48 object-cover" />

        {/* Рамка сканирования */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`relative w-32 h-32 transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
            <div
              className={`absolute inset-0 border-2 rounded-lg transition-colors duration-300 ${
                isActive ? "border-green-400" : scanning ? "border-white" : "border-gray-400"
              }`}
            >
              {/* Углы рамки */}
              <div
                className={`absolute -top-1 -left-1 w-4 h-4 border-l-3 border-t-3 rounded-tl-lg transition-colors duration-300 ${
                  isActive ? "border-green-400" : scanning ? "border-white" : "border-gray-400"
                }`}
              ></div>
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 border-r-3 border-t-3 rounded-tr-lg transition-colors duration-300 ${
                  isActive ? "border-green-400" : scanning ? "border-white" : "border-gray-400"
                }`}
              ></div>
              <div
                className={`absolute -bottom-1 -left-1 w-4 h-4 border-l-3 border-b-3 rounded-bl-lg transition-colors duration-300 ${
                  isActive ? "border-green-400" : scanning ? "border-white" : "border-gray-400"
                }`}
              ></div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 border-r-3 border-b-3 rounded-br-lg transition-colors duration-300 ${
                  isActive ? "border-green-400" : scanning ? "border-white" : "border-gray-400"
                }`}
              ></div>
            </div>

            {/* Анимированная линия сканирования */}
            {scanning && !isActive && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent">
                <div className="h-full bg-green-400 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Индикатор успешного сканирования */}
        {isActive && (
          <div className="absolute inset-0 bg-green-400 bg-opacity-20 flex items-center justify-center">
            <div className="bg-green-500 text-white p-2 rounded-full animate-pulse">
              <Scan className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Оверлей когда камера не активна */}
        {!scanning && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <Scan className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Нажмите для сканирования</p>
            </div>
          </div>
        )}
      </div>

      {/* Компактное управление */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {scanning ? (
            <>
              <Camera className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">Активна</span>
            </>
          ) : (
            <>
              <CameraOff className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Готов</span>
            </>
          )}
        </div>

        {scanning ? (
          <button
            onClick={stopScanning}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Стоп
          </button>
        ) : (
          <button
            onClick={startScan}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <Scan className="w-4 h-4" />
            Сканировать
          </button>
        )}
      </div>
    </div>
  )
}
