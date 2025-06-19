"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Calendar,
  Package,
  Building2,
  Hash,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react"
import api from "../api/axios"
import RequestList from "../components/RequestList"

// Красивая анимация загрузки для страницы заявок
function LoadingAnimation({ stage }) {
  const stages = [
    "Инициализация системы...",
    "Загрузка компонентов...",
    "Подготовка формы...",
    "Настройка интерфейса...",
    "Финализация...",
  ]

  return (
    <div className="fixed inset-0 from-slate-50 via-blue-50 to-purple-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Основная анимация */}
        <div className="relative mb-8">
          {/* Внешнее кольцо */}
          <div className="w-32 h-32 border-4 border-purple-200 rounded-full animate-spin">
            <div className="w-24 h-24 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full animate-spin absolute top-2 left-2"></div>
          </div>

          {/* Центральная иконка */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Плавающие точки */}
          <div
            className="absolute -top-4 -left-4 w-4 h-4 bg-blue-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute -top-4 -right-4 w-4 h-4 bg-purple-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute -bottom-4 -left-4 w-4 h-4 bg-indigo-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute -bottom-4 -right-4 w-4 h-4 bg-violet-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.6s" }}
          ></div>

          {/* Дополнительные орбитальные элементы */}
          <div
            className="absolute top-1/2 -left-8 w-3 h-3 bg-blue-300 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 -right-8 w-3 h-3 bg-purple-300 rounded-full animate-ping"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        {/* Текст с анимацией */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            Загрузка приложения
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-slate-600 animate-pulse min-h-[28px] transition-all duration-500 text-lg">
            {stages[stage] || "Подготавливаем интерфейс для вас..."}
          </p>
        </div>

        {/* Прогресс бар */}
        <div className="mt-10 w-80 mx-auto">
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-sm"
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
                i <= stage ? "bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-purple-200" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-slate-500 text-sm">
          <p>Настраиваем форму создания заявок...</p>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationPage() {
  const [project, setProject] = useState("")
  const [device, setDevice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [dateReceived, setDateReceived] = useState("")
  const [deadline, setDeadline] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isFormExpanded, setIsFormExpanded] = useState(false)

  // Состояния для анимации загрузки
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(0)
  const [showHeader, setShowHeader] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(false)

  // Эффект загрузки
  useEffect(() => {
    const loadData = async () => {
      try {
        // Этап 1: Инициализация
        setLoadingStage(1)
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Этап 2: Загрузка компонентов
        setLoadingStage(2)
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Этап 3: Подготовка формы
        setLoadingStage(3)
        setShowHeader(true)
        await new Promise((resolve) => setTimeout(resolve, 400))

        // Этап 4: Настройка интерфейса
        setLoadingStage(4)
        setShowForm(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Финализация
        setShowList(true)
        setLoading(false)
      } catch (error) {
        console.error("Ошибка загрузки:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async () => {
    setMessage("")

    if (!project || !device || !quantity || !dateReceived || !deadline) {
      setMessage("Пожалуйста, заполните все поля")
      return
    }

    if (new Date(deadline) <= new Date(dateReceived)) {
      setMessage("Срок должен быть позже даты поступления")
      return
    }

    const requestData = {
      project,
      device,
      quantity: Number.parseInt(quantity),
      date_received: dateReceived,
      deadline,
    }

    setIsLoading(true)

    try {
      const response = await api.post("/requests/", requestData)
      setMessage(`Заявка успешно создана с ID: ${response.data.request_id || response.data.id}`)
      setProject("")
      setDevice("")
      setQuantity("")
      setDateReceived("")
      setDeadline("")
      setRefreshCount((prev) => prev + 1)
    } catch (error) {
      console.error(error)
      const errMsg = error.response?.data?.detail || "Произошла ошибка при отправке"
      setMessage(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleForm = () => {
    setIsFormExpanded(!isFormExpanded)
  }

  const isSuccess = message && !message.includes("ошибка") && !message.includes("заполните")
  const isError = message && (message.includes("ошибка") || message.includes("заполните") || message.includes("позже"))

  if (loading) {
    return <LoadingAnimation stage={loadingStage} />
  }

  return (
    <div className="min-l-screen from-slate-50 via-blue-50 to-indigo-100 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto p-6">
        {/* Заголовок */}
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 animate-in slide-in-from-top-4 duration-700"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Просмотр и создание заявок
            </h1>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Форма создания заявки */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="animate-in slide-in-from-left-4 duration-700"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Заголовок формы с кнопкой сворачивания */}
                <div
                  className="flex items-center justify-between p-6 cursor-pointer border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
                  onClick={toggleForm}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-in zoom-in-50 duration-500">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Новая заявка</h2>
                  </div>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label={isFormExpanded ? "Свернуть форму" : "Развернуть форму"}
                  >
                    {isFormExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Содержимое формы */}
                <AnimatePresence initial={false}>
                  {isFormExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-3">
                        {/* Сообщения */}
                        <AnimatePresence>
                          {message && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                                isSuccess
                                  ? "bg-green-50 border border-green-200"
                                  : isError
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-blue-50 border border-blue-200"
                              }`}
                            >
                              {isSuccess ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : isError ? (
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  isSuccess ? "text-green-700" : isError ? "text-red-700" : "text-blue-700"
                                }`}
                              >
                                {message}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-5">
                          {/* Проект */}
                          <div
                            className="animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "100ms" }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Название проекта</label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                                placeholder="Введите название проекта"
                                value={project}
                                onChange={(e) => setProject(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          {/* Устройство */}
                          <div
                            className="animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "200ms" }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Название устройства</label>
                            <div className="relative">
                              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                                placeholder="Введите название устройства"
                                value={device}
                                onChange={(e) => setDevice(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          {/* Количество */}
                          <div
                            className="animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "300ms" }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Количество</label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                                type="number"
                                min="1"
                                placeholder="Введите количество"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          {/* Дата поступления */}
                          <div
                            className="animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "400ms" }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Дата поступления</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                                type="date"
                                value={dateReceived}
                                onChange={(e) => setDateReceived(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          {/* Срок исполнения */}
                          <div
                            className="animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "500ms" }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Срок исполнения</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          {/* Кнопка отправки */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: "600ms" }}
                            onClick={handleSubmit}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Отправка...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                <span>Добавить заявку</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Список заявок */}
          {showList && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="animate-in slide-in-from-right-4 duration-700"
            >
              <RequestList refresh={refreshCount} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
