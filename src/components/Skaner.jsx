import React, { useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { NotFoundException } from "@zxing/library"
import { Camera, X } from "lucide-react"

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export default function ScannerInput({ value, onChange }) {
  const videoRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const codeReaderRef = useRef(null)

  const startScan = async () => {
    setError("")
    setScanning(true)

    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      const selectedDeviceId = devices[0]?.deviceId

      if (!selectedDeviceId) throw new Error("Камера не найдена")

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            onChange(result.getText())
            stopScan()
          } else if (err && !(err instanceof NotFoundException)) {
            console.error(err)
            setError("Ошибка при сканировании")
          }
        }
      )
    } catch (e) {
      console.error("Ошибка доступа к камере:", e)
      setError("Не удалось получить доступ к камере. Убедитесь, что дали разрешение.")
      stopScan()
    }
  }

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
          onClick={startScan}
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
