"use client"
import { useEffect, useState } from "react"
import {
  Search,
  Loader2,
  AlertTriangle,
  Clock,
  Package2,
  Calendar,
  Hash,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import api from "../api/axios"

// Toast компонент
function Toast({ message, type, onClose }) {
  const styles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }

  return (
    <div
      className={`fixed top-4 left-4 right-4 md:top-6 md:right-6 md:left-auto md:w-80 z-50 ${styles[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium pr-2">{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Компонент карточки заявки
function RequestCard({ request, updateStatus, updatingStatus, isExpanded, onToggle }) {
  const isOverdue = new Date(request.deadline) < new Date()
  const daysLeft = Math.ceil((new Date(request.deadline) - new Date()) / (1000 * 60 * 60 * 24))

  const getStatusColor = (status) => {
    const colors = {
      новый: "bg-blue-100 text-blue-800 border-blue-200",
      "в работе": "bg-amber-100 text-amber-800 border-amber-200",
      завершён: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[status] || colors["новый"]
  }

  const getDeadlineColor = () => {
    if (isOverdue) return "text-red-600"
    if (daysLeft <= 3) return "text-amber-600"
    return "text-green-600"
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Заголовок карточки - всегда видимый */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-mono">#{request.request_id}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{request.project}</h3>
              <p className="text-sm text-gray-500 truncate">{request.device}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Мобильная краткая информация */}
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-gray-600">{request.quantity} шт.</span>
          <span className={`font-medium ${getDeadlineColor()}`}>
            {isOverdue ? `Просрочено на ${Math.abs(daysLeft)} дн.` : `${daysLeft} дн. до срока`}
          </span>
        </div>
      </div>

      {/* Развернутое содержимое */}
      {isExpanded && (
        <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          {/* Детальная информация */}
          <div className="p-4 space-y-4">
            {/* Статистика */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Hash className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{request.quantity}</div>
                <div className="text-xs text-gray-500">Количество</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <div className="text-sm font-semibold text-gray-900">{request.date_received}</div>
                <div className="text-xs text-blue-600">Получено</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <div className="text-sm font-semibold text-gray-900">{request.deadline}</div>
                <div className="text-xs text-purple-600">Срок</div>
              </div>
            </div>

            {/* Предупреждения */}
            {(isOverdue || daysLeft <= 3) && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  isOverdue ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{isOverdue ? "Заявка просрочена" : "Срок истекает скоро"}</span>
              </div>
            )}

            {/* Управление статусом */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Изменить статус:</label>
              <div className="relative">
                {updatingStatus[request.request_id] && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
                <select
                  value={request.status}
                  onChange={(e) => updateStatus(request.request_id, e.target.value, request.status)}
                  disabled={updatingStatus[request.request_id]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="новый">Новый</option>
                  <option value="в работе">В работе</option>
                  <option value="завершён">Завершён</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RequestList({ refresh }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [toast, setToast] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState({})
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isMainExpanded, setIsMainExpanded] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await api.get("/requests-list/")
        setRequests(res.data)
      } catch (error) {
        console.error("Ошибка загрузки заявок:", error)
        setError("Не удалось загрузить заявки")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [refresh])

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 4000)
  }

  const updateStatus = async (id, newStatus, oldStatus) => {
    if (newStatus === oldStatus) return

    setUpdatingStatus((prev) => ({ ...prev, [id]: true }))

    try {
      await api.patch(`/requests/${id}/`, { status: newStatus })

      setRequests((prev) => prev.map((req) => (req.request_id === id ? { ...req, status: newStatus } : req)))

      const statusMessages = {
        новый: 'Заявка переведена в статус "Новый"',
        "в работе": "Заявка взята в работу",
        завершён: "Заявка успешно завершена",
      }

      showToast(statusMessages[newStatus] || `Статус изменен на "${newStatus}"`, "success")
    } catch (error) {
      console.error("Ошибка обновления статуса:", error)
      showToast("Не удалось обновить статус заявки", "error")
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [id]: false }))
    }
  }

  const toggleCardExpansion = (requestId) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        newSet.add(requestId)
      }
      return newSet
    })
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.request_id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
          <p className="text-gray-600 font-medium">Загрузка заявок...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Попробуйте обновить страницу</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="min-h-screen">
        <div className="mx-auto">
          {/* Главная карточка */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Заголовок */}
            <div className="p-4 md:p-6 cursor-pointer" onClick={() => setIsMainExpanded(!isMainExpanded)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Package2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">Список заявок</h1>
                    <p className="text-sm text-gray-500">
                      {filteredRequests.length} из {requests.length} заявок
                    </p>
                  </div>
                </div>
                {isMainExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Основное содержимое */}
            {isMainExpanded && (
              <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                {/* Статистика */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="text-center p-3 md:p-4 bg-blue-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-blue-600">{statusCounts["новый"] || 0}</div>
                      <div className="text-xs md:text-sm text-blue-600 font-medium">Новые</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-amber-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-amber-600">
                        {statusCounts["в работе"] || 0}
                      </div>
                      <div className="text-xs md:text-sm text-amber-600 font-medium">В работе</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-green-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-green-600">
                        {statusCounts["завершён"] || 0}
                      </div>
                      <div className="text-xs md:text-sm text-green-600 font-medium">Завершён</div>
                    </div>
                  </div>
                </div>

                {/* Фильтры */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Фильтры и поиск</span>
                    </div>
                    {showFilters ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {showFilters && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Поиск */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Проект, устройство или ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Фильтр статуса */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">Все статусы</option>
                          <option value="новый">Новые</option>
                          <option value="в работе">В работе</option>
                          <option value="завершён">Завершённые</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Список заявок */}
                <div className="p-4 md:p-6">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Package2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        {requests.length === 0 ? "Заявки отсутствуют" : "Ничего не найдено"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm("")
                            setStatusFilter("all")
                          }}
                          className="mt-3 text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Сбросить фильтры
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRequests.map((request) => (
                        <RequestCard
                          key={request.request_id}
                          request={request}
                          updateStatus={updateStatus}
                          updatingStatus={updatingStatus}
                          isExpanded={expandedCards.has(request.request_id)}
                          onToggle={() => toggleCardExpansion(request.request_id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
