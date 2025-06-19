"use client"
import { useEffect, useState } from "react"
import api from "../api/axios"

export default function Dashboard() {
  const [requests, setRequests] = useState([])
  const [reclamations, setReclamations] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedColumns, setExpandedColumns] = useState({})

  useEffect(() => {
    api
      .get("/dashboard/")
      .then((response) => {
        setRequests(response.data.requests)
        setReclamations(response.data.reclamations)
        setLoading(false)
        // Изначально все колонки свернуты
        const initialExpanded = {}
        Object.keys(response.data.reclamations).forEach((status) => {
          initialExpanded[status] = false
        })
        setExpandedColumns(initialExpanded)
      })
      .catch((err) => {
        console.error("Ошибка при получении данных:", err)
        setError("Ошибка загрузки")
        setLoading(false)
      })
  }, [])

  // Переключение состояния колонки
  const toggleColumn = (status) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [status]: !prev[status],
    }))
  }

  // Функция для создания уникального ключа
  const createUniqueKey = (prefix, id, index) => {
    if (id !== undefined && id !== null) {
      return `${prefix}-${id}`
    }
    return `${prefix}-index-${index}`
  }

  // Функция для форматирования дат в русском формате
  const formatRussianDate = (dateString) => {
    if (!dateString) return "Не указано"

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Относительные даты
    if (diffDays === 0) return "Сегодня"
    if (diffDays === 1) return "Вчера"
    if (diffDays === -1) return "Завтра"
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} дня назад`
    if (diffDays < -1 && diffDays >= -7) return `Через ${Math.abs(diffDays)} дня`

    // Полный формат
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Получить относительное время
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Неизвестно"

    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Только что"
    if (diffHours < 24) return `${diffHours} ч. назад`
    if (diffDays === 1) return "Вчера"
    if (diffDays < 7) return `${diffDays} дн. назад`

    return formatRussianDate(dateString)
  }

  // Мобильный загрузчик
  const MobileLoader = () => (
    <div className="space-y-4 px-2">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-12 w-12 rounded-xl"></div>
          <div className="space-y-2 flex-1">
            <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-5 w-32 rounded"></div>
            <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-3 w-20 rounded"></div>
          </div>
        </div>
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={`skeleton-card-${i}`}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2">
              <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-4 w-24 rounded"></div>
              <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-3 w-16 rounded"></div>
            </div>
            <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-6 w-16 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={`skeleton-item-${i}-${j}`} className="space-y-1">
                <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-2 w-12 rounded"></div>
                <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-shimmer h-3 w-16 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // Мобильный спиннер
  const MobileSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-purple-500 rounded-full animate-spin border-t-transparent animate-reverse-spin"></div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Загружаем данные</h3>
        <p className="text-gray-500 text-sm">Подождите немного...</p>
      </div>
    </div>
  )

  // Мобильный статус бейдж
  const MobileStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const configs = {
        completed: {
          bg: "bg-gradient-to-r from-emerald-400 to-green-500",
          text: "text-white",
          icon: "✨",
          label: "Завершено",
        },
        in_progress: {
          bg: "bg-gradient-to-r from-blue-400 to-cyan-500",
          text: "text-white",
          icon: "⚡",
          label: "В процессе",
        },
        pending: {
          bg: "bg-gradient-to-r from-amber-400 to-orange-500",
          text: "text-white",
          icon: "⏳",
          label: "Ожидание",
        },
        default: {
          bg: "bg-gradient-to-r from-gray-400 to-gray-500",
          text: "text-white",
          icon: "●",
          label: status || "Неизвестно",
        },
      }
      return configs[status] || configs.default
    }

    const config = getStatusConfig(status)

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.text} shadow-md`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  // Мобильная карточка заявки
  const MobileRequestCard = ({ req, index }) => (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: "both",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
            {req.project ? req.project.charAt(0) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{req.project || "Без названия"}</h3>
            <p className="text-gray-500 text-xs">ID: #{req.requestId || `temp-${index}`}</p>
          </div>
        </div>
        <MobileStatusBadge status={req.status} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Устройство</p>
          <p className="text-gray-900 font-semibold text-sm truncate">{req.device || "Не указано"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Количество</p>
          <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {req.quantity || 0}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Срок</p>
          <p className="text-gray-900 font-semibold text-sm">{formatRussianDate(req.deadline)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
        <span className="text-xs text-gray-500">Обновлено {getRelativeTime(new Date().toISOString())}</span>
        <button className="text-blue-600 text-xs font-medium">Подробнее →</button>
      </div>
    </div>
  )

  // Разворачивающаяся колонка рекламаций
  const CollapsibleReclamationColumn = ({ status, items, index }) => {
    const isExpanded = expandedColumns[status]

    const getStatusConfig = (status) => {
      const configs = {
        Создана: { icon: "🆕", gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
        "В работе": { icon: "⚙️", gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50" },
        Готова: { icon: "✅", gradient: "from-emerald-500 to-green-500", bg: "from-emerald-50 to-green-50" },
        Отгружена: { icon: "❌", gradient: "from-red-500 to-pink-500", bg: "from-red-50 to-pink-50" },
      }
      return configs[status] || { icon: "📋", gradient: "from-gray-500 to-gray-600", bg: "from-gray-50 to-gray-100" }
    }

    const config = getStatusConfig(status)

    return (
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up"
        style={{
          animationDelay: `${index * 0.15}s`,
          animationFillMode: "both",
        }}
      >
        {/* Header - всегда видимый */}
        <div
          className="p-4 sm:p-6 cursor-pointer select-none hover:bg-white/90 transition-colors duration-200"
          onClick={() => toggleColumn(status)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-md`}
              >
                {config.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">{status}</h3>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">{items.length} записей</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className={`bg-gradient-to-br ${config.gradient} text-white px-2 py-1 sm:px-3 sm:py-2 rounded-xl font-bold text-sm sm:text-base shadow-md`}
              >
                {items.length}
              </div>
              <div
                className={`w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isExpanded ? "rotate-180 bg-blue-100" : ""
                }`}
              >
                <span
                  className={`text-sm transition-colors duration-200 ${isExpanded ? "text-blue-600" : "text-gray-600"}`}
                >
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Подсказка для пользователя */}
          {!isExpanded && items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <p className="text-xs text-gray-500 text-center">Нажмите для просмотра {items.length} записей</p>
            </div>
          )}
        </div>

        {/* Разворачивающийся контент */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {items.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 opacity-20 animate-bounce">📭</div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Пусто</h4>
                <p className="text-gray-500 text-sm sm:text-base">Нет записей в этой категории</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, itemIndex) => (
                  <div
                    key={createUniqueKey(`reclamation-${status}`, item.id, itemIndex)}
                    className="bg-white/60 backdrop-blur-lg hover:bg-white/80 rounded-xl p-3 sm:p-4 transition-all duration-200 border border-white/40 hover:border-white/60 hover:shadow-md animate-fade-in-up"
                    style={{
                      animationDelay: isExpanded ? `${itemIndex * 0.05}s` : "0s",
                      animationFillMode: "both",
                    }}
                  >
                    {/* Item header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md`}
                        >
                          {item.serialNumber ? item.serialNumber.slice(-2) : "??"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {item.serialNumber || "Неизвестный номер"}
                          </p>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Серийный номер</p>
                        </div>
                      </div>
                      {item.isOverdue && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-lg font-bold animate-pulse shadow-md">
                          🚨
                        </span>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">📅</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium text-xs">Срок:</span>
                          <p
                            className={`font-bold text-xs sm:text-sm ${item.isOverdue ? "text-red-600" : "text-gray-900"}`}
                          >
                            {formatRussianDate(item.dueDate)}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors">
                        Открыть
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="relative max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
          {/* Mobile-Optimized Header */}
          <div className="mb-8 sm:mb-16">
            <div className="relative">
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gray-200 shadow-xl sm:shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-6">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl sm:shadow-2xl">
                        <span className="text-white text-lg sm:text-3xl animate-pulse">📊</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl animate-ping opacity-20"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-1 sm:mb-2">
                        Панель управления
                      </h1>
                      <p className="text-gray-600 font-medium text-xs sm:text-lg truncate">Обзор заявок и рекламаций</p>
                      <p className="text-gray-500 text-xs sm:hidden">
                        {new Date().toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500">Время обновления</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date().toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-8">
              <MobileSpinner />
              <div className="block sm:hidden">
                <MobileLoader />
              </div>
              <div className="hidden sm:block">
                <MobileLoader />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="relative mx-2 sm:mx-0">
              <div className="relative bg-white/80 backdrop-blur-xl border border-red-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl">
                <div className="flex items-center space-x-3 sm:space-x-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg sm:text-2xl">⚠️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-red-900 mb-1 sm:mb-2">Ошибка загрузки</h3>
                    <p className="text-red-700 font-medium mb-2 sm:mb-4 text-sm sm:text-base">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-bold text-sm sm:text-base"
                    >
                      Попробовать снова
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <div className="space-y-8 sm:space-y-16">
              {/* Requests Section */}
              <section>
                <div className="flex items-center justify-between mb-6 sm:mb-12 px-2 sm:px-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <h2 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                      Заявки
                    </h2>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg">
                      {requests.length}
                    </span>
                  </div>
                </div>

                {requests.length === 0 ? (
                  <div className="relative mx-2 sm:mx-0">
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-xl sm:shadow-2xl border border-gray-200">
                      <div className="text-6xl sm:text-9xl mb-4 sm:mb-8 opacity-20 animate-bounce">📝</div>
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Нет заявок</h3>
                      <p className="text-gray-500 font-medium text-sm sm:text-lg mb-4 sm:mb-8">
                        Создайте первую заявку для начала работы
                      </p>
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-sm sm:text-lg">
                        Создать заявку
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-8 px-2 sm:px-0">
                    {requests.map((request, index) => (
                      <MobileRequestCard
                        key={createUniqueKey("request", request.requestId, index)}
                        req={request}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Reclamations Section */}
              <section>
                <div className="flex items-center justify-between mb-6 sm:mb-12 px-2 sm:px-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <h2 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                      Рекламации
                    </h2>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg">
                      {Object.values(reclamations).reduce((acc, items) => acc + items.length, 0)}
                    </span>
                  </div>
                </div>

                {Object.keys(reclamations).length === 0 ? (
                  <div className="relative mx-2 sm:mx-0">
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-xl sm:shadow-2xl border border-gray-200">
                      <div className="text-6xl sm:text-9xl mb-4 sm:mb-8 opacity-20 animate-bounce">📋</div>
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Нет рекламаций</h3>
                      <p className="text-gray-500 font-medium text-sm sm:text-lg">Все работает отлично!</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 px-2 sm:px-0">
                    {Object.entries(reclamations).map(([status, items], index) => (
                      <CollapsibleReclamationColumn
                        key={`reclamation-column-${status}-${index}`}
                        status={status}
                        items={items}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Global CSS для анимаций */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }

          .animate-slide-up {
            animation: slide-up 0.6s ease-out;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.4s ease-out;
          }

          .animate-shimmer {
            animation: shimmer 1.5s infinite;
          }

          .animate-reverse-spin {
            animation: spin 1s linear infinite reverse;
          }

          /* Mobile optimizations */
          @media (max-width: 640px) {
            .backdrop-blur-xl {
              backdrop-filter: blur(8px);
            }
            
            .backdrop-blur-2xl {
              backdrop-filter: blur(12px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `,
        }}
      />
    </>
  )
}
