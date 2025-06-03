"use client"
import React from 'react';
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Calendar,
  Clock,
  Hash,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  ListFilter,
  BarChart2,
} from "lucide-react"
import api from "../api/axios"

// Компонент уведомлений
function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Bell className="w-5 h-5 text-blue-500" />,
  }

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${colors[type]} max-w-sm`}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="font-medium flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Компонент карточки заявки
function RequestCard({ request, updateStatus, updatingStatus, getStatusColor, getStatusText, getStatusIcon }) {
  const getWorkStatusBadge = (status) => {
    const statusConfig = {
      новый: { color: "bg-blue-100 text-blue-800", icon: "🆕" },
      "в работе": { color: "bg-yellow-100 text-yellow-800", icon: "⚡" },
      завершён: { color: "bg-green-100 text-green-800", icon: "✅" },
    }

    const config = statusConfig[status] || statusConfig["новый"]

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="text-xs">{config.icon}</span>
        <span>{status}</span>
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Заголовок карточки */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">#{request.request_id}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{request.project}</h3>
            <p className="text-xs text-gray-500">{request.device}</p>
          </div>
        </div>
        {getWorkStatusBadge(request.status)}
      </div>

      {/* Тело карточки */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Hash className="w-3.5 h-3.5" />
              <span>Количество</span>
            </div>
            <div className="text-lg font-semibold text-gray-800">{request.quantity}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Срок</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(request.deadline)}`}></div>
              <div className="text-lg font-semibold text-gray-800">{getStatusText(request.deadline)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Получено: {request.date_received}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Срок: {request.deadline}</span>
          </div>
        </div>

        {/* Изменение статуса */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(request.deadline)}
            <span className="text-sm font-medium">
              {new Date(request.deadline) < new Date() ? "Просрочено" : "В срок"}
            </span>
          </div>

          <div className="relative">
            {updatingStatus[request.request_id] && (
              <div className="absolute inset-0 bg-white/80 rounded flex items-center justify-center z-10">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
            <select
              value={request.status}
              onChange={(e) => updateStatus(request.request_id, e.target.value, request.status)}
              disabled={updatingStatus[request.request_id]}
              className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="новый">🆕 Новый</option>
              <option value="в работе">⚡ В работе</option>
              <option value="завершён">✅ Завершён</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
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
  const [isListExpanded, setIsListExpanded] = useState(true)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid или list

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

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.request_id.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return "bg-red-500"
    if (diffDays <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusText = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return `${Math.abs(diffDays)} дн. просрочено`
    if (diffDays === 0) return "Сегодня"
    if (diffDays === 1) return "Завтра"
    return `${diffDays} дн.`
  }

  const getStatusIcon = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return <XCircle className="w-4 h-4 text-red-500" />
    if (diffDays <= 3) return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1
    return acc
  }, {})

  const toggleList = () => {
    setIsListExpanded(!isListExpanded)
  }

  const toggleFilters = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  return (
    <>
      {/* Toast уведомления */}
      <AnimatePresence>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b border-gray-100 cursor-pointer"
          onClick={toggleList}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Список заявок</h2>
              <p className="text-sm text-gray-500">
                {loading ? "Загрузка..." : `${filteredRequests.length} из ${requests.length} заявок`}
              </p>
            </div>
          </div>

          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isListExpanded ? "Свернуть список" : "Развернуть список"}
          >
            {isListExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isListExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Фильтры и статистика */}
              {!loading && requests.length > 0 && (
                <div className="px-6 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    {/* Статистика */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                        <span className="text-sm">🆕</span>
                        <span className="font-medium">{statusCounts["новый"] || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg">
                        <span className="text-sm">⚡</span>
                        <span className="font-medium">{statusCounts["в работе"] || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                        <span className="text-sm">✅</span>
                        <span className="font-medium">{statusCounts["завершён"] || 0}</span>
                      </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFilters()
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Фильтры</span>
                        {isFilterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewMode("grid")
                          }}
                          className={`p-1.5 rounded ${
                            viewMode === "grid" ? "bg-white shadow" : "hover:bg-gray-200"
                          } transition-colors`}
                        >
                          <BarChart2 className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewMode("list")
                          }}
                          className={`p-1.5 rounded ${
                            viewMode === "list" ? "bg-white shadow" : "hover:bg-gray-200"
                          } transition-colors`}
                        >
                          <ListFilter className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Расширенные фильтры */}
                  <AnimatePresence>
                    {isFilterExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap gap-4">
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                placeholder="Проект, устройство или ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                              <option value="all">Все статусы</option>
                              <option value="новый">🆕 Новые</option>
                              <option value="в работе">⚡ В работе</option>
                              <option value="завершён">✅ Завершённые</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Список заявок */}
              <div className="p-6 pt-2">
                {loading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-500">Загрузка заявок...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                    <p className="text-red-500 font-medium">{error}</p>
                    <p className="text-gray-500 text-sm mt-2">Попробуйте обновить страницу</p>
                  </motion.div>
                ) : filteredRequests.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {requests.length === 0 ? "Заявки отсутствуют" : "Не найдено заявок по заданным критериям"}
                    </p>
                    {requests.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                        }}
                        className="mt-3 text-sm text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Сбросить фильтры
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div
                    className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}`}
                  >
                    <AnimatePresence>
                      {filteredRequests.map((req) => (
                        <RequestCard
                          key={req.request_id}
                          request={req}
                          updateStatus={updateStatus}
                          updatingStatus={updatingStatus}
                          getStatusColor={getStatusColor}
                          getStatusText={getStatusText}
                          getStatusIcon={getStatusIcon}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
