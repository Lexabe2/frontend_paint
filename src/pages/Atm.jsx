"use client"

import { useState, useEffect } from "react"
import { Search, Scan, WifiOff, Download, CheckCircle, AlertTriangle } from "lucide-react"
import api from "../api/axios"
import TableSearchATM from "../components/TableSearchATM"
import ScannerInput from "../components/Skaner"
import EditAtm from "../components/EditAtm"
import ATMDetails from "../components/ATMDetails"
import Toast from "../components/toast"

// Красивая анимация загрузки для страницы поиска ATM
function LoadingAnimation({ stage }) {
  const stages = [
    "Инициализация сканера...",
    "Подключение к базе данных...",
    "Настройка поиска...",
    "Подготовка интерфейса...",
    "Финализация...",
  ]

  return (
    <div className="fixed inset-0 from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Основная анимация */}
        <div className="relative mb-8">
          {/* Внешнее кольцо */}
          <div className="w-32 h-32 border-4 border-emerald-200 rounded-full animate-spin">
            <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-2 left-2"></div>
          </div>

          {/* Центральная иконка */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center animate-pulse shadow-lg">
              <Search className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Плавающие точки */}
          <div
            className="absolute -top-4 -left-4 w-4 h-4 bg-emerald-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute -top-4 -right-4 w-4 h-4 bg-teal-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute -bottom-4 -left-4 w-4 h-4 bg-emerald-300 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute -bottom-4 -right-4 w-4 h-4 bg-teal-300 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.6s" }}
          ></div>

          {/* Дополнительные орбитальные элементы */}
          <div
            className="absolute top-1/2 -left-8 w-3 h-3 bg-emerald-200 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 -right-8 w-3 h-3 bg-teal-200 rounded-full animate-ping"
            style={{ animationDelay: "1.5s" }}
          ></div>

          {/* Сканирующие лучи */}
          <div
            className="absolute inset-0 border-2 border-emerald-300 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute inset-2 border-2 border-teal-300 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Текст с анимацией */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
            Загрузка поиска ATM
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-slate-600 animate-pulse min-h-[28px] transition-all duration-500 text-lg">
            {stages[stage] || "Подготавливаем систему поиска..."}
          </p>
        </div>

        {/* Прогресс бар */}
        <div className="mt-10 w-80 mx-auto">
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(stage / 4) * 100}%` }}
            ></div>
          </div>
          <div className="mt-3 text-base text-slate-500 font-medium">{Math.round((stage / 4) * 100)}% завершено</div>
        </div>

        {/* Этапы загрузки */}
        <div className="mt-8 flex justify-center space-x-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                i <= stage ? "bg-emerald-500 scale-125 shadow-emerald-200" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-slate-500 text-sm">
          <p>Настраиваем сканер и базу данных...</p>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [scannedDevices, setScannedDevices] = useState([])
  const [isScanned, setIsScanned] = useState(false)
  const [toast, setToast] = useState(null)
  const [isEditExpanded, setIsEditExpanded] = useState(false)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  // Состояния для анимации загрузки
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(0)
  const [showHeader, setShowHeader] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Эффект загрузки
  useEffect(() => {
    const loadData = async () => {
      try {
        // Этап 1: Инициализация сканера
        setLoadingStage(1)
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Этап 2: Подключение к базе данных
        setLoadingStage(2)
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Этап 3: Настройка поиска
        setLoadingStage(3)
        setShowHeader(true)
        await new Promise((resolve) => setTimeout(resolve, 400))

        // Этап 4: Подготовка интерфейса
        setLoadingStage(4)
        setShowScanner(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Финализация
        setShowContent(true)
        setLoading(false)
      } catch (error) {
        console.error("Ошибка загрузки:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // PWA установка и онлайн статус
  useEffect(() => {
    // Проверка онлайн статуса
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setIsOnline(navigator.onLine)

    // PWA установка
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallPrompt(false)
    }

    setDeferredPrompt(null)
  }

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
      setIsScanned(true)
    } catch (err) {
      setResult(null)
      showToast(`ATM не найден: ${atm}`, "error")
      setError(err.response?.data?.error || "Ошибка поиска")
      setIsScanned(false)
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
    setIsEditExpanded(false)
    setIsDetailsExpanded(false)
  }

  if (loading) {
    return <LoadingAnimation stage={loadingStage} />
  }

  return (
    <div className="min-l-screen flex flex-col p-2 sm:p-4 animate-in fade-in duration-500">
      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Установить приложение</p>
                <p className="text-xs opacity-90">Быстрый доступ с главного экрана</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallApp}
                className="bg-white text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Установить
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 z-40 text-center text-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>Нет подключения к интернету</span>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div
        className={`bg-white shadow-xl rounded-2xl p-3 sm:p-6 w-full max-w-4xl mx-auto ${showInstallPrompt ? "mt-16" : ""} ${!isOnline ? "mt-10" : ""}`}
      >
        {/* Заголовок */}
        {showHeader && (
          <div className="text-center mb-4 sm:mb-6 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center animate-in zoom-in-50 duration-500">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Поиск устройства</h1>
                <p className="text-sm text-gray-500">Сканируйте или введите код ATM</p>
              </div>
            </div>
            <div
              className="w-16 sm:w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full animate-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "200ms" }}
            ></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-4 rounded-r-lg animate-in slide-in-from-left-4 duration-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && showContent && (
          <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            {/* Результат поиска - современный дизайн */}
            <div className="relative overflow-hidden">
              {/* Фоновый град��ент */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent rounded-2xl"></div>

              {/* Декоративные элементы */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Контент */}
              <div className="relative border border-emerald-200/50 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                {/* Заголовок с иконкой успеха */}
                <div className="flex items-center gap-3 mb-4 animate-in slide-in-from-left-4 duration-500">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800">Устройство найдено</h3>
                    <p className="text-sm text-emerald-600">Информация успешно загружена</p>
                  </div>
                </div>

                {/* Таблица с данными */}
                <div
                  className="overflow-x-auto mb-4 animate-in fade-in duration-500"
                  style={{ animationDelay: "200ms" }}
                >
                  <TableSearchATM data={result} />
                </div>

                {/* Кнопка повторного поиска */}
                <div
                  className="flex flex-col sm:flex-row gap-3 animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: "400ms" }}
                >
                  <button
                    onClick={handleReset}
                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl py-3 px-6 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {/* Анимированный фон */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <div className="relative flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Новый поиск</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Блок редактирования - разворачивающийся */}
            <div
              className="bg-white border border-gray-200 rounded-xl shadow-sm animate-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "600ms" }}
            >
              <button
                onClick={() => setIsEditExpanded(!isEditExpanded)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-between text-left rounded-t-xl"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                      Редактирование устройства
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Изменить параметры банкомата</p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isEditExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isEditExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                } overflow-auto`}
              >
                <div className="p-4 sm:p-6 border-t border-gray-100">
                  <EditAtm data={result} />
                </div>
              </div>
            </div>

            {/* Блок деталей ATM - разворачивающийся */}
            <div
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500"
              style={{ animationDelay: "800ms" }}
            >
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">Детали банкомата</h2>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                      Подробная информация и фотографии
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isDetailsExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isDetailsExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                } overflow-auto`}
              >
                <div className="border-t border-gray-100">
                  <ATMDetails data={result} />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isScanned && showScanner && (
          <div className="mt-4 sm:mt-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-4 sm:p-6 border-2 border-dashed border-gray-300 hover:border-emerald-300 transition-colors duration-300">
              <ScannerInput onScan={handleNewScan} allowManualInput={true} />
            </div>
          </div>
        )}
      </div>

      {/* PWA Status Bar для мобильных */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:hidden animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
            <span>{isOnline ? "Онлайн" : "Офлайн"}</span>
          </div>
          {result && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>ATM найден</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
