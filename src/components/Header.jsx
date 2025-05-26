"use client"
import React from 'react';
import { useState, useEffect, useRef } from "react"
import { Menu, X, LogOut, User, Settings, Search, ChevronRight, Bell, Calendar, FileText, Home } from "lucide-react"
import api from "../api/axios"

// Имитация компонента Link из react-router-dom
const Link = ({ to, children, className = "", ...props }) => (
  <a href={to} className={className} {...props}>
    {children}
  </a>
)

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState("dashboard")
  const headerRef = useRef(null)
  const searchInputRef = useRef(null)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState("")
  const [initials, setInitials] = useState("")

  const getInitials = (fullName) => {
    if (!fullName) return ""
    const words = fullName.trim().split(" ")
    if (words.length === 1) return words[0][0].toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        const userData = res.data
        setUser(userData)
        setInitials(getInitials(userData.full_name))
        setRole(userData.role)
      } catch (error) {
        console.error("Ошибка загрузки пользователя", error)
        // Установка демо-данных для отображения в случае ошибки
        setUser({ full_name: "Иван Петров", email: "ivan@example.com" })
        setInitials("ИП")
        setRole("Менеджер")
      }
    }

    fetchUser()
  }, [])

  const menuItems = [
    { name: "Главная", path: "/dashboard", icon: Home },
    { name: "Заявки", path: "/projects", icon: FileText },
    { name: "Задачи", path: "/tasks", icon: Calendar },
    { name: "Аналитика", path: "/analytics", icon: Bell },
  ]

  // Отслеживание скролла для изменения стиля хедера
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Отслеживание позиции мыши для эффекта свечения
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Закрытие мобильного меню при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Фокус на поле поиска при открытии
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".profile-menu")) {
        setIsProfileOpen(false)
      }
      if (isSearchOpen && !event.target.closest(".search-container") && !event.target.closest(".search-trigger")) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isProfileOpen, isSearchOpen])

  // Определение текущего активного пути
  useEffect(() => {
    const path = window.location.pathname
    const activeItem = menuItems.find((item) => path.includes(item.path.substring(1)))
    if (activeItem) {
      setActiveTab(activeItem.path.substring(1))
    }
  }, [])

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-white/90 backdrop-blur-xl text-gray-800 py-3" : "bg-transparent text-white py-5"
        }`}
        style={{
          boxShadow: isScrolled ? "0 4px 30px rgba(0, 0, 0, 0.03)" : "none",
        }}
      >
        {/* Фоновый градиент для неактивного состояния */}
        {!isScrolled && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-violet-600/90 -z-10"></div>
        )}

        {/* Интерактивный фоновый эффект */}
        {!isScrolled && (
          <div
            className="absolute inset-0 opacity-30 -z-10 transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.4), transparent)`,
            }}
          ></div>
        )}

        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Логотип и название */}
            <div className="flex items-center space-x-3 z-10">
              <div
                className={`relative w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group ${
                  isScrolled
                    ? "bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20"
                    : "bg-white/15 backdrop-blur-md"
                }`}
              >
                {/* Анимированный фон логотипа */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Анимированная звезда */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10 transition-transform duration-700 ease-out transform group-hover:rotate-45 group-hover:scale-110"
                >
                  <path
                    d="M12 2L14.85 8.3L22 9.3L17 14.3L18.15 21.4L12 18L5.85 21.4L7 14.3L2 9.3L9.15 8.3L12 2Z"
                    fill="currentColor"
                  />
                </svg>

                {/* Эффект свечения */}
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
              </div>

              <h1
                className={`text-lg font-medium tracking-wide transition-all duration-500 ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              >
                <span className="font-bold">Мой</span>Проект
              </h1>
            </div>

            {/* Центральная навигация - десктоп */}
            <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
              <div
                className={`flex items-center p-1 rounded-full transition-all duration-500 ${
                  isScrolled ? "bg-gray-100" : "bg-white/10 backdrop-blur-md"
                }`}
              >
                {menuItems.map(({ name, path, icon: Icon }, index) => {
                  const isActive = path.substring(1) === activeTab
                  return (
                    <Link
                      key={index}
                      to={path}
                      onClick={() => setActiveTab(path.substring(1))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1.5 ${
                        isActive
                          ? isScrolled
                            ? "bg-white text-blue-600 shadow-md shadow-blue-500/10"
                            : "bg-white/20 text-white backdrop-blur-md"
                          : isScrolled
                            ? "hover:bg-white text-gray-600 hover:text-blue-600"
                            : "hover:bg-white/20 text-white/80 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Правая часть - поиск и профиль */}
            <div className="flex items-center space-x-1 z-10">
              {/* Кнопка поиска */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-all duration-300 search-trigger ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-600 hover:text-blue-600"
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                } ${isSearchOpen ? (isScrolled ? "bg-gray-100" : "bg-white/10") : ""}`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Выпадающее меню профиля */}
              <div className="relative profile-menu">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                    isScrolled ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white/90 hover:text-white"
                  } ${isProfileOpen ? (isScrolled ? "bg-gray-100" : "bg-white/10") : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isScrolled
                        ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {initials}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl py-2 text-gray-800 z-10 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium">{user?.full_name || "Загрузка..."}</p>
                      <p className="text-xs text-gray-500">{user?.email || "Загрузка..."}</p>
                      <div className="mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full inline-block">
                        {role || "Пользователь"}
                      </div>
                    </div>
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center group"
                      >
                        <User className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" />
                        <span>Мой профиль</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center group"
                      >
                        <Settings className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-500 transition-colors" />
                        <span>Настройки</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                      </a>
                    </div>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center group"
                      >
                        <LogOut className="w-4 h-4 mr-2 group-hover:text-red-600" />
                        <span>Выход</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Кнопка мобильного меню */}
              <button
                className="md:hidden p-2 rounded-full transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Поиск */}
        {isSearchOpen && (
          <div className="absolute inset-x-0 top-full mt-2 px-4 search-container animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="container mx-auto">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Поиск по проектам, задачам и документам..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Популярные запросы:</span>
                  {["Активные проекты", "Задачи на сегодня", "Документация", "Отчеты"].map((tag, index) => (
                    <button
                      key={index}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Мобильное меню */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 right-0 w-[280px] bg-white z-50 md:hidden shadow-2xl transition-transform duration-500 ease-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L14.85 8.3L22 9.3L17 14.3L18.15 21.4L12 18L5.85 21.4L7 14.3L2 9.3L9.15 8.3L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="font-medium text-gray-800">МойПроект</h2>
            </div>
            <button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map(({ name, path, icon: Icon }, index) => {
                const isActive = path.substring(1) === activeTab
                return (
                  <Link
                    key={index}
                    to={path}
                    onClick={() => {
                      setActiveTab(path.substring(1))
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{name}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            {user ? (
              <div className="flex items-center p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium">
                  {initials}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link to="/login" className="ml-auto p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="p-2 text-center text-sm text-gray-500">Загрузка данных пользователя...</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
