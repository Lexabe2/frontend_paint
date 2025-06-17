"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Hash,
  FileText,
  Camera,
  Edit3,
  ChevronDown,
  X,
  Zap,
  ArrowRight,
  TrendingUp,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react"
import api from "../api/axios"
import CreateReclamationModal from "../components/CreateReclamationModal"

const STATUS_OPTIONS = [
  {
    value: "",
    label: "Все",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Filter,
    gradient: "from-slate-400 to-slate-500",
  },
  {
    value: "В ожидании",
    label: "В ожидании",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    value: "В работе",
    label: "В работе",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Edit3,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    value: "На проверке",
    label: "На проверке",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Eye,
    gradient: "from-purple-400 to-violet-500",
  },
  {
    value: "Отклонено",
    label: "Отклонено",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    gradient: "from-red-400 to-rose-500",
  },
  {
    value: "Исправлено",
    label: "Исправлено",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    gradient: "from-emerald-400 to-teal-500",
  },
]

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [role, setRole] = useState(null)

  // Состояние для модального окна с фото
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImageGroup, setCurrentImageGroup] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Для модальных окон
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Состояния для редактирования комментариев
  const [editingComplaintId, setEditingComplaintId] = useState(null)
  const [comment, setComment] = useState("")
  const [comment_good, setCommentGood] = useState("")

  useEffect(() => {
    api
      .get("/auth/me/")
      .then((response) => {
        setRole(response.data.role)
      })
      .catch((error) => {
        console.error("Ошибка при загрузке профиля:", error)
      })
  }, [])

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get("/complaints/")
        setComplaints(response.data)
      } catch (error) {
        console.error("Ошибка при загрузке жалоб:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  useEffect(() => {
    let data = [...complaints]

    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter)
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase()
      data = data.filter((c) => c.serial_number.toLowerCase().includes(lowerSearch))
    }

    // Отправить исправленные в конец
    data.sort((a, b) => {
      if (a.status === "Исправлено") return 1
      if (b.status === "Исправлено") return -1
      return 0
    })

    setFiltered(data)
  }, [statusFilter, searchTerm, complaints])

  // Функции для работы с изображениями
  const openImageModal = (imageUrl, imageGroup, index) => {
    console.log("Opening image modal:", { imageUrl, imageGroup, index }) // Для отладки
    setSelectedImage(imageUrl)
    setCurrentImageGroup(imageGroup)
    setCurrentImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setCurrentImageGroup([])
    setCurrentImageIndex(0)
    setIsFullscreen(false)
  }

  const navigateImage = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % currentImageGroup.length
        : (currentImageIndex - 1 + currentImageGroup.length) % currentImageGroup.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(currentImageGroup[newIndex])
  }

  // Обработка клавиш для навигации
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return

      switch (e.key) {
        case "Escape":
          closeImageModal()
          break
        case "ArrowLeft":
          if (currentImageGroup.length > 1) navigateImage("prev")
          break
        case "ArrowRight":
          if (currentImageGroup.length > 1) navigateImage("next")
          break
        case "f":
        case "F":
          setIsFullscreen(!isFullscreen)
          break
      }
    }

    if (selectedImage) {
      document.addEventListener("keydown", handleKeyPress)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.body.style.overflow = "unset"
    }
  }, [selectedImage, currentImageGroup, currentImageIndex, isFullscreen])

  const openCreateModal = () => {
    setCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setCreateModalOpen(false)
  }

  const createComplaint = async (newComplaint) => {
    try {
      const response = await api.post("/complaints-add/", newComplaint)
      setComplaints((prev) => [response.data, ...prev])
      closeCreateModal()
      window.location.reload()
    } catch (error) {
      alert("Ошибка при создании рекламации")
      console.error(error)
    }
  }

  const handleClick = async (complaint) => {
    if (editingComplaintId !== complaint.id) {
      setEditingComplaintId(complaint.id)
      setComment("")
    } else {
      if (comment.trim() === "") return

      try {
        const response = await api.patch(`/complaints/${complaint.id}/`, {
          comment_remarks: comment,
        })

        if (response.status === 200) {
          console.log("Комментарий успешно отправлен")
          setEditingComplaintId(null)
          setComment("")
          window.location.reload()
        } else {
          console.error("Ошибка при отправке комментария")
        }
      } catch (error) {
        console.error("Ошибка сети:", error)
      }
    }
  }

  const handleClickGood = async (complaint) => {
    if (editingComplaintId !== complaint.id) {
      setEditingComplaintId(complaint.id)
      setCommentGood("")
    } else {
      if (comment_good.trim() === "") return

      try {
        const response = await api.patch(`/complaints/${complaint.id}/`, {
          comment_good: comment_good,
        })

        if (response.status === 200) {
          console.log("Комментарий успешно отправлен")
          setEditingComplaintId(null)
          setCommentGood("")
          window.location.reload()
        } else {
          console.error("Ошибка при отправке комментария")
        }
      } catch (error) {
        console.error("Ошибка сети:", error)
      }
    }
  }

  const handleClickReject = async (complaint) => {
    try {
      const response = await api.patch(`/complaints/${complaint.id}/`, {
        rejected: true,
      })

      if (response.status === 200) {
        console.log("Рекламация отклонена")
        window.location.reload()
      } else {
        console.error("Ошибка при отклонении")
      }
    } catch (error) {
      console.error("Ошибка сети:", error)
    }
  }

  const handleClickApproved = async (complaint) => {
    try {
      const response = await api.patch(`/complaints/${complaint.id}/`, {
        approved: true,
      })

      if (response.status === 200) {
        console.log("Рекламация принята")
        window.location.reload()
      } else {
        console.error("Ошибка при отклонении")
      }
    } catch (error) {
      console.error("Ошибка сети:", error)
    }
  }

  const getStatusConfig = (status) => {
    return STATUS_OPTIONS.find((option) => option.value === status) || STATUS_OPTIONS[0]
  }

  // Статистика для дашборда
  const getStats = () => {
    const total = complaints.length
    const pending = complaints.filter((c) => c.status === "В ожидании").length
    const inProgress = complaints.filter((c) => c.status === "В работе").length
    const overdue = complaints.filter((c) => c.is_overdue).length

    return { total, pending, inProgress, overdue }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <p className="text-slate-700 font-semibold">Загрузка рекламаций...</p>
          <p className="text-slate-500 text-sm mt-1">Получение данных с сервера</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="pb-20 sm:pb-4">
        {/* Мобильный заголовок с улучшенным дизайном */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/50 px-4 py-3 sm:hidden shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                {stats.pending > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{stats.pending}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Рекламации</h1>
                <p className="text-xs text-slate-600">
                  {filtered.length} из {stats.total}
                </p>
              </div>
            </div>
            {(role === "admin" || role === "admin_pp") && (
              <button
                onClick={openCreateModal}
                className="group relative w-11 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-active:translate-x-full transition-transform duration-300"></div>
                <Plus className="w-5 h-5 text-white relative z-10" />
              </button>
            )}
          </div>
        </div>

        {/* Десктопный заголовок с статистикой */}
        <div className="hidden sm:block p-4 lg:p-6">
          <div className="max-w-7xl mx-auto mb-6">
            {/* Статистические карточки */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Всего</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">В ожидании</p>
                    <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                {stats.pending > 0 && (
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Требует внимания
                  </div>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">В работе</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-red-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Просрочено</p>
                    <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Основной заголовок */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-2xl blur-sm -z-10"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Рекламации
                    </h1>
                    <p className="text-slate-600 mt-1">Управление жалобами и замечаниями</p>
                  </div>
                </div>

                {(role === "admin" || role === "admin_pp") && (
                  <button
                    onClick={openCreateModal}
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span>Создать рекламацию</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Улучшенный блок поиска и фильтров */}
        <div className="px-4 mb-4 sm:px-6 sm:max-w-7xl sm:mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
            {/* Поиск */}
            <div className="p-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Поиск по серийному номеру..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-sm placeholder:text-slate-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Кнопка фильтров на мобильном */}
            <div className="sm:hidden border-t border-slate-200/50">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Фильтры</span>
                  {statusFilter && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">1</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Улучшенные фильтры */}
            <div className={`border-t border-slate-200/50 ${showFilters ? "block" : "hidden"} sm:block`}>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {STATUS_OPTIONS.map(({ value, label, color, icon: Icon, gradient }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setStatusFilter(value)
                        setShowFilters(false)
                      }}
                      className={`group relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 font-medium text-xs sm:text-sm ${
                        statusFilter === value
                          ? `${color} shadow-sm ring-1 ring-current/20`
                          : "bg-white/50 text-slate-600 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300/50 active:bg-slate-100"
                      }`}
                    >
                      {statusFilter === value && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5`}></div>
                      )}
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                      <span className="truncate relative z-10">{label}</span>
                      {statusFilter === value && value !== "" && (
                        <span className="hidden sm:inline ml-1 bg-white/40 text-xs px-1.5 py-0.5 rounded-full font-bold relative z-10">
                          {filtered.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Улучшенный список рекламаций */}
        <div className="px-4 sm:px-6 sm:max-w-7xl sm:mx-auto">
          {filtered.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Рекламаций не найдено</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || statusFilter ? "Попробуйте изменить фильтры поиска" : "Создайте первую рекламацию"}
              </p>
              {!searchTerm && !statusFilter && (role === "admin" || role === "admin_pp") && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  Создать рекламацию
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((complaint) => {
                const statusConfig = getStatusConfig(complaint.status)
                const StatusIcon = statusConfig.icon
                const isEditing = editingComplaintId === complaint.id

                return (
                  <div
                    key={complaint.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden hover:shadow-md hover:border-slate-300/50 transition-all duration-200"
                  >
                    {/* Улучшенный заголовок карточки */}
                    <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/50 px-4 py-3 border-b border-slate-200/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${statusConfig.gradient} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}
                          >
                            <Hash className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                              {complaint.serial_number}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <p className="text-xs text-slate-600">
                                {new Date(complaint.created_at).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.color} shadow-sm`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{complaint.status}</span>
                          </span>

                          {complaint.is_overdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
                              <AlertTriangle className="w-3 h-3" />
                              
                              <span className="hidden sm:inline">Просрочено</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Улучшенное содержимое карточки */}
                    <div className="p-4">
                      <div className="space-y-4">
                        {/* Замечания */}
                        {complaint.remarks && (
                          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/30">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="w-3 h-3 text-slate-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-800 text-sm mb-1">Замечания</h4>
                                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                                  {complaint.remarks}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {complaint.comment_remarks && (
                          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-200/30">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="w-3 h-3 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-blue-800 text-sm mb-1">Комментарий к выезду</h4>
                                <p className="text-blue-700 text-xs leading-relaxed line-clamp-3">
                                  {complaint.comment_remarks}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {complaint.remarks_corrections && (
                          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200/30">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-emerald-800 text-sm mb-1">Исправлено</h4>
                                <p className="text-emerald-700 text-xs leading-relaxed line-clamp-3">
                                  {complaint.remarks_corrections}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Срок выполнения */}
                        {complaint.due_date && (
                          <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/30">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-3 h-3 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-amber-800 text-sm">Крайний срок</h4>
                                <p className="text-amber-700 text-xs">
                                  {new Date(complaint.due_date).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Улучшенная галерея фотографий с возможностью увеличения */}
                        {complaint.photos && complaint.photos.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-purple-200 rounded-lg flex items-center justify-center">
                                <Camera className="w-3 h-3 text-purple-600" />
                              </div>
                              <h4 className="font-semibold text-slate-800 text-sm">
                                Фотографии ({complaint.photos.length})
                              </h4>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {complaint.photos.slice(0, 6).map((url, i) => (
                                <div key={`${complaint.id}-${i}`} className="relative group cursor-pointer">
                                  <img
                                    src={url || "/placeholder.svg?height=80&width=80&query=complaint photo"}
                                    alt={`Фото ${i + 1}`}
                                    className="w-full h-16 sm:h-20 object-cover rounded-xl border border-slate-200/50 group-hover:border-slate-300 transition-all duration-200"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      openImageModal(url, complaint.photos, i)
                                    }}
                                  />

                                  {/* Overlay с иконкой увеличения */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl flex items-center justify-center transition-all duration-200 pointer-events-none">
                                    <div className="w-8 h-8 bg-white/0 group-hover:bg-white/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-200">
                                      <ZoomIn className="w-4 h-4 text-slate-700" />
                                    </div>
                                  </div>

                                  {i === 5 && complaint.photos.length > 6 && (
                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm pointer-events-none">
                                      <span className="text-white font-bold text-xs">
                                        +{complaint.photos.length - 6}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Улучшенные кнопки действий */}
                        {complaint.status === "В ожидании" && (role === "admin" || role === "admin_paint") && (
                          <div className="space-y-3 pt-2 border-t border-slate-200/50">
                            {isEditing && (
                              <div className="relative">
                                <textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="w-full border border-slate-300/50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white/50 backdrop-blur-sm"
                                  placeholder="Введите комментарий или причину..."
                                  rows={3}
                                />
                              </div>
                            )}

                            <button
                              onClick={() => handleClick(complaint)}
                              className="group w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:from-blue-700 active:to-indigo-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                              <Edit3 className="w-4 h-4 relative z-10" />
                              <span className="relative z-10">
                                {isEditing && comment.trim() ? "Подтвердить" : "Взять в работу"}
                              </span>
                            </button>
                          </div>
                        )}

                        {complaint.status === "В работе" && (role === "admin" || role === "admin_paint") && (
                          <div className="space-y-3 pt-2 border-t border-slate-200/50">
                            {isEditing && (
                              <div className="relative">
                                <textarea
                                  value={comment_good}
                                  onChange={(e) => setCommentGood(e.target.value)}
                                  className="w-full border border-slate-300/50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white/50 backdrop-blur-sm"
                                  placeholder="Введите комментарий об исправлении..."
                                  rows={3}
                                />
                              </div>
                            )}

                            <button
                              onClick={() => handleClickGood(complaint)}
                              className="group w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                              <CheckCircle className="w-4 h-4 relative z-10" />
                              <span className="relative z-10">Отметить как исправлено</span>
                            </button>
                          </div>
                        )}

                        {complaint.status === "На проверке" && (role === "admin" || role === "admin_pp") && (
                          <div className="flex gap-3 pt-2 border-t border-slate-200/50">
                            <button
                              onClick={() => handleClickApproved(complaint)}
                              className="group flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                              <CheckCircle className="w-4 h-4 relative z-10" />
                              <span className="relative z-10">Принять</span>
                            </button>

                            <button
                              onClick={() => handleClickReject(complaint)}
                              className="group flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                              <X className="w-4 h-4 relative z-10" />
                              <span className="relative z-10">Отклонить</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Модальное окно для просмотра изображений */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={closeImageModal}
          >
            <div
              className={`bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                isFullscreen ? "w-full h-full" : "w-full max-w-4xl max-h-[90vh]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Заголовок модального окна */}
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4 flex justify-between items-center">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-bold text-lg truncate">
                    Фотография {currentImageIndex + 1} из {currentImageGroup.length}
                  </h3>
                  <p className="text-slate-200 text-sm">Нажмите ESC для закрытия, стрелки для навигации</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                    title="Полноэкранный режим (F)"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={closeImageModal}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                    title="Закрыть (ESC)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Изображение с навигацией */}
              <div
                className="relative bg-slate-100 flex items-center justify-center"
                style={{ height: isFullscreen ? "calc(100vh - 140px)" : "60vh" }}
              >
                <img
                  src={selectedImage || "/placeholder.svg?height=600&width=800&query=complaint detailed photo"}
                  alt={`Фото ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />

                {/* Навигационные кнопки */}
                {currentImageGroup.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage("prev")}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                      title="Предыдущее фото (←)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => navigateImage("next")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                      title="Следующее фото (→)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Индикатор позиции */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {currentImageGroup.length}
                </div>
              </div>

              {/* Миниатюры */}
              {currentImageGroup.length > 1 && !isFullscreen && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
                    {currentImageGroup.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index)
                          setSelectedImage(img)
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIndex
                            ? "border-blue-500 shadow-lg scale-110"
                            : "border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={img || "/placeholder.svg?height=64&width=64&query=complaint thumbnail"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {createModalOpen && <CreateReclamationModal onClose={closeCreateModal} onCreate={createComplaint} />}
      </div>
    </div>
  )
}
