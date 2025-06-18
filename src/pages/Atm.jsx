"use client"

import { useState, useEffect } from "react"
import api from "../api/axios"
import TableSearchATM from "../components/TableSearchATM"
import ScannerInput from "../components/Skaner"
import EditAtm from "../components/EditAtm"
import ATMDetails from "../components/ATMDetails"
import Toast from "../components/toast"

export default function SearchPage() {
  const [query, setQuery] = useState("")
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

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4">
      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
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
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 z-40 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
            <span>Нет подключения к интернету</span>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div
        className={`bg-white shadow-xl rounded-2xl p-3 sm:p-6 w-full max-w-4xl mx-auto ${showInstallPrompt ? "mt-16" : ""} ${!isOnline ? "mt-10" : ""}`}
      >
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Поиск устройства</h1>
          <div className="w-16 sm:w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-4 rounded-r-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4 sm:space-y-6">
            {/* Результат поиска - современный дизайн */}
            <div className="relative overflow-hidden">
              {/* Фоновый градиент */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent rounded-2xl"></div>

              {/* Декоративные элементы */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Контент */}
              <div className="relative border border-emerald-200/50 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                {/* Заголовок с иконкой успеха */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-800">Устройство найдено</h3>
                    <p className="text-sm text-emerald-600">Информация успешно загружена</p>
                  </div>
                </div>

                {/* Таблица с данными */}
                <div className="overflow-x-auto mb-4">
                  <TableSearchATM data={result} />
                </div>

                {/* Кнопка повторного поиска */}
                <div className="flex flex-col sm:flex-row gap-3">
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <button
                onClick={() => setIsEditExpanded(!isEditExpanded)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-between text-left"
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

              {/* Исправлено: убрана фиксированная высота и добавлен overflow-auto */}
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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

              {/* Исправлено: увеличена максимальная высота */}
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

        {!isScanned && (
          <div className="mt-4 sm:mt-6">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border-2 border-dashed border-gray-300">
              <ScannerInput onScan={handleNewScan} allowManualInput={true}/>
            </div>
          </div>
        )}
      </div>

      {/* PWA Status Bar для мобильных */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:hidden">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{isOnline ? "Онлайн" : "Офлайн"}</span>
          </div>
          {result && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>ATM найден</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
