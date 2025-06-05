"use client"

import React, { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { NotFoundException } from "@zxing/library"
import { Camera, X } from "lucide-react"

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export default function ScannerInput({ value, onChange }) {
  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!scanning || !isMobile()) return

    const startScan = async () => {
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      try {
        setError("")

        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
          throw new Error("Доступ к камере возможен только через HTTPS")
        }

        // iOS Safari (в т.ч. PWA) требует явного вызова getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        stream.getTracks().forEach(track => track.stop()) // остановка предварительного запроса

        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const deviceId = devices?.[0]?.deviceId
        if (!deviceId) throw new Error("Камера не найдена")

        await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              onChange(result.getText())
              stopScan()
            } else if (err && !(err instanceof NotFoundException)) {
              console.error("Ошибка сканирования:", err)
              setError("Ошибка при сканировании")
            }
          }
        )
      } catch (e) {
        console.error("Ошибка камеры:", e)
        if (e.name === "NotAllowedError" || e.name === "SecurityError") {
          setError("Разрешите доступ к камере в настройках Safari")
        } else {
          setError(e.message || "Не удалось получить доступ к камере")
        }
        stopScan()
      }
    }

    startScan()
    return () => stopScan()
  }, [scanning])

  const stopScan = () => {
    setScanning(false)
    codeReaderRef.current?.reset()
  }

  if (!isMobile()) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Введите или отсканируйте код"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    )
  }

  return (
    <div className="space-y-2">
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          <Camera className="w-5 h-5" />
          Сканировать код
        </button>
      ) : (
        <div className="relative border rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto"
            autoPlay
            muted
            playsInline
          />
          <button
            onClick={stopScan}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-600 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {value && <p className="text-sm text-gray-700">📦 Отсканировано: <strong>{value}</strong></p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
