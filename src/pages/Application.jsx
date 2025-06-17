"use client"
import React from 'react';
import { useState } from "react"
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
} from "lucide-react"
import api from "../api/axios"
import RequestList from "../components/RequestList"

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

  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Заголовок */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Просмотр и создание заявок
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {/* Форма создания заявки */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Заголовок формы с кнопкой сворачивания */}
              <div
                className="flex items-center justify-between p-6 cursor-pointer border-b border-gray-100"
                onClick={toggleForm}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                        <div>
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
                        <div>
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
                        <div>
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
                        <div>
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
                        <div>
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
                          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Список заявок */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <RequestList refresh={refreshCount} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
