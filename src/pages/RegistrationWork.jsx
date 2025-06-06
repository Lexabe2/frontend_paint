"use client"

import { useEffect, useState } from "react"
import { Package, Hash, ChevronDown, ChevronUp, Send, Trash2, Plus } from "lucide-react"
import { useParams } from "react-router-dom"
import api from "../api/axios"
import ScannerInput from "../components/Skaner"
import Toast from "../components/toast"

const RegistrationWork = () => {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [scannedDevices, setScannedDevices] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toast states
  const [toast, setToast] = useState(null)

  const storageKey = `scanned_devices_${id}`

  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  useEffect(() => {
    const savedDevices = localStorage.getItem(storageKey)
    if (savedDevices) {
      try {
        setScannedDevices(JSON.parse(savedDevices))
      } catch (e) {
        console.error("Ошибка при загрузке сохраненных данных:", e)
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (scannedDevices.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(scannedDevices))
    }
  }, [scannedDevices, storageKey])

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await api.get(`/requests-work/${id}/`)
        setRequest(res.data)
      } catch (err) {
        console.error("Ошибка при загрузке заявки:", err)
        setError("Не удалось загрузить данные заявки")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRequest()
    }
  }, [id])

  const handleNewScan = (code) => {
    if (!code.trim()) return

    const isDuplicate = scannedDevices.some((device) => device.code === code)
    if (isDuplicate) {
      showToast("Это устройство уже было отсканировано!", "error")
      return
    }

    const newDevice = {
      id: Date.now(),
      code: code.trim(),
      scannedAt: new Date().toISOString(),
      requestId: id,
    }

    setScannedDevices((prev) => [...prev, newDevice])
    showToast("Устройство успешно отсканировано!")
  }

  const removeDevice = (deviceId) => {
    setScannedDevices((prev) => prev.filter((device) => device.id !== deviceId))
    showToast("Устройство удалено")
  }

  const clearAllDevices = () => {
    if (window.confirm("Очистить весь список?")) {
      setScannedDevices([])
      localStorage.removeItem(storageKey)
      showToast("Список очищен")
    }
  }

  const submitDevices = async () => {
    if (scannedDevices.length === 0) {
      showToast("Нет устройств для отправки!", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        requestId: id,
        devices: scannedDevices.map((device) => ({
          code: device.code,
          scannedAt: device.scannedAt,
        })),
      }

      await api.post(`/requests-work/${id}/register-devices/`, payload)

      showToast("Данные успешно отправлены!")
      setScannedDevices([])
      localStorage.removeItem(storageKey)
    } catch (err) {
      console.error("Ошибка при отправке данных:", err)
      showToast(err.response?.data?.message || "Ошибка отправки данных", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-4 max-w-2xl">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <Package className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-red-900 mb-1">Ошибка загрузки</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Заявка не найдена</h3>
          <p className="text-sm text-gray-500">Запрашиваемая заявка не существует</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-4 max-w-2xl pb-20">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="space-y-4">
        {/* Компактный Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Оприходование</h1>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Hash className="w-4 h-4" />
              {request.request_id}
            </div>
            {scannedDevices.length > 0 && (
              <div className="text-blue-800 font-medium">
                {scannedDevices.length}/{request.quantity}
              </div>
            )}
          </div>
        </div>

        {/* Компактная информация о заявке */}
        <div className="bg-white rounded-lg border">
          <div className="p-3 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Заявка
            </h2>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded hover:bg-gray-100">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isExpanded && (
            <div className="p-3 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 mb-1">Проект</p>
                  <p className="font-medium">{request.project}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Устройство</p>
                  <p className="font-medium">{request.device}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Количество</p>
                  <p className="font-medium">{request.quantity} шт.</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Дедлайн</p>
                  <p className="font-medium">{new Date(request.deadline).toLocaleDateString("ru-RU")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Компактный сканер */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />
            Сканирование
          </h3>
          <ScannerInput onScan={handleNewScan} />
        </div>

        {/* Компактный список устройств */}
        {scannedDevices.length > 0 && (
          <div className="bg-white rounded-lg border">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Отсканировано ({scannedDevices.length})
              </h3>
              <button
                onClick={clearAllDevices}
                className="text-red-600 text-sm flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded"
              >
                <Trash2 className="w-3 h-3" />
                Очистить
              </button>
            </div>
            <div className="p-3">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scannedDevices.map((device, index) => (
                  <div key={device.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{device.code}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(device.scannedAt).toLocaleTimeString("ru-RU")}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeDevice(device.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Фиксированная кнопка отправки */}
      {scannedDevices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <button
            onClick={submitDevices}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Отправка..." : `Отправить (${scannedDevices.length})`}
          </button>
        </div>
      )}
    </div>
  )
}

export default RegistrationWork
