"use client"
import { useEffect, useState } from "react"
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import CreatedRequestsTable from "../components/CreatedRequestsTable"

// Красивая анимация загрузки для страницы заявок
function LoadingAnimation({ stage }) {
  const stages = [
    "Подключение к серверу...",
    "Загрузка заявок...",
    "Подготовка интерфейса...",
    "Обработка данных...",
    "Финализация...",
  ]

  return (
    <div className="fixed inset-0 from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Основная анимация */}
        <div className="relative mb-8">
          {/* Внешнее кольцо */}
          <div className="w-32 h-32 border-4 border-blue-200 rounded-full animate-spin">
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-2 left-2"></div>
          </div>

          {/* Центральная иконка */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Плавающие точки - увеличены и размещены дальше */}
          <div
            className="absolute -top-4 -left-4 w-4 h-4 bg-blue-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute -top-4 -right-4 w-4 h-4 bg-indigo-400 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute -bottom-4 -left-4 w-4 h-4 bg-blue-300 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute -bottom-4 -right-4 w-4 h-4 bg-indigo-300 rounded-full animate-bounce shadow-md"
            style={{ animationDelay: "0.6s" }}
          ></div>

          {/* Дополнительные орбитальные элементы */}
          <div
            className="absolute top-1/2 -left-8 w-3 h-3 bg-blue-200 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 -right-8 w-3 h-3 bg-indigo-200 rounded-full animate-ping"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        {/* Текст с анимацией */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 animate-pulse">Загрузка заявок</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-slate-600 animate-pulse min-h-[28px] transition-all duration-500 text-lg">
            {stages[stage] || "Подготавливаем данные для вас..."}
          </p>
        </div>

        {/* Прогресс бар - увеличен */}
        <div className="mt-10 w-80 mx-auto">
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(stage / 4) * 100}%` }}
            ></div>
          </div>
          <div className="mt-3 text-base text-slate-500 font-medium">{Math.round((stage / 4) * 100)}% завершено</div>
        </div>

        {/* Этапы загрузки - увеличены */}
        <div className="mt-8 flex justify-center space-x-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                i <= stage ? "bg-blue-500 scale-125 shadow-blue-200" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-slate-500 text-sm">
          <p>Пожалуйста, подождите...</p>
        </div>
      </div>
    </div>
  )
}

export default function Registration() {
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState(0)
  const [showHeader, setShowHeader] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Этап 1: Подключение
        setLoadingStage(1)
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Этап 2: Загрузка данных
        setLoadingStage(2)
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Этап 3: Подготовка интерфейса
        setLoadingStage(3)
        setShowHeader(true)
        await new Promise((resolve) => setTimeout(resolve, 400))

        // Этап 4: Обработка данных
        setLoadingStage(4)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Финализация
        setShowContent(true)
        setLoading(false)
      } catch (error) {
        console.error("Ошибка загрузки:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <LoadingAnimation stage={loadingStage} />
  }

  return (
    <div className="min-h-screen from-slate-50 to-slate-100 animate-in fade-in duration-500">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        {showHeader && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-in zoom-in-50 duration-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: "200ms" }}>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Заявки</h1>
                <p className="text-slate-600 text-lg">Список заявок готовых к принятию</p>
              </div>
            </div>
          </div>
        )}

        {/* Основной контент */}
        {showContent && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
            <div className="p-6 animate-in fade-in duration-500" style={{ animationDelay: "200ms" }}>
              <CreatedRequestsTable />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
