"use client"
import React from 'react';
import { NavLink } from "react-router-dom"
import api from "../api/axios"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Menu,
  X,
  Search,
  User,
  LogOut,
  Home,
  ClipboardIcon,
  BarChart3,
  Calendar,
  Zap,
  Globe,
  Shield,
  Star,
  Users,
  FileText,
  Settings,
} from "lucide-react"

export default function FuturisticHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [time, setTime] = useState(new Date())
  const [user, setUser] = useState(null)

  // Определяем разрешения для каждой роли
  const rolePermissions = {
    admin: ["dashboard", "application", "analytics", "calendar", "users", "settings", "logs"],
    moderator: ["dashboard", "application", "analytics", "calendar"],
    user: ["dashboard", "application"],
  }

  // Функция проверки разрешений
  const hasPermission = (permission) => {
    if (!user) return false
    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission)
  }

  // Функция проверки ролей
  const hasRole = (roles) => {
    return user ? roles.includes(user.role) : false
  }

  // Все навигационные элементы с указанием необходимых разрешений
  const allNavigationItems = [
    {
      id: "dashboard",
      label: "Главная",
      icon: Home,
      color: "from-blue-500 to-cyan-500",
      permission: "dashboard",
    },
    {
      id: "application",
      label: "Заявки",
      icon: ClipboardIcon,
      color: "from-purple-500 to-pink-500",
      permission: "application",
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
      permission: "analytics",
    },
    {
      id: "calendar",
      label: "Календарь",
      icon: Calendar,
      color: "from-orange-500 to-red-500",
      permission: "calendar",
    },
    {
      id: "users",
      label: "Пользователи",
      icon: Users,
      color: "from-indigo-500 to-purple-500",
      permission: "users",
      requiredRoles: ["admin"], // Только для админов
    },
  ]

  // Фильтруем навигацию по разрешениям пользователя
  const navigationItems = allNavigationItems.filter((item) => {
    // Проверяем разрешение
    if (item.permission && !hasPermission(item.permission)) {
      return false
    }

    // Проверяем роли, если указаны
    if (item.requiredRoles && !hasRole(item.requiredRoles)) {
      return false
    }

    return true
  })

  const quickActions = [
    { icon: Zap, label: "Быстрые действия", color: "text-yellow-500" },
    { icon: Globe, label: "Сеть", color: "text-blue-500" },
    { icon: Shield, label: "Безопасность", color: "text-green-500" },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        const data = response.data

        const initials = data.full_name
          .split(" ")
          .map((word) => word[0])
          .join("")

        setUser({
          name: data.full_name,
          email: data.email,
          avatar: initials,
          role: data.role,
          status: "online",
        })
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error)
        // Перенаправляем на страницу входа при ошибке
        window.location.href = "/login"
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target
      if (isProfileOpen && !target.closest(".profile-dropdown")) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isProfileOpen])

  // Функция для проверки доступа к странице при клике
  const handleNavigation = (item, navigate) => {
    // Проверяем разрешения перед навигацией
    if (item.permission && !hasPermission(item.permission)) {
      alert(`У вас нет доступа к разделу "${item.label}"`)
      return
    }

    if (item.requiredRoles && !hasRole(item.requiredRoles)) {
      alert(`Недостаточно прав для доступа к разделу "${item.label}"`)
      return
    }

    // Если все проверки пройдены, выполняем навигацию
    navigate()
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }

  // Не показываем header, если пользователь не загружен
  if (!user) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <>
      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50"
            : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
        }`}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-4 mr-6">
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <Star className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              </div>

              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  АТМ
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Покрасочная</p>
              </div>

              {/* Time Display */}
              <div className="hidden lg:flex items-center space-x-2 ml-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-gray-300">{formatTime(time)}</span>
              </div>
            </div>

            {/* Center Navigation - только разрешенные элементы */}
            <nav className="hidden md:flex items-center space-x-2 mr-5">
              <div className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/50">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.id}
                      to={item.id === "dashboard" ? "/dashboard" : `/${item.id}`}
                      onClick={(e) => {
                        // Дополнительная проверка при клике
                        if (item.permission && !hasPermission(item.permission)) {
                          e.preventDefault()
                          alert(`У вас нет доступа к разделу "${item.label}"`)
                          return
                        }
                        if (item.requiredRoles && !hasRole(item.requiredRoles)) {
                          e.preventDefault()
                          alert(`Недостаточно прав для доступа к разделу "${item.label}"`)
                          return
                        }
                      }}
                      className={({ isActive }) =>
                        `relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 group ${
                          isActive
                            ? "text-white bg-gray-700/80 shadow-lg"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                        }`
                      }
                    >
                      <Icon
                        className={`w-4 h-4 transition-all duration-300 ${
                          window.location.pathname === (item.id === "dashboard" ? "/dashboard" : `/${item.id}`)
                            ? "scale-110"
                            : "group-hover:scale-105"
                        }`}
                      />
                      <span>{item.label}</span>

                      {window.location.pathname === (item.id === "dashboard" ? "/dashboard" : `/${item.id}`) && (
                        <div
                          className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
                        ></div>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden sm:block relative">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? "scale-105" : ""}`}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск в системе..."
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-64 pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
                  />
                  {isSearchFocused && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur"></div>
                  )}
                </div>
              </div>

              {/* Profile */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        user?.status === "online" ? "bg-green-400" : "bg-gray-500"
                      }`}
                    ></div>
                  </div>

                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.role}</p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-2 animate-in fade-in slide-in-from-top-5 duration-300">
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-block px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                              {user.role}
                            </span>
                            <span className="text-xs text-green-400 flex items-center">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                              Онлайн
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <a
                        href="#"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
                      >
                        <User className="w-4 h-4 mr-3 text-cyan-400" />
                        Профиль
                      </a>
                      {/* Показываем настройки только если есть разрешение */}
                      {hasPermission("settings") && (
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-400" />
                          Настройки
                        </Link>
                      )}
                      {hasPermission("logs") && (
                        <Link
                          to="/logs"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-150"
                        >
                          <FileText className="w-4 h-4 mr-3 text-orange-400" />
                          Логи
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-700/50 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Выйти из системы
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>

          <div className="fixed top-0 right-0 w-80 h-full bg-gray-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out border-l border-gray-700/50">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    АТМ
                  </h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-700/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* Mobile Navigation - только разрешенные элементы */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = window.location.pathname === (item.id === "dashboard" ? "/dashboard" : `/${item.id}`)
                  return (
                    <NavLink
                      key={item.id}
                      to={item.id === "dashboard" ? "/dashboard" : `/${item.id}`}
                      onClick={(e) => {
                        // Проверяем доступ при клике в мобильном меню
                        if (item.permission && !hasPermission(item.permission)) {
                          e.preventDefault()
                          alert(`У вас нет доступа к разделу "${item.label}"`)
                          return
                        }
                        if (item.requiredRoles && !hasRole(item.requiredRoles)) {
                          e.preventDefault()
                          alert(`Недостаточно прав для доступа к разделу "${item.label}"`)
                          return
                        }
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        isActive
                          ? "bg-gray-700/80 text-white border border-gray-600/50"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className={`ml-auto w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`}></div>
                      )}
                    </NavLink>
                  )
                })}
              </nav>

              {/* Mobile User Section */}
              <div className="p-4 border-t border-gray-700/50">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.avatar}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  )
}
