"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderPlus,
  ListTodo,
  Target,
  Sparkles
} from "lucide-react"
import api from "../api/axios"

export default function StageManager() {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newStageName, setNewStageName] = useState("")
  const [newWorkName, setNewWorkName] = useState({})
  const [deletingStage, setDeletingStage] = useState(null)
  const [deletingWork, setDeletingWork] = useState(null)
  const [addingStage, setAddingStage] = useState(false)
  const [addingWork, setAddingWork] = useState({})
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchStages()
  }, [])

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchStages = async () => {
    try {
      setLoading(true)
      const res = await api.get("/stages/")
      setStages(res.data)
    } catch (err) {
      console.error("Ошибка загрузки этапов", err)
      showNotification("Ошибка загрузки этапов", 'error')
    } finally {
      setLoading(false)
    }
  }

  // Добавить этап
  const handleAddStage = async () => {
    if (!newStageName.trim()) {
      showNotification("Введите название этапа", 'error')
      return
    }

    try {
      setAddingStage(true)
      await api.post("/stages/add/", { name: newStageName.trim() })
      setNewStageName("")
      await fetchStages()
      showNotification("Этап успешно добавлен")
    } catch (err) {
      console.error("Ошибка добавления этапа", err)
      showNotification("Ошибка добавления этапа", 'error')
    } finally {
      setAddingStage(false)
    }
  }

  // Удалить этап
  const handleDeleteStage = async (id, stageName) => {
    if (!confirm(`Вы уверены, что хотите удалить этап "${stageName}"? Все связанные работы также будут удалены.`)) {
      return
    }

    try {
      setDeletingStage(id)
      await api.delete(`/stages/${id}/delete/`)
      await fetchStages()
      showNotification("Этап успешно удален")
    } catch (err) {
      console.error("Ошибка удаления этапа", err)
      showNotification("Ошибка удаления этапа", 'error')
    } finally {
      setDeletingStage(null)
    }
  }

  // Добавить работу
  const handleAddWork = async (stageId) => {
    const workName = newWorkName[stageId]?.trim()
    if (!workName) {
      showNotification("Введите название работы", 'error')
      return
    }

    // Проверяем на дубликаты работ в этом этапе
    const stage = stages.find(s => s.id === stageId)
    const isDuplicate = stage?.works?.some(work =>
      work.name.toLowerCase().trim() === workName.toLowerCase()
    )

    if (isDuplicate) {
      showNotification("Работа с таким названием уже существует в этом этапе", 'error')
      return
    }

    try {
      setAddingWork(prev => ({ ...prev, [stageId]: true }))
      await api.post(`/stages/${stageId}/works/add/`, { name: workName })
      setNewWorkName(prev => ({ ...prev, [stageId]: "" }))
      await fetchStages()
      showNotification("Работа успешно добавлена")
    } catch (err) {
      console.error("Ошибка добавления работы", err)
      showNotification("Ошибка добавления работы", 'error')
    } finally {
      setAddingWork(prev => ({ ...prev, [stageId]: false }))
    }
  }

  // Удалить работу
  const handleDeleteWork = async (workId, workName) => {
    if (!confirm(`Вы уверены, что хотите удалить работу "${workName}"?`)) {
      return
    }

    try {
      setDeletingWork(workId)
      await api.delete(`/works/${workId}/delete/`)
      await fetchStages()
      showNotification("Работа успешно удалена")
    } catch (err) {
      console.error("Ошибка удаления работы", err)
      showNotification("Ошибка удаления работы", 'error')
    } finally {
      setDeletingWork(null)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e, action, ...args) => {
    if (e.key === 'Enter') {
      action(...args)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Загрузка этапов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-l-screen from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Управление этапами
            </h1>
          </motion.div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Создавайте и управляйте этапами работ для эффективной организации процессов
          </p>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm border ${
                notification.type === 'success'
                  ? 'bg-green-50/90 border-green-200 text-green-800'
                  : 'bg-red-50/90 border-red-200 text-red-800'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Stage Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FolderPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Добавить новый этап</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Введите название этапа..."
                value={newStageName}
                onChange={e => setNewStageName(e.target.value)}
                onKeyPress={e => handleKeyPress(e, handleAddStage)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                disabled={addingStage}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddStage}
              disabled={addingStage || !newStageName.trim()}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {addingStage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span className="font-medium">
                {addingStage ? 'Добавление...' : 'Добавить этап'}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stages List */}
        <div className="space-y-6">
          <AnimatePresence>
            {stages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <ListTodo className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Этапов пока нет</h3>
                    <p className="text-gray-500">Создайте первый этап для начала работы</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              stages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Stage Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{stage.name}</h3>
                          <p className="text-sm text-gray-500">
                            {stage.works?.length || 0} {stage.works?.length === 1 ? 'работа' : 'работ'}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteStage(stage.id, stage.name)}
                        disabled={deletingStage === stage.id}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {deletingStage === stage.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">Удалить этап</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Add Work Section */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Добавить работу</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Введите название работы..."
                          value={newWorkName[stage.id] || ""}
                          onChange={e => setNewWorkName(prev => ({ ...prev, [stage.id]: e.target.value }))}
                          onKeyPress={e => handleKeyPress(e, handleAddWork, stage.id)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          disabled={addingWork[stage.id]}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddWork(stage.id)}
                          disabled={addingWork[stage.id] || !newWorkName[stage.id]?.trim()}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingWork[stage.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {addingWork[stage.id] ? 'Добавление...' : 'Добавить'}
                          </span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Works List */}
                    {stage.works && stage.works.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-3">
                          <ListTodo className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Список работ</span>
                        </div>
                        <AnimatePresence>
                          {stage.works.map((work, workIndex) => (
                            <motion.div
                              key={work.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: workIndex * 0.05 }}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-800 font-medium">{work.name}</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteWork(work.id, work.name)}
                                disabled={deletingWork === work.id}
                                className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              >
                                {deletingWork === work.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                <span className="text-xs font-medium">Удалить</span>
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="p-3 bg-gray-100 rounded-full">
                            <ListTodo className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-sm">Работ в этом этапе пока нет</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}