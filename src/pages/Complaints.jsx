"use client"
import { useEffect, useState } from "react"
import {
  Search,
  Loader2,
  AlertTriangle,
  Clock,
  Calendar,
  Hash,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  FileText,
  Camera,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react"
import api from "../api/axios"
import CreateReclamationModal from "../components/CreateReclamationModal"

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

// Модальное окно для изображений
function ImageModal({ selectedImage, currentImageIndex, currentImageGroup, onClose, onNavigate }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          if (currentImageGroup.length > 1) onNavigate("prev")
          break
        case "ArrowRight":
          if (currentImageGroup.length > 1) onNavigate("next")
          break
        case "f":
        case "F":
          setIsFullscreen(!isFullscreen)
          break
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.body.style.overflow = "unset"
    }
  }, [selectedImage, currentImageGroup, currentImageIndex, isFullscreen, onClose, onNavigate])

  if (!selectedImage) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen ? "w-full h-full" : "w-full max-w-4xl max-h-[90vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">
              Фотография {currentImageIndex + 1} из {currentImageGroup.length}
            </h3>
            <p className="text-gray-300 text-sm">ESC - закрыть, стрелки - навигация</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Изображение */}
        <div
          className="relative bg-gray-100 flex items-center justify-center"
          style={{ height: isFullscreen ? "calc(100vh - 140px)" : "60vh" }}
        >
          <img
            src={selectedImage || "/placeholder.svg?height=600&width=800&query=complaint photo"}
            alt={`Фото ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Навигация */}
          {currentImageGroup.length > 1 && (
            <>
              <button
                onClick={() => onNavigate("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => onNavigate("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {currentImageGroup.length}
          </div>
        </div>
      </div>
    </div>
  )
}

// Карточка рекламации
function ComplaintCard({ complaint, updateStatus, updatingStatus, isExpanded, onToggle, onImageClick, role }) {
  const [editingType, setEditingType] = useState(null)
  const [comment, setComment] = useState("")

  const getStatusColor = (status) => {
    const colors = {
      "В ожидании": "bg-amber-100 text-amber-800 border-amber-200",
      "В работе": "bg-blue-100 text-blue-800 border-blue-200",
      "На проверке": "bg-purple-100 text-purple-800 border-purple-200",
      Отклонено: "bg-red-100 text-red-800 border-red-200",
      Исправлено: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    const icons = {
      "В ожидании": Clock,
      "В работе": Edit3,
      "На проверке": Eye,
      Отклонено: XCircle,
      Исправлено: CheckCircle,
    }
    const Icon = icons[status] || Clock
    return <Icon className="w-3 h-3" />
  }

  const handleAction = async (actionType) => {
    if (editingType !== actionType) {
      setEditingType(actionType)
      setComment("")
      return
    }

    if (comment.trim() === "" && actionType !== "approve" && actionType !== "reject") return

    try {
      let payload = {}
      switch (actionType) {
        case "work":
          payload = { comment_remarks: comment }
          break
        case "complete":
          payload = { comment_good: comment }
          break
        case "approve":
          payload = { approved: true }
          break
        case "reject":
          payload = { rejected: true }
          break
      }

      await api.patch(`/complaints/${complaint.id}/`, payload)
      setEditingType(null)
      setComment("")
      // Обновить данные
      window.location.reload()
    } catch (error) {
      console.error("Ошибка при обновлении:", error)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Заголовок карточки */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{complaint.serial_number}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <p className="text-xs text-gray-600">{new Date(complaint.created_at).toLocaleDateString("ru-RU")}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
              {getStatusIcon(complaint.status)}
              <span className="ml-1 hidden sm:inline">{complaint.status}</span>
            </span>
            {complaint.is_overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
                <AlertTriangle className="w-3 h-3" />
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Развернутое содержимое */}
      {isExpanded && (
        <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-4">
            {/* Замечания */}
            {complaint.remarks && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">Замечания</h4>
                    <p className="text-gray-600 text-sm">{complaint.remarks}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Комментарии */}
            {complaint.comment_remarks && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm mb-1">Комментарий к выезду</h4>
                    <p className="text-blue-700 text-sm">{complaint.comment_remarks}</p>
                  </div>
                </div>
              </div>
            )}

            {complaint.remarks_corrections && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900 text-sm mb-1">Исправлено</h4>
                    <p className="text-green-700 text-sm">{complaint.remarks_corrections}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Срок выполнения */}
            {complaint.due_date && (
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-900 text-sm">Крайний срок</h4>
                    <p className="text-amber-700 text-sm">{new Date(complaint.due_date).toLocaleDateString("ru-RU")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Фотографии */}
            {complaint.photos && complaint.photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-purple-500" />
                  <h4 className="font-medium text-gray-900 text-sm">Фотографии ({complaint.photos.length})</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {complaint.photos.slice(0, 6).map((url, i) => (
                    <div key={i} className="relative group cursor-pointer">
                      <img
                        src={url || "/placeholder.svg?height=80&width=80&query=complaint photo"}
                        alt={`Фото ${i + 1}`}
                        className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors"
                        onClick={() => onImageClick(url, complaint.photos, i)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg flex items-center justify-center transition-colors">
                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {i === 5 && complaint.photos.length > 6 && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">+{complaint.photos.length - 6}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Действия */}
            {complaint.status === "В ожидании" && (role === "admin" || role === "admin_paint") && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {editingType === "work" && (
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите комментарий..."
                    rows={3}
                  />
                )}
                <button
                  onClick={() => handleAction("work")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {editingType === "work" && comment.trim() ? "Подтвердить" : "Взять в работу"}
                </button>
              </div>
            )}

            {complaint.status === "В работе" && (role === "admin" || role === "admin_paint") && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {editingType === "complete" && (
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Введите комментарий об исправлении..."
                    rows={3}
                  />
                )}
                <button
                  onClick={() => handleAction("complete")}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Отметить как исправлено
                </button>
              </div>
            )}

            {complaint.status === "На проверке" && (role === "admin" || role === "admin_pp") && (
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleAction("approve")}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Принять
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Отклонить
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [toast, setToast] = useState(null)
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isMainExpanded, setIsMainExpanded] = useState(true)
  const [role, setRole] = useState(null)

  // Состояние для модального окна создания
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Состояние для модального окна изображений
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImageGroup, setCurrentImageGroup] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, profileRes] = await Promise.all([
          api.get("/complaints/"),
          api.get("/auth/me/").catch(() => ({ data: { role: null } })),
        ])

        setComplaints(complaintsRes.data)
        setRole(profileRes.data.role)
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setError("Не удалось загрузить рекламации")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleCardExpansion = (complaintId) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(complaintId)) {
        newSet.delete(complaintId)
      } else {
        newSet.add(complaintId)
      }
      return newSet
    })
  }

  const openImageModal = (imageUrl, imageGroup, index) => {
    setSelectedImage(imageUrl)
    setCurrentImageGroup(imageGroup)
    setCurrentImageIndex(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setCurrentImageGroup([])
    setCurrentImageIndex(0)
  }

  const navigateImage = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % currentImageGroup.length
        : (currentImageIndex - 1 + currentImageGroup.length) % currentImageGroup.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(currentImageGroup[newIndex])
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = complaint.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "" || complaint.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = complaints.reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1
    return acc
  }, {})

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
      showToast("Рекламация успешно создана", "success")
    } catch (error) {
      showToast("Ошибка при создании рекламации", "error")
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
          <p className="text-gray-600 font-medium">Загрузка рекламаций...</p>
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

      {/* Модальное окно изображений */}
      <ImageModal
        selectedImage={selectedImage}
        currentImageIndex={currentImageIndex}
        currentImageGroup={currentImageGroup}
        onClose={closeImageModal}
        onNavigate={navigateImage}
      />

      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto p-4">
          {/* Главная карточка */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Заголовок */}
            <div className="p-4 md:p-6 cursor-pointer" onClick={() => setIsMainExpanded(!isMainExpanded)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">Рекламации</h1>
                    <p className="text-sm text-gray-500">
                      {filteredComplaints.length} из {complaints.length} рекламаций
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(role === "admin" || role === "admin_pp") && (
                    <button
                      onClick={openCreateModal}
                      className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  {isMainExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Основное содержимое */}
            {isMainExpanded && (
              <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                {/* Статистика */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    <div className="text-center p-3 md:p-4 bg-gray-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-gray-600">{complaints.length}</div>
                      <div className="text-xs md:text-sm text-gray-600 font-medium">Всего</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-amber-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-amber-600">
                        {statusCounts["В ожидании"] || 0}
                      </div>
                      <div className="text-xs md:text-sm text-amber-600 font-medium">В ожидании</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-blue-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-blue-600">{statusCounts["В работе"] || 0}</div>
                      <div className="text-xs md:text-sm text-blue-600 font-medium">В работе</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-purple-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-purple-600">
                        {statusCounts["На проверке"] || 0}
                      </div>
                      <div className="text-xs md:text-sm text-purple-600 font-medium">На проверке</div>
                    </div>
                    <div className="text-center p-3 md:p-4 bg-green-50 rounded-xl">
                      <div className="text-xl md:text-2xl font-bold text-green-600">
                        {statusCounts["Исправлено"] || 0}
                      </div>
                      <div className="text-xs md:text-sm text-green-600 font-medium">Исправлено</div>
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
                            placeholder="Серийный номер"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      </div>

                      {/* Фильтр статуса */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Все статусы</option>
                          <option value="В ожидании">В ожидании</option>
                          <option value="В работе">В работе</option>
                          <option value="На проверке">На проверке</option>
                          <option value="Отклонено">Отклонено</option>
                          <option value="Исправлено">Исправлено</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Список рекламаций */}
                <div className="p-4 md:p-6">
                  {filteredComplaints.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        {complaints.length === 0 ? "Рекламации отсутствуют" : "Ничего не найдено"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm("")
                            setStatusFilter("")
                          }}
                          className="mt-3 text-red-500 hover:text-red-700 font-medium"
                        >
                          Сбросить фильтры
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredComplaints.map((complaint) => (
                        <ComplaintCard
                          key={complaint.id}
                          complaint={complaint}
                          isExpanded={expandedCards.has(complaint.id)}
                          onToggle={() => toggleCardExpansion(complaint.id)}
                          onImageClick={openImageModal}
                          role={role}
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
      {createModalOpen && <CreateReclamationModal onClose={closeCreateModal} onCreate={createComplaint} />}
    </>
  )
}
