import { useState } from "react"
import api from "../api/axios"
import TableSearchATM from "../components/TableSearchATM"
import ScannerInput from "../components/Skaner"
import EditAtm from "../components/EditAtm"
import Toast from "../components/toast"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [scannedDevices, setScannedDevices] = useState([])
  const [isScanned, setIsScanned] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  // поиск по коду
  const searchByCode = async (atm) => {
    try {
      setError("")
      const res = await api.get(`/atm/search/?code=${atm}`)
      setResult(res.data)
      showToast(`ATM найден: ${res.data.serial_number}`)
      setIsScanned(true) // ✅ Скрыть сканер
    } catch (err) {
      setResult(null)
      showToast(`ATM не найден: ${code}`, "error")
      setError(err.response?.data?.error || "Ошибка поиска")
      setIsScanned(false) // показать сканер снова
    }
  }

  // обработка сканирования
  const handleNewScan = (code) => {
    const trimmed = code.trim()
    if (!trimmed) return

    searchByCode(trimmed)

    const isDuplicate = scannedDevices.some((device) => device.code === trimmed)
    if (isDuplicate) {
      return
    }

    const newDevice = {
      id: Date.now(),
      code: trimmed,
      scannedAt: new Date().toISOString(),
    }

    setScannedDevices((prev) => [...prev, newDevice])
  }

  // сброс поиска
  const handleReset = () => {
    setQuery("")
    setResult(null)
    setIsScanned(false)
    setError("")
  }

  return (
    <div className="min-l-screen flex flex-col items-center p-4">
    {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-xl font-bold text-center mb-4">Поиск устройства</h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}

        {result && (
        <div className="mt-4">
            <TableSearchATM data={result} />

            <button
            onClick={handleReset}
            className="mt-4 w-full bg-yellow-500 text-white rounded-lg py-2 hover:bg-yellow-600"
            >
            🔁 Повторный поиск
            </button>
        </div>
        )}

        {result && (
        <div className="mt-4">
            <h1>Редактирование</h1>
            <EditAtm data={result} />
        </div>
        )}

        {!isScanned && (
          <div className="mt-4">
            <ScannerInput onScan={handleNewScan} />
          </div>
        )}
      </div>
    </div>
  )
}
