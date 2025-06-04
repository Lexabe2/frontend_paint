"use client"

import { useEffect, useState } from "react"
import { Package, Calendar, Clock, Hash, Monitor, Target, ChevronDown, ChevronUp } from "lucide-react"
import { useParams } from "react-router-dom"
import api from "../api/axios"

const RegistrationWork = () => {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await api.get(`/requests-work/${id}/`)
        setRequest(res.data)
      } catch (err) {
        console.error("Ошибка при загрузке заявки:", err)
        setError("Не удалось загрузить данные заявки")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRequest()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded-lg w-80 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          {/* Main Content Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Request Details Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded mt-0.5 animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded mt-0.5 animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Form Placeholder Skeleton */}
              <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg">
          <div className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Ошибка загрузки</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg">
          <div className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-gray-100 p-3">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Заявка не найдена</h3>
                <p className="text-sm text-gray-500 mt-1">Запрашиваемая заявка не существует или была удалена</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "в обработке":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "завершено":
        return "bg-green-100 text-green-800 border-green-200"
      case "отклонено":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gray-50 p-6 shadow-sm border border-gray-200">
            <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                Оприходование заявки
                </h1>
                <p className="text-gray-600 text-base">
                Просмотр и обработка заявки на получение оборудования
                </p>
            </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Информация о заявке
              </h2>
<div className="flex items-center gap-3 flex-wrap">
  {/* Номер заявки */}
  <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
    <Hash className="w-4 h-4 text-gray-500" />
    {request.request_id}
  </div>

  {/* Проект */}
  <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
    <Target className="w-4 h-4 text-gray-500" />
    {request.project}
  </div>

  {/* Кнопка раскрытия */}
  <button
    onClick={() => setIsExpanded((prev) => !prev)}
    className="p-2 rounded-full hover:bg-gray-100 transition"
    title={isExpanded ? "Свернуть" : "Развернуть"}
  >
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-gray-600" />
    ) : (
      <ChevronDown className="w-5 h-5 text-gray-600" />
    )}
  </button>
</div>

            </div>
          </div>
          {isExpanded && (
          <div className="p-6 space-y-6">
            {/* Request Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Номер заявки</p>
                    <p className="font-semibold text-gray-900">{request.request_id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Проект</p>
                    <p className="font-semibold text-gray-900">{request.project}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Устройство</p>
                    <p className="font-semibold text-gray-900">{request.device}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Количество</p>
                    <p className="font-semibold text-gray-900">{request.quantity} шт.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Дата получения</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(request.date_received).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Дедлайн</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(request.deadline).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-500" />
            </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Форма оприходования</h3>
                  <p className="text-gray-500 mt-1">Здесь будет форма оприходования устройства</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationWork
