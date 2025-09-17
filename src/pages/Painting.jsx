"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"
import ScannerInput from "../components/Skaner.jsx"
import api from "../api/axios"
import {
  Scan,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Package,
  Calendar,
  Building,
  Hash,
  Zap,
  Target,
  User,
  Clock,
  CheckSquare,
  Square,
  PaintBucket
} from "lucide-react"

export default function ScanPage({ currentUser: initialUser}) {
  const [currentUser, setCurrentUser] = useState(initialUser || null)
  const [lastCode, setLastCode] = useState(null)
  const [sn, setSn] = useState(null)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(true)
  const [localTasks, setLocalTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const work = queryParams.get("work"); // "paint"

  useEffect(() => {
    if (initialUser) return

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me/")
        setCurrentUser(res.data)
      } catch (err) {
        console.error("Не удалось загрузить пользователя", err)
        showNotification("Ошибка загрузки пользователя", "error")
      }
    }

    fetchUser()
  }, [initialUser])

  useEffect(() => {
    if (!sn) return

    const fetchTasks = async () => {
      setTasksLoading(true)
      setTasksError(null)
      try {
        const res = await api.get(`/tasks/?sn=${sn}&source=${work}`)
        const taskArray = Array.isArray(res.data) ? res.data : [res.data]
        setLocalTasks(taskArray)
      } catch (err) {
        setTasksError("Не удалось загрузить задачи")
        console.error(err)
      } finally {
        setTasksLoading(false)
      }
    }

    fetchTasks()
  }, [sn])

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleScan = async (code) => {
    try {
      setError("")
      setSn(code)
      setLastCode(code)
      const res = await api.get(`/atm/search/?code=${code}&source=paint`)
      setResult(res.data)

      if (res.data) {
        setScannerOpen(false)
        showNotification(`Устройство ${code} найдено!`)
      }
    } catch (err) {
      setResult(null)
      setError(err.response?.data?.error || "Ошибка поиска")
    }
  }

  const handleError = (err) => {
    console.error("Ошибка сканера:", err)
    setError("Не удалось распознать код")
  }

  const handleLocalToggle = (taskId) => {
    setLocalTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const newStatuses = {
            ...t.statuses,
            [currentUser.id]: !t.statuses?.[currentUser.id]
          }

          const newCompleted = Object.values(newStatuses).every(v => v)

          return {
            ...t,
            statuses: newStatuses,
            completed: newCompleted
          }
        }
        return t
      })
    )
  }

  const handleSave = async () => {
    if (!currentUser) return

    const tasksToSave = localTasks
      .filter(t => !!t.statuses?.[currentUser.id])
      .map(t => t.name)

    if (!tasksToSave.length) {
      showNotification("Выберите хотя бы одну работу", "error")
      return
    }

    try {
      setSaving(true)
      await api.post(`/tasks/?source=${work}`, {
        sn,
        tasks: tasksToSave
      })

      showNotification("Изменения успешно сохранены!")
    } catch (err) {
      console.error("Ошибка сохранения", err)
      showNotification("Не удалось сохранить изменения", "error")
    } finally {
      setSaving(false)
    }
  }

  const getCompletedTasksCount = () => {
    return localTasks.filter(t => !!t.statuses?.[currentUser?.id]).length
  }

  const getProgressPercentage = () => {
    if (!localTasks.length) return 0
    return Math.round((getCompletedTasksCount() / localTasks.length) * 100)
  }

  return (
    <div className="min-l-screen from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <PaintBucket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {work === 'paint' && "Покраска"}
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Отсканируйте серийный номер устройства для просмотра и выполнения работ
          </p>
        </motion.div>

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

        {/* Scanner Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Сканер</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setScannerOpen(!scannerOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
              >
                {scannerOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {scannerOpen ? "Скрыть" : "Показать"}
                </span>
              </motion.button>
            </div>

            <AnimatePresence>
              {scannerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ScannerInput
                      onScan={handleScan}
                      onError={handleError}
                      allowManualInput={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device Info */}
        <AnimatePresence>
          {lastCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Информация об устройстве</h2>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Серийный номер: <span className="font-mono">{lastCode}</span>
                    </span>
                  </div>

                  {result ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          <strong>S/N:</strong> {result.serial_number}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          <strong>Модель:</strong> {result.model}
                        </span>
                      </div>
                      {result.bank && (
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            <strong>Банк:</strong> {result.bank}
                          </span>
                        </div>
                      )}
                      {result.accepted_at && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            <strong>Принят:</strong> {new Date(result.accepted_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>Устройство не найдено в базе данных</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks Section */}
        {sn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Выполнение работ</h2>
                    {currentUser && (
                      <p className="text-sm text-gray-600">
                        Пользователь: <span className="font-medium">{currentUser.username}</span>
                      </p>
                    )}
                  </div>
                </div>
                {localTasks.length > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {getProgressPercentage()}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {getCompletedTasksCount()} из {localTasks.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {localTasks.length > 0 && (
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </div>
              )}

              {/* Loading State */}
              {tasksLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <p className="text-gray-600 font-medium">Загрузка задач...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {tasksError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{tasksError}</p>
                </div>
              )}

              {/* User Loading */}
              {!currentUser && !tasksLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-gray-400" />
                    <p className="text-gray-500">Загрузка пользователя...</p>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              {currentUser && localTasks.length > 0 && (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
                    <AnimatePresence>
                      {localTasks.map((task, index) => (
                        <motion.label
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 cursor-pointer transition-all duration-200 ${
                            task.completed
                              ? "bg-gray-100 text-gray-400"
                              : task.statuses?.[currentUser.id]
                              ? "bg-purple-50 hover:bg-purple-100"
                              : "hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`p-1 rounded ${
                              task.completed ? 'bg-gray-200' : 
                              task.statuses?.[currentUser.id] ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <Clock className={`w-4 h-4 ${
                                task.completed ? 'text-gray-400' : 
                                task.statuses?.[currentUser.id] ? 'text-purple-600' : 'text-gray-500'
                              }`} />
                            </div>
                            <span className={`font-medium ${
                              task.completed ? 'line-through' : ''
                            }`}>
                              {task.name}
                            </span>
                            {task.completed && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Завершено
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.statuses?.[currentUser.id] ? (
                              <CheckSquare className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                            <input
                              type="checkbox"
                              checked={!!task.statuses?.[currentUser.id]}
                              onChange={() => !task.completed && handleLocalToggle(task.id)}
                              disabled={task.completed}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
                            />
                          </div>
                        </motion.label>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={!localTasks.some(t => !!t.statuses?.[currentUser.id]) || saving}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span className="font-semibold text-lg">
                      {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </span>
                  </motion.button>
                </div>
              )}

              {/* Empty State */}
              {currentUser && !tasksLoading && localTasks.length === 0 && sn && (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Задач пока нет</h3>
                      <p className="text-gray-500">Задачи для этого устройства не найдены</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Initial State */}
        {!lastCode && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Scan className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Готов к сканированию</h3>
                <p className="text-gray-500">Отсканируйте или введите серийный номер устройства</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}