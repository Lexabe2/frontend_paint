"use client"
import React from 'react';
import { useState, useEffect, useRef } from "react"
import Header from '../components/Header';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  LineChart,
  MoreHorizontal,
  Plus,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"

export default function Page() {
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const chartRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Имитация данных для графика
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")

      // Очистка холста
      ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

      // Градиент для линии
      const gradient = ctx.createLinearGradient(0, 0, 0, 150)
      gradient.addColorStop(0, "rgba(56, 189, 248, 0.6)")
      gradient.addColorStop(1, "rgba(56, 189, 248, 0)")

      // Данные для графика
      const data = [20, 40, 30, 70, 50, 60, 80, 90, 85, 80, 70]
      const width = chartRef.current.width
      const height = chartRef.current.height
      const step = width / (data.length - 1)

      // Рисуем линию
      ctx.beginPath()
      ctx.moveTo(0, height - (data[0] / 100) * height)

      for (let i = 1; i < data.length; i++) {
        ctx.lineTo(i * step, height - (data[i] / 100) * height)
      }

      ctx.strokeStyle = "#0ea5e9"
      ctx.lineWidth = 3
      ctx.stroke()

      // Заливка под линией
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.fillStyle = gradient
      ctx.fill()

      // Точки на линии
      for (let i = 0; i < data.length; i++) {
        ctx.beginPath()
        ctx.arc(i * step, height - (data[i] / 100) * height, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#0ea5e9"
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Градиентный фон для верхней части страницы */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 h-[40vh] -z-10"></div>
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-5 -z-10"></div>

      {/* Декоративные элементы фона */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-80 h-80 rounded-full bg-pink-400 opacity-10 blur-[100px]"></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 pt-32 pb-12 relative z-10">
        {/* Приветствие и статистика */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">Добрый день, Иван!</h1>
            <p className="text-blue-100 opacity-90">Вот ваша статистика на сегодня, 20 мая</p>
          </div>

          <div className="flex space-x-2 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
            {["overview", "projects", "tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-white hover:bg-white/10"
                }`}
              >
                {tab === "overview" ? "Обзор" : tab === "projects" ? "Проекты" : "Задачи"}
              </button>
            ))}
          </div>
        </div>

        {/* Карточки статистики */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Активные проекты",
              value: "12",
              icon: FileText,
              color: "from-blue-500 to-blue-600",
              change: "+2",
              trend: "up",
            },
            {
              title: "Завершенные задачи",
              value: "48",
              icon: CheckCircle2,
              color: "from-green-500 to-green-600",
              change: "+5",
              trend: "up",
            },
            {
              title: "Часы работы",
              value: "164",
              icon: Clock,
              color: "from-amber-500 to-amber-600",
              change: "+12",
              trend: "up",
            },
            {
              title: "Команда",
              value: "6",
              icon: Users,
              color: "from-purple-500 to-purple-600",
              change: "+1",
              trend: "up",
            },
          ].map((card, index) => (
            <div
              key={index}
              className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Градиентная полоса сверху */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{card.value}</h3>
                    <div
                      className={`flex items-center mt-1 text-xs ${card.trend === "up" ? "text-green-600" : "text-red-600"}`}
                    >
                      <TrendingUp className={`w-3 h-3 mr-1 ${card.trend === "up" ? "" : "transform rotate-180"}`} />
                      <span>{card.change} с прошлой недели</span>
                    </div>
                  </div>

                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <card.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Интерактивный эффект при наведении */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Основной контент в две колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* График активности - занимает 2 колонки */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Активность проекта</h2>
                <p className="text-gray-500 text-sm">Последние 10 дней</p>
              </div>

              <div className="flex space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <LineChart className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <canvas ref={chartRef} width="800" height="200" className="w-full h-full"></canvas>
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-gray-500 text-xs">Всего задач</p>
                <p className="text-lg font-bold text-gray-800">248</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">Завершено</p>
                <p className="text-lg font-bold text-gray-800">187</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">В процессе</p>
                <p className="text-lg font-bold text-gray-800">61</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">Эффективность</p>
                <p className="text-lg font-bold text-green-600">75%</p>
              </div>
            </div>
          </div>

          {/* Предстоящие события */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Предстоящие события</h2>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { title: "Встреча с клиентом", time: "Сегодня, 14:00", color: "bg-blue-500" },
                { title: "Дедлайн проекта", time: "Завтра, 18:00", color: "bg-red-500" },
                { title: "Командный созвон", time: "22 мая, 11:30", color: "bg-green-500" },
                { title: "Презентация", time: "24 мая, 15:00", color: "bg-purple-500" },
              ].map((event, index) => (
                <div key={index} className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${event.color} mt-1.5 mr-3`}></div>
                  <div>
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Добавить событие
            </button>
          </div>
        </div>

        {/* Проекты и команда */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Проекты - занимает 2 колонки */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Активные проекты</h2>
              <button className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm transition-colors">
                Все проекты
              </button>
            </div>

            <div className="space-y-4">
              {[
                { title: "Редизайн сайта", progress: 75, color: "from-blue-500 to-blue-600" },
                { title: "Мобильное приложение", progress: 40, color: "from-purple-500 to-purple-600" },
                { title: "Маркетинговая кампания", progress: 90, color: "from-green-500 to-green-600" },
              ].map((project, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">{project.title}</h3>
                    <button className="p-1.5 rounded-lg hover:bg-white text-gray-500 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center mb-2">
                    <div className="flex -space-x-2 mr-4">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium text-xs border-2 border-white"
                        >
                          {["ИП", "МС", "АК"][i]}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">3 участника</div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Прогресс</span>
                      <span className="font-medium text-gray-800">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${project.color} transition-all duration-500 ease-out`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Команда */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Команда</h2>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Users className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: "Иван Петров", role: "Менеджер проекта", avatar: "ИП", status: "online" },
                { name: "Мария Смирнова", role: "Дизайнер", avatar: "МС", status: "online" },
                { name: "Алексей Козлов", role: "Разработчик", avatar: "АК", status: "offline" },
                { name: "Елена Васильева", role: "Маркетолог", avatar: "ЕВ", status: "online" },
              ].map((member, index) => (
                <div key={index} className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium">
                      {member.avatar}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === "online" ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                  </div>

                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>

                  <button className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Добавить участника
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
