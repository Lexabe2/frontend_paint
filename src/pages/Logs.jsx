"use client"

import React from "react"

import { useEffect, useState, useRef, useMemo } from "react"
import {
  RefreshCcw,
  Download,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Info,
  Bug,
  ChevronDown,
  ChevronUp,
  Calendar,
  Copy,
} from "lucide-react"
import api from "../api/axios"

// Улучшенный парсер логов для обработки разных форматов
const parseLogLine = (line) => {
  // Убираем \n в конце и лишние пробелы
  const cleanLine = line.trim()

  if (!cleanLine) return null

  // Базовый паттерн: LEVEL TIMESTAMP остальное
  const basicRegex = /^(\w+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s+(.+)$/
  const basicMatch = cleanLine.match(basicRegex)

  if (!basicMatch) {
    return {
      level: "UNKNOWN",
      timestamp: "",
      module: "",
      component: "",
      message: cleanLine,
      raw: cleanLine,
    }
  }

  const [, level, timestamp, rest] = basicMatch

  // Пытаемся разобрать остальную часть
  // Формат может быть: module component message
  // или: module.submodule component message
  const parts = rest.split(/\s+/)

  let module = ""
  let component = ""
  let message = ""
  let httpRequest = null
  let statusCode = null
  let responseSize = null

  if (parts.length >= 2) {
    module = parts[0] || ""
    component = parts[1] || ""

    // Остальное - это сообщение
    const messageParts = parts.slice(2)
    message = messageParts.join(" ")

    // Проверяем, есть ли HTTP запрос в кавычках
    const httpMatch = message.match(/"([^"]+)"/)
    if (httpMatch) {
      httpRequest = httpMatch[1]

      // Ищем статус код и размер после HTTP запроса
      const afterHttp = message.substring(message.indexOf(httpMatch[0]) + httpMatch[0].length).trim()
      const statusMatch = afterHttp.match(/^(\d+)\s*(\d+)?/)
      if (statusMatch) {
        statusCode = statusMatch[1]
        responseSize = statusMatch[2] || null
      }
    }
  } else {
    // Если частей меньше 2, то всё остальное - сообщение
    message = rest
  }

  // Извлечение деталей из квадратных скобок [key=value, key=value]
  const details = {}
  const detailsRegex = /\[([^\]]+)\]/g
  let detailsMatch

  while ((detailsMatch = detailsRegex.exec(message)) !== null) {
    const detailText = detailsMatch[1]
    // Разбиваем по запятым и обрабатываем каждую пару key=value
    const detailPairs = detailText.split(",").map((pair) => pair.trim())

    detailPairs.forEach((pair) => {
      const equalIndex = pair.indexOf("=")
      if (equalIndex > 0) {
        const key = pair.substring(0, equalIndex).trim()
        const value = pair.substring(equalIndex + 1).trim()
        details[key] = value
      }
    })
  }

  return {
    level,
    timestamp,
    module,
    component,
    message: message.trim(),
    details,
    httpRequest,
    statusCode,
    responseSize,
    raw: cleanLine,
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [parsedLogs, setParsedLogs] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(10) // секунды
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedLogs, setExpandedLogs] = useState({})
  const [filters, setFilters] = useState({
    INFO: true,
    ERROR: true,
    WARNING: true,
    DEBUG: true,
  })
  const [moduleFilters, setModuleFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const logRef = useRef(null)
  const intervalRef = useRef(null)

  // Загрузка логов
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get("logs/")
      if (response.data.logs) {
        setLogs(response.data.logs)

        // Парсинг логов
        const parsed = response.data.logs.map(parseLogLine)
        setParsedLogs(parsed)

        // Автоматическое определение доступных модулей для фильтрации
        const modules = {}
        parsed.forEach((log) => {
          if (log.module) {
            modules[log.module] = true
          }
        })
        setModuleFilters((prevModules) => ({
          ...prevModules,
          ...Object.fromEntries(Object.keys(modules).map((module) => [module, prevModules[module] !== false])),
        }))

        setError(null)
      } else if (response.data.error) {
        setError(response.data.error)
      }
    } catch (err) {
      setError(err.toString())
    }
    setLoading(false)
  }

  // Инициализация и автообновление
  useEffect(() => {
    fetchLogs()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Управление автообновлением
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, refreshInterval * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval])

  // Автоскролл при обновлении логов
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [parsedLogs])

  // Сброс индикатора копирования
  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => {
        setCopiedIndex(null)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [copiedIndex])

  // Фильтрация и поиск логов
  const filteredLogs = useMemo(() => {
    return parsedLogs.filter((log) => {
      // Фильтр по уровню
      if (!filters[log.level]) return false

      // Фильтр по модулю
      if (log.module && moduleFilters[log.module] === false) return false

      // Поиск
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return log.raw.toLowerCase().includes(searchLower)
      }

      return true
    })
  }, [parsedLogs, filters, moduleFilters, searchTerm])

  // Статистика логов
  const logStats = useMemo(() => {
    const stats = {
      INFO: 0,
      ERROR: 0,
      WARNING: 0,
      DEBUG: 0,
      UNKNOWN: 0,
      total: parsedLogs.length,
    }

    parsedLogs.forEach((log) => {
      if (stats[log.level] !== undefined) {
        stats[log.level]++
      } else {
        stats.UNKNOWN++
      }
    })

    return stats
  }, [parsedLogs])

  // Экспорт логов
  const exportLogs = () => {
    const content = logs.join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Копирование строки лога
  const copyLog = (index, text) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
  }

  // Переключение развернутого состояния лога
  const toggleLogExpand = (index) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Цвета для разных уровней логов
  const getLevelColor = (level) => {
    switch (level) {
      case "ERROR":
        return "text-red-400 border-red-500"
      case "WARNING":
        return "text-yellow-300 border-yellow-400"
      case "DEBUG":
        return "text-blue-300 border-blue-400"
      case "INFO":
        return "text-green-300 border-green-400"
      default:
        return "text-gray-300 border-gray-500"
    }
  }

  // Иконка для уровня лога
  const getLevelIcon = (level) => {
    switch (level) {
      case "ERROR":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-yellow-300" />
      case "DEBUG":
        return <Bug className="w-4 h-4 text-blue-300" />
      case "INFO":
        return <Info className="w-4 h-4 text-green-300" />
      default:
        return <Info className="w-4 h-4 text-gray-300" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800">
        {/* Заголовок и статистика */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Серверные логи</h1>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">Всего: {logStats.total}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-300 border border-green-800/50">
                INFO: {logStats.INFO}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-800/50">
                ERROR: {logStats.ERROR}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-300 border border-yellow-800/50">
                WARNING: {logStats.WARNING}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-800/50">
                DEBUG: {logStats.DEBUG}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1 text-sm bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 transition"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1 text-sm px-3 py-2 rounded transition ${
                autoRefresh
                  ? "bg-green-800/50 text-green-300 hover:bg-green-700/50"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              {autoRefresh ? `Авто (${refreshInterval}с)` : "Авто выкл"}
            </button>

            {autoRefresh && (
              <div className="flex items-center gap-1 bg-gray-800 rounded">
                <button
                  onClick={() => setRefreshInterval((prev) => Math.max(5, prev - 5))}
                  className="px-2 py-2 text-gray-400 hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-sm text-white">{refreshInterval}с</span>
                <button
                  onClick={() => setRefreshInterval((prev) => prev + 5)}
                  className="px-2 py-2 text-gray-400 hover:text-white"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 text-sm px-3 py-2 rounded transition ${
                showFilters
                  ? "bg-blue-800/50 text-blue-300 hover:bg-blue-700/50"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <Filter className="w-4 h-4" />
              Фильтры
            </button>

            <button
              onClick={exportLogs}
              className="flex items-center gap-1 text-sm bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 transition"
            >
              <Download className="w-4 h-4" />
              Экспорт
            </button>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск в логах..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Расширенные фильтры */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Уровень логов</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(filters).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilters((prev) => ({ ...prev, [level]: !prev[level] }))}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${
                        filters[level]
                          ? `bg-${level === "ERROR" ? "red" : level === "WARNING" ? "yellow" : level === "DEBUG" ? "blue" : "green"}-900/30 text-${level === "ERROR" ? "red" : level === "WARNING" ? "yellow" : level === "DEBUG" ? "blue" : "green"}-300 border border-${level === "ERROR" ? "red" : level === "WARNING" ? "yellow" : level === "DEBUG" ? "blue" : "green"}-800/50`
                          : "bg-gray-700 text-gray-400 border border-gray-600"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(moduleFilters).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Модули</h3>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {Object.keys(moduleFilters).map((module) => (
                      <button
                        key={module}
                        onClick={() => setModuleFilters((prev) => ({ ...prev, [module]: !prev[module] }))}
                        className={`text-xs px-3 py-1.5 rounded-full transition ${
                          moduleFilters[module] !== false
                            ? "bg-gray-700/70 text-gray-300 border border-gray-600"
                            : "bg-gray-800 text-gray-500 border border-gray-700"
                        }`}
                      >
                        {module}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Сообщение об ошибке */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300">
            <p className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Контейнер логов */}
        <div
          ref={logRef}
          className="bg-gray-950 rounded-lg p-4 h-[600px] overflow-y-auto shadow-inner border border-gray-800 font-mono text-sm"
        >
          {filteredLogs.length === 0 && !error && (
            <p className="text-gray-400 italic text-center py-10">
              {searchTerm || Object.values(filters).some((v) => !v)
                ? "Нет логов, соответствующих фильтрам"
                : "Логи пока пусты..."}
            </p>
          )}

          {filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`mb-1 border-l-2 pl-2 ${getLevelColor(log.level)} hover:bg-gray-900/50 rounded-r transition group`}
            >
              {/* Заголовок лога с возможностью развернуть */}
              <div className="flex items-start cursor-pointer py-1" onClick={() => toggleLogExpand(idx)}>
                <div className="mr-2 mt-1">{getLevelIcon(log.level)}</div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                    {log.module && (
                      <span className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{log.module}</span>
                    )}
                    {log.component && (
                      <span className="bg-gray-800/50 px-1.5 py-0.5 rounded text-gray-400">{log.component}</span>
                    )}
                  </div>
                  <div className={`${getLevelColor(log.level).split(" ")[0]} truncate`}>
                    {log.httpRequest ? (
                      <span>
                        <span className="text-blue-300">{log.httpRequest}</span>
                        {log.statusCode && (
                          <span
                            className={`ml-2 ${Number.parseInt(log.statusCode) >= 400 ? "text-red-300" : Number.parseInt(log.statusCode) >= 300 ? "text-yellow-300" : "text-green-300"}`}
                          >
                            [{log.statusCode}]
                          </span>
                        )}
                      </span>
                    ) : (
                      log.message
                    )}
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyLog(idx, log.raw)
                    }}
                    className="p-1 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition"
                    title="Копировать"
                  >
                    {copiedIndex === idx ? (
                      <span className="text-green-400 text-xs">Скопировано</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-300">
                    {expandedLogs[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Развернутая информация */}
              {expandedLogs[idx] && (
                <div className="mt-1 pl-6 pb-2 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                      <h4 className="text-gray-400 mb-1">Основная информация</h4>
                      <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
                        <span className="text-gray-500">Уровень:</span>
                        <span className={getLevelColor(log.level).split(" ")[0]}>{log.level}</span>

                        <span className="text-gray-500">Время:</span>
                        <span className="text-gray-300">{log.timestamp}</span>

                        <span className="text-gray-500">Модуль:</span>
                        <span className="text-gray-300">{log.module || "-"}</span>

                        <span className="text-gray-500">Компонент:</span>
                        <span className="text-gray-300">{log.component || "-"}</span>
                        {log.httpRequest && (
                          <>
                            <span className="text-gray-500">HTTP:</span>
                            <span className="text-blue-300">{log.httpRequest}</span>
                          </>
                        )}

                        {log.statusCode && (
                          <>
                            <span className="text-gray-500">Статус:</span>
                            <span
                              className={`${Number.parseInt(log.statusCode) >= 400 ? "text-red-300" : Number.parseInt(log.statusCode) >= 300 ? "text-yellow-300" : "text-green-300"}`}
                            >
                              {log.statusCode}
                            </span>
                          </>
                        )}

                        {log.responseSize && (
                          <>
                            <span className="text-gray-500">Размер:</span>
                            <span className="text-gray-300">{log.responseSize} байт</span>
                          </>
                        )}
                      </div>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                        <h4 className="text-gray-400 mb-1">Детали</h4>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
                          {Object.entries(log.details).map(([key, value]) => (
                            <React.Fragment key={key}>
                              <span className="text-gray-500">{key}:</span>
                              <span className="text-gray-300">{value}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                    <h4 className="text-gray-400 mb-1">Сообщение</h4>
                    <div className="text-gray-300 whitespace-pre-wrap break-all">{log.message}</div>
                  </div>

                  <div className="mt-2 bg-gray-900/30 p-2 rounded border border-gray-800/50">
                    <h4 className="text-gray-500 mb-1">Исходная строка</h4>
                    <div className="text-gray-400 whitespace-pre-wrap break-all">{log.raw}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
