"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

const CreatedRequestsTable = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCreatedRequests = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await api.get("/requests-list/?status=Создан")
        setRequests(res.data)
      } catch (err) {
        console.error("Ошибка при загрузке заявок:", err)
        setError("Все заявки приняты")
      } finally {
        setLoading(false)
      }
    }

    fetchCreatedRequests()
  }, [])

  const handleApprove = async (requestId) => {
    setUpdating((prev) => ({ ...prev, [requestId]: true }))

    try {
      // переходим на другую страницу
      navigate(`/requests/${requestId}/receive`)
    } catch (error) {
      console.error("Ошибка при оприходовании заявки:", error)
      alert("Не удалось оприходовать заявку")
    } finally {
      setUpdating((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  // Skeleton loader component
  const SkeletonRow = ({ index }) => (
    <tr className="border-b border-slate-50 animate-pulse">
      <td className="py-4 px-3 sm:px-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-slate-200 rounded-lg mr-3"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
      </td>
      <td className="py-4 px-3 sm:px-6 hidden sm:table-cell">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </td>
      <td className="py-4 px-3 sm:px-6 hidden md:table-cell">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
      </td>
      <td className="py-4 px-3 sm:px-6">
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
      </td>
      <td className="py-4 px-3 sm:px-6 hidden lg:table-cell">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </td>
      <td className="py-4 px-3 sm:px-6 hidden lg:table-cell">
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </td>
      <td className="py-4 px-3 sm:px-6 hidden sm:table-cell">
        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
      </td>
      <td className="py-4 px-3 sm:px-6">
        <div className="h-9 bg-slate-200 rounded-xl w-24"></div>
      </td>
    </tr>
  )

  if (loading) {
    return (
      <div className="-mx-3 sm:-mx-6 -mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Проект
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Устройство
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Кол-во
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Получение
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Дедлайн
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Статус
                </th>
                <th className="text-left py-4 px-3 sm:px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} index={index} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200"></div>
            <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-3 text-slate-600 font-medium text-sm">Загружаем заявки...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Отличная работа!</h3>
        <p className="text-slate-600 text-center max-w-sm px-4">{error}</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Пока пусто</h3>
        <p className="text-slate-500 text-center max-w-sm px-4">Заявки со статусом "Создан" не найдены</p>
      </div>
    )
  }

  return (
    <div className="-mx-3 sm:-mx-6 -mb-6 pb-6">
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4 px-3">
        {requests.map((req, index) => (
          <div
            key={req.request_id}
            className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all duration-200 animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                  {req.request_id.toString().slice(-2)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">#{req.request_id}</div>
                  <div className="text-xs text-slate-500">{req.project}</div>
                </div>
              </div>
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-1.5 animate-pulse"></div>
                {req.status}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Устройство:</span>
                <span className="text-sm font-medium text-slate-700">{req.device}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Количество:</span>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
                  {req.quantity} шт.
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Дедлайн:</span>
                <span className="text-sm font-medium text-slate-700">{req.deadline}</span>
              </div>
            </div>

            <button
              onClick={() => handleApprove(req.request_id)}
              disabled={updating[req.request_id]}
              className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform ${
                updating[req.request_id]
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
              }`}
            >
              {updating[req.request_id] ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Переход...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Оприходовать
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Проект
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Устройство
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Количество
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                Получение
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                Дедлайн
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Действие
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr
                key={req.request_id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-all duration-200 group animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                      {req.request_id.toString().slice(-2)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">#{req.request_id}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-slate-900 text-sm">{req.project}</div>
                </td>
                <td className="py-4 px-6 hidden md:table-cell">
                  <div className="text-slate-700 text-sm font-medium">{req.device}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    {req.quantity} шт.
                  </div>
                </td>
                <td className="py-4 px-6 hidden lg:table-cell">
                  <div className="text-slate-600 text-sm">{req.date_received}</div>
                </td>
                <td className="py-4 px-6 hidden lg:table-cell">
                  <div className="text-slate-600 text-sm font-medium">{req.deadline}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                    {req.status}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleApprove(req.request_id)}
                    disabled={updating[req.request_id]}
                    className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform ${
                      updating[req.request_id]
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed scale-95"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    }`}
                  >
                    {updating[req.request_id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Переход...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Оприходовать
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CreatedRequestsTable
