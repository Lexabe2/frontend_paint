"use client"

import React, { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { NotFoundException } from "@zxing/library"
import { Camera, X, Repeat } from "lucide-react"

export default function ScannerInput({ value, onChange }) {
  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const [devices, setDevices] = useState([])
  const [deviceIndex, setDeviceIndex] = useState(0)
  const [scannedText, setScannedText] = useState("")

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const availableDevices = await BrowserMultiFormatReader.listVideoInputDevices()
        setDevices(availableDevices)
      } catch (e) {
        setError("Не удалось получить список камер")
        console.error(e)
      }
    }
    loadDevices()
  }, [])

  useEffect(() => {
    if (!scanning || devices.length === 0) return

    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    const selectedDevice = devices[deviceIndex]

    const startScan = async () => {
      try {
        setError("")
        setScannedText("")

        if (
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost"
        ) {
          throw new Error("Доступ к камере возможен только через HTTPS")
        }

        // Запрашиваем доступ к видео, чтобы Safari показал prompt
        const constraints = selectedDevice?.deviceId
          ? { video: { deviceId: { exact: selectedDevice.deviceId } } }
          : { video: true }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        stream.getTracks().forEach(track => track.stop()) // только для запроса доступа

        await codeReader.decodeFromVideoDevice(
          selectedDevice?.deviceId ?? null,
          videoRef.current,
          (result, err) => {
            if (result) {
              const text = result.getText()
              setScannedText(text)
              onChange(text)
              stopScan()
            } else if (err && !(err instanceof NotFoundException)) {
              console.error("Ошибка сканирования:", err)
              setError("Ошибка при сканировании")
            }
          }
        )
      } catch (e) {
        console.error("Ошибка камеры:", e)
        setError(
          e.name === "NotAllowedError"
            ? "Разрешите доступ к камере в настройках браузера"
            : e.message || "Не удалось получить доступ к камере"
        )
        stopScan()
      }
    }

    startScan()

    return () => stopScan()
  }, [scanning, deviceIndex, devices])

  const stopScan = () => {
    setScanning(false)
    const codeReader = codeReaderRef.current
    try {
      codeReader?.stopContinuousDecode()
    } catch (e) {
      console.warn("Ошибка остановки сканера", e)
    }
    const video = videoRef.current
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }
  }

  const switchCamera = () => {
    const nextIndex = (deviceIndex + 1) % devices.length
    setDeviceIndex(nextIndex)
    setScanning(false)
    setTimeout(() => setScanning(true), 300)
  }

  return (
    <div className="space-y-2">
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          <Camera className="w-5 h-5" />
          Сканировать код 1
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
          <div className="absolute top-2 right-2 flex gap-2">
            {devices.length > 1 && (
              <button
                onClick={switchCamera}
                className="bg-white/80 hover:bg-white text-gray-600 rounded-full p-1"
              >
                <Repeat className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={stopScan}
              className="bg-white/80 hover:bg-white text-gray-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {scannedText && (
        <p className="text-sm text-green-600">
          ✅ Отсканировано: <strong>{scannedText}</strong>
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500">⚠️ {error}</p>
      )}
    </div>
  )
}
