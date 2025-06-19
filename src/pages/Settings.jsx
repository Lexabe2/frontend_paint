"use client"
import React from 'react';
import { useEffect, useState } from "react"
import { Server, Monitor, Globe, Code, User, Cpu, HardDrive, Wifi } from "lucide-react"

// Мок API для демонстрации
const api = {
  get: async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      data: {
        hostname: "web-server-01",
        ip_address: "192.168.1.100",
        os: "Ubuntu Linux",
        os_version: "22.04.3 LTS",
        python_version: "3.11.5",
        server_software: "nginx/1.22.1",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }
  },
}

const Settings = () => {
  const [info, setInfo] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/server-info/")
        setInfo(response.data)
      } catch (err) {
        console.error("Ошибка при получении данных:", err)
        setError("Не удалось получить информацию о сервере.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const serverData = [
    {
      icon: <Server className="w-5 h-5" />,
      label: "Имя хоста",
      value: info?.hostname,
      color: "text-blue-600",
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      label: "IP-адрес",
      value: info?.ip_address,
      color: "text-green-600",
    },
    {
      icon: <Monitor className="w-5 h-5" />,
      label: "Операционная система",
      value: info?.os,
      color: "text-purple-600",
    },
    {
      icon: <HardDrive className="w-5 h-5" />,
      label: "Версия ОС",
      value: info?.os_version,
      color: "text-orange-600",
    },
    {
      icon: <Code className="w-5 h-5" />,
      label: "Python",
      value: info?.python_version,
      color: "text-yellow-600",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      label: "Веб-сервер",
      value: info?.server_software,
      color: "text-red-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка информации о сервере...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ошибка подключения</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-l-screen from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Информация о сервере</h1>
          <p className="text-gray-600 text-lg">Системные характеристики и конфигурация</p>
        </div>

        {/* Server Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {serverData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{item.label}</h3>
                  <p className="text-lg font-semibold text-gray-900 break-words">{item.value || "Не определено"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Agent Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-gray-50 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">User Agent</h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <code className="text-sm text-gray-700 break-all leading-relaxed">
                  {info?.user_agent || "Не определено"}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Сервер работает нормально</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
