"use client"
import { useEffect, useState } from "react"
import {
  Search,
  AlertTriangle,
  Clock,
  Calendar,
  Hash,
  Filter,
  ChevronDown,
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
} from "lucide-react"
import api from "../api/axios"
import CreateReclamationModal from "../components/CreateReclamationModal"

// Красивая анимация загрузки с этапами
function LoadingAnimation({ stage }) {
  const stages = [
    "Подключение к серверу...",
    "Загрузка данных...",
    "Подготовка интерфейса...",
    "Обработка статистики...",
    "Настройка фильтров...",
    "Финализация...",
  ]

  return (
    <div className="min-l-screen from-gray-50 via-red-50 to-orange-50 flex items-center justify-center mt-10">
      <div className="text-center">
        {/* Основная анимация */}
        <div className="relative">
          {/* Внешнее кольцо */}
          <div className="w-24 h-24 border-4 border-red-200 rounded-full animate-spin">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-2 left-2"></div>
          </div>

          {/* Центральная иконка */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Плавающие точки */}
          <div
            className="absolute -top-2 -left-2 w-3 h-3 bg-red-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute -top-2 -right-2 w-3 h-3 bg-orange-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute -bottom-2 -left-2 w-3 h-3 bg-red-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute -bottom-2 -right-2 w-3 h-3 bg-orange-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.6s" }}
          ></div>
        </div>

        {/* Текст с анимацией */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">Загрузка рекламаций</h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-gray-600 animate-pulse min-h-[24px] transition-all duration-500">
            {stages[stage] || "Подготавливаем данные для вас..."}
          </p>
        </div>

        {/* Прогресс бар */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(stage / 5) * 100}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-500">{Math.round((stage / 5) * 100)}% завершено</div>
        </div>

        {/* Этапы загрузки */}
        <div className="mt-6 flex justify-center space-x-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= stage ? "bg-red-500 scale-110" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Скелетон для карточек
function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
            <div>
              <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 bg-gray-300 rounded-full w-20"></div>
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast уведомления
function Toast({ message, type, onClose }) {
  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 animate-in slide-in-from-top-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-3 text-white/80 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Модальное окно для просмотра изображений
function ImageViewer({ isOpen, images, currentIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose()
        if (e.key === "ArrowLeft") onPrev()
        if (e.key === "ArrowRight") onNext()
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = "auto"
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isOpen, onClose, onNext, onPrev])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative max-w-4xl max-h-[90vh] w-full animate-in zoom-in-95 duration-300">
        {/* Заголовок */}
        <div className="absolute top-0 left-0 right-0 bg-black/50 text-white p-4 z-10 rounded-t-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              Фото {currentIndex + 1} из {images.length}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Изображение */}
        <div className="bg-white rounded-lg overflow-hidden">
          <img
            src={images[currentIndex] || "/placeholder.svg?height=600&width=800&query=complaint photo"}
            alt={`Фото ${currentIndex + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain transition-all duration-300"
          />
        </div>

        {/* Навигация */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Индикатор */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

// Карточка рекламации
function ComplaintCard({ complaint, onExpand, isExpanded, onImageClick, role, onStatusUpdate }) {
  const [editMode, setEditMode] = useState(null)
  const [comment, setComment] = useState("")

  const statusConfig = {
    "В ожидании": { color: "bg-amber-100 text-amber-800", icon: Clock },
    "В работе": { color: "bg-blue-100 text-blue-800", icon: Edit3 },
    "На проверке": { color: "bg-purple-100 text-purple-800", icon: Eye },
    Отклонено: { color: "bg-red-100 text-red-800", icon: XCircle },
    Исправлено: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  }

  const StatusIcon = statusConfig[complaint.status]?.icon || Clock

  const handleAction = async (action) => {
    if (editMode !== action) {
      setEditMode(action)
      setComment("")
      return
    }

    if (!comment.trim() && action !== "approve" && action !== "reject") return

    await onStatusUpdate(complaint.id, action, comment)
    setEditMode(null)
    setComment("")
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4">
      {/* Заголовок */}
      <div className="p-4 cursor-pointer" onClick={() => onExpand(complaint.id)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center transition-transform hover:scale-105">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{complaint.serial_number}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(complaint.created_at).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${statusConfig[complaint.status]?.color}`}
            >
              <StatusIcon className="w-4 h-4 inline mr-1" />
              {complaint.status}
            </span>
            {complaint.is_overdue && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Детали */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Замечания */}
          {complaint.remarks && (
            <div className="bg-gray-50 rounded-lg p-3 transition-all duration-200 hover:bg-gray-100">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Замечания</h4>
                  <p className="text-gray-600 text-sm mt-1">{complaint.remarks}</p>
                </div>
              </div>
            </div>
          )}

          {/* Комментарии */}
          {complaint.comment_remarks && (
            <div className="bg-blue-50 rounded-lg p-3 transition-all duration-200 hover:bg-blue-100">
              <div className="flex items-start gap-2">
                <Edit3 className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Комментарий к работе</h4>
                  <p className="text-blue-700 text-sm mt-1">{complaint.comment_remarks}</p>
                </div>
              </div>
            </div>
          )}

          {complaint.remarks_corrections && (
            <div className="bg-green-50 rounded-lg p-3 transition-all duration-200 hover:bg-green-100">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium text-green-900 text-sm">Исправления</h4>
                  <p className="text-green-700 text-sm mt-1">{complaint.remarks_corrections}</p>
                </div>
              </div>
            </div>
          )}

          {/* Срок */}
          {complaint.due_date && (
            <div className="bg-amber-50 rounded-lg p-3 transition-all duration-200 hover:bg-amber-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <div>
                  <h4 className="font-medium text-amber-900 text-sm">Срок выполнения</h4>
                  <p className="text-amber-700 text-sm">{new Date(complaint.due_date).toLocaleDateString("ru-RU")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Фотографии */}
          {complaint.photos && complaint.photos.length > 0 && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-purple-500" />
                <h4 className="font-medium text-gray-900 text-sm">Фотографии ({complaint.photos.length})</h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {complaint.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105"
                    onClick={() => onImageClick(complaint.photos, index)}
                  >
                    <img
                      src={photo || "/placeholder.svg?height=80&width=80&query=complaint photo"}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200 group-hover:border-gray-400 transition-all duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-all duration-200">
                      <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Действия */}
          {complaint.status === "В ожидании" && (role === "admin" || role === "admin_paint") && (
            <div className="border-t border-gray-100 pt-4 animate-in slide-in-from-bottom-2 duration-300">
              {editMode === "work" && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Комментарий к работе..."
                  className="w-full p-3 border border-gray-200 rounded-lg mb-3 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              )}
              <button
                onClick={() => handleAction("work")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {editMode === "work" ? "Подтвердить" : "Взять в работу"}
              </button>
            </div>
          )}

          {complaint.status === "В работе" && (role === "admin" || role === "admin_paint") && (
            <div className="border-t border-gray-100 pt-4 animate-in slide-in-from-bottom-2 duration-300">
              {editMode === "complete" && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Описание выполненных работ..."
                  className="w-full p-3 border border-gray-200 rounded-lg mb-3 resize-none transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              )}
              <button
                onClick={() => handleAction("complete")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {editMode === "complete" ? "Подтвердить" : "Отметить как выполнено"}
              </button>
            </div>
          )}

          {complaint.status === "На проверке" && (role === "admin" || role === "admin_pp") && (
            <div className="border-t border-gray-100 pt-4 flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleAction("approve")}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Принять
              </button>
              <button
                onClick={() => handleAction("reject")}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Отклонить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Основной компонент
export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [toast, setToast] = useState(null)
  const [role, setRole] = useState(null)

  // Добавить новые состояния после существующих состояний
  const [loadingStage, setLoadingStage] = useState(0) // 0-4 этапы загрузки
  const [showHeader, setShowHeader] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showFiltersBlock, setShowFiltersBlock] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [visibleCards, setVisibleCards] = useState(0)

  // Модальные окна
  const [createModal, setCreateModal] = useState(false)
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
  })

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Этап 1: Загрузка данных
        setLoadingStage(1)
        await new Promise((resolve) => setTimeout(resolve, 800))

        const [complaintsRes, profileRes] = await Promise.all([
          api.get("/complaints/"),
          api.get("/auth/me/").catch(() => ({ data: { role: null } })),
        ])

        setComplaints(complaintsRes.data)
        setRole(profileRes.data.role)

        // Этап 2: Показать заголовок
        setLoadingStage(2)
        setShowHeader(true)
        await new Promise((resolve) => setTimeout(resolve, 400))

        // Этап 3: Показать статистику
        setLoadingStage(3)
        setShowStats(true)
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Этап 4: Показать фильтры
        setLoadingStage(4)
        setShowFiltersBlock(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Этап 5: Показать карточки
        setShowCards(true)
        setLoading(false)

        // Показываем карточки по очереди
        const totalCards = complaintsRes.data.length
        for (let i = 0; i <= totalCards; i++) {
          setVisibleCards(i)
          await new Promise((resolve) => setTimeout(resolve, 150))
        }
      } catch (error) {
        setError("Не удалось загрузить данные")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Функции
  const showToast = (message, type = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleExpanded = (id) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const openImageViewer = (images, index) => {
    setImageViewer({
      isOpen: true,
      images,
      currentIndex: index,
    })
  }

  const closeImageViewer = () => {
    setImageViewer({
      isOpen: false,
      images: [],
      currentIndex: 0,
    })
  }

  const navigateImage = (direction) => {
    setImageViewer((prev) => {
      const newIndex =
        direction === "next"
          ? (prev.currentIndex + 1) % prev.images.length
          : (prev.currentIndex - 1 + prev.images.length) % prev.images.length

      return { ...prev, currentIndex: newIndex }
    })
  }

  const createComplaint = async (newComplaint) => {
    try {
      const response = await api.post("/complaints-add/", newComplaint)
      setComplaints((prev) => [response.data, ...prev])
      setCreateModal(false)
      showToast("Рекламация успешно создана", "success")
    } catch (error) {
      showToast("Ошибка при создании рекламации", "error")
      console.error(error)
    }
  }

  const updateStatus = async (id, action, comment) => {
    try {
      const payload = {}
      switch (action) {
        case "work":
          payload.comment_remarks = comment
          break
        case "complete":
          payload.comment_good = comment
          break
        case "approve":
          payload.approved = true
          break
        case "reject":
          payload.rejected = true
          break
      }

      await api.patch(`/complaints/${id}/`, payload)

      // Обновляем локальное состояние
      const response = await api.get("/complaints/")
      setComplaints(response.data)

      showToast("Статус обновлен", "success")
    } catch (error) {
      showToast("Ошибка обновления статуса", "error")
    }
  }

  // Фильтрация
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = complaint.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Статистика
  const stats = complaints.reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return <LoadingAnimation stage={loadingStage} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-in fade-in duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold text-lg">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Попробуйте обновить страницу</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Модальные окна */}
      <ImageViewer
        {...imageViewer}
        onClose={closeImageViewer}
        onNext={() => navigateImage("next")}
        onPrev={() => navigateImage("prev")}
      />

      <CreateReclamationModal isOpen={createModal} onClose={() => setCreateModal(false)} onCreate={createComplaint} />

      <div className="max-w-4xl mx-auto p-4">
        {/* Заголовок */}
        {showHeader && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4 duration-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center transition-transform hover:scale-105 animate-in zoom-in-50 duration-500">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: "200ms" }}>
                    <h1 className="text-2xl font-bold text-gray-900">Рекламации</h1>
                    <p className="text-gray-500">
                      {filteredComplaints.length} из {complaints.length}
                    </p>
                  </div>
                </div>

                {(role === "admin" || role === "admin_pp") && (
                  <button
                    onClick={() => setCreateModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95 animate-in slide-in-from-right-4 duration-500"
                    style={{ animationDelay: "400ms" }}
                  >
                    <Plus className="w-4 h-4" />
                    Создать
                  </button>
                )}
              </div>

              {/* Статистика */}
              {showStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: "Всего", value: complaints.length, color: "bg-gray-50" },
                    { label: "В ожидании", value: stats["В ожидании"] || 0, color: "bg-amber-50" },
                    { label: "В работе", value: stats["В работе"] || 0, color: "bg-blue-50" },
                    { label: "На проверке", value: stats["На проверке"] || 0, color: "bg-purple-50" },
                    { label: "Исправлено", value: stats["Исправлено"] || 0, color: "bg-green-50" },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`text-center p-4 ${stat.color} rounded-xl transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4 duration-600`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div
                        className="text-2xl font-bold text-gray-600 animate-in zoom-in-50 duration-400"
                        style={{ animationDelay: `${index * 150 + 200}ms` }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-sm text-gray-600 animate-in fade-in duration-400"
                        style={{ animationDelay: `${index * 150 + 300}ms` }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Фильтры */}
              {showFiltersBlock && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Фильтры</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${filtersExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {filtersExpanded && (
                    <div className="mt-4 grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="animate-in slide-in-from-left-4 duration-400">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Серийный номер"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div
                        className="animate-in slide-in-from-right-4 duration-400"
                        style={{ animationDelay: "100ms" }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
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
              )}
            </div>
          </div>
        )}

        {/* Список рекламаций */}
        {showCards && (
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-400">
                  <AlertTriangle className="w-8 h-8 text-gray-300" />
                </div>
                <p
                  className="text-gray-500 font-medium text-lg animate-in fade-in duration-400"
                  style={{ animationDelay: "200ms" }}
                >
                  {complaints.length === 0 ? "Рекламации отсутствуют" : "Ничего не найдено"}
                </p>
                <p
                  className="text-gray-400 text-sm mt-2 animate-in fade-in duration-400"
                  style={{ animationDelay: "400ms" }}
                >
                  {complaints.length === 0 ? "Создайте первую рекламацию" : "Попробуйте изменить фильтры"}
                </p>
              </div>
            ) : (
              filteredComplaints.slice(0, visibleCards).map((complaint, index) => (
                <div
                  key={complaint.id}
                  className="animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ComplaintCard
                    complaint={complaint}
                    isExpanded={expandedCards.has(complaint.id)}
                    onExpand={toggleExpanded}
                    onImageClick={openImageViewer}
                    role={role}
                    onStatusUpdate={updateStatus}
                  />
                </div>
              ))
            )}

            {/* Показываем скелетоны для еще не загруженных карточек */}
            {visibleCards < filteredComplaints.length && (
              <>
                {[...Array(Math.min(3, filteredComplaints.length - visibleCards))].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="animate-in fade-in duration-300"
                    style={{ animationDelay: `${(visibleCards + index) * 100}ms` }}
                  >
                    <CardSkeleton />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
