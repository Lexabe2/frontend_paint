"use client"
import React from 'react';
import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
    Menu,
    X,
    PackageCheck,
    User,
    LogOut,
    Home,
    ClipboardIcon,
    CreditCard,
    FileWarning,
    Settings,
    FileText,
    Star,
    CirclePlus,
    MessageSquarePlus,
    Eye,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Grid3X3
} from "lucide-react"
import api from "../api/axios"

export default function ResponsiveHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [activeTabGroup, setActiveTabGroup] = useState('group1')
    const [time, setTime] = useState(new Date())
    const [user, setUser] = useState(null)
    const [, setIsOnline] = useState(navigator.onLine)
    const [isMobile, setIsMobile] = useState(false)
    const [showOverflowMenu, setShowOverflowMenu] = useState(false)

    // Определяем разрешения для каждой роли
    const rolePermissions = {
        admin: ["dashboard", "application", "registration", "atm", "complaints", "settings", "logs", "signing"],
        admin_paint: ["dashboard", "application", "registration", "atm"],
        admin_pp: ["dashboard", "application"],
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

    // Группы навигационных элементов
    const navigationGroups = {
        group1: {
            label: "Склад",
            icon: PackageCheck,
            color: "from-blue-500 to-cyan-500",
            items: [{
                id: "dashboard",
                label: "Главная",
                icon: Home,
                color: "from-blue-500 to-cyan-500",
                permission: "dashboard",
                path: "/dashboard",
            },
            {
                id: "signing",
                label: "Оприходование",
                icon: CirclePlus,
                color: "from-blue-500 to-cyan-500",
                permission: "signing",
                path: "/add_atm",
            },
            {
                id: "add_req",
                label: "Создание заявки",
                icon: MessageSquarePlus,
                color: "from-blue-500 to-cyan-500",
                permission: "signing",
                path: "/warehouse_atms",
            },
            {
                id: "viewing_req",
                label: "Просмотр заявок",
                icon: Eye,
                color: "from-blue-500 to-cyan-500",
                permission: "signing",
                path: "/viewing_req",
            },
            {
                id: "registration_warehouse",
                label: "Передача",
                icon: PackageCheck,
                color: "from-green-500 to-emerald-500",
                permission: "registration",
                path: "/registration?group=warehouse",
            }]
        },
        group2: {
            label: "Покрасочная",
            icon: CreditCard,
            color: "from-purple-500 to-pink-500",
            items: [
                {
                    id: "dashboard",
                    label: "Главная",
                    icon: Home,
                    color: "from-blue-500 to-cyan-500",
                    permission: "dashboard",
                    path: "/dashboard",
                },
                {
                    id: "application",
                    label: "Заявки",
                    icon: ClipboardIcon,
                    color: "from-purple-500 to-pink-500",
                    permission: "application",
                    path: "/application",
                },
                {
                    id: "registration",
                    label: "Приемка",
                    icon: PackageCheck,
                    color: "from-green-500 to-emerald-500",
                    permission: "registration",
                    path: "/registration?group=paint",
                },
                {
                    id: "atm",
                    label: "Устройства",
                    icon: CreditCard,
                    color: "from-orange-500 to-red-500",
                    permission: "atm",
                    path: "/atm",
                },
                {
                    id: "complaints",
                    label: "Рекламации",
                    icon: FileWarning,
                    color: "from-indigo-500 to-purple-500",
                    permission: "complaints",
                    path: "/complaints",
                }]
        }
    }

    // Получаем доступные группы для пользователя
    const getAvailableGroups = () => {
        const availableGroups = {}

        Object.entries(navigationGroups).forEach(([groupKey, group]) => {
            const filteredItems = group.items.filter((item) => {
                if (item.permission && !hasPermission(item.permission)) {
                    return false
                }
                return !(item.requiredRoles && !hasRole(item.requiredRoles));
            })

            if (filteredItems.length > 0) {
                availableGroups[groupKey] = {
                    ...group,
                    items: filteredItems
                }
            }
        })

        return availableGroups
    }

    const availableGroups = getAvailableGroups()
    const navigationItems = availableGroups[activeTabGroup]?.items || []

    // Проверяем, является ли пользователь администратором
    const isAdmin = user?.role === 'admin'

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
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target
            if (isProfileOpen && !target.closest(".profile-dropdown")) {
                setIsProfileOpen(false)
            }
            if (showOverflowMenu && !target.closest(".overflow-menu")) {
                setShowOverflowMenu(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isProfileOpen, showOverflowMenu])

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

    // Разделяем элементы навигации для мобильной версии
    const getMobileNavigationSplit = () => {
        const primaryItems = navigationItems.slice(0, 4) // Первые 4 элемента
        const overflowItems = navigationItems.slice(4) // Остальные элементы
        return { primaryItems, overflowItems }
    }

    const { primaryItems, overflowItems } = getMobileNavigationSplit()

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
            <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
                isMobile 
                    ? "bg-white shadow-lg border-b border-gray-200" 
                    : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
            }`}>
                {/* Animated background pattern - только для десктопа */}
                {!isMobile && (
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                    </div>
                )}

                <div className={`relative ${isMobile ? "px-4 py-3" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}`}>
                    <div className={`flex items-center justify-between ${isMobile ? "" : "h-16"}`}>
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3">
                            <div className={`relative group ${
                                isMobile 
                                    ? "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl" 
                                    : "w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl"
                            } flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 ${
                                isMobile ? "" : "group-hover:rotate-12"
                            }`}>
                                <Star className={`${isMobile ? "w-5 h-5 text-white" : "w-5 h-5 text-white animate-pulse"}`}/>
                                {!isMobile && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                                )}
                            </div>

                            <div>
                                <h1 className={`${
                                    isMobile 
                                        ? "text-lg font-bold text-gray-800" 
                                        : "text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                                }`}>
                                    АТМ
                                </h1>
                            </div>

                            {/* Time Display - только для десктопа */}
                            {!isMobile && (
                                <div className="hidden lg:flex items-center space-x-2 ml-8 mr-3">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-mono text-gray-300">{formatTime(time)}</span>
                                </div>
                            )}
                        </div>

                        {/* Center Navigation - только для десктопа */}
                        {!isMobile && (
                            <nav className="hidden md:flex items-center flex-1 mx-8">
                                {/* Group Tabs */}
                                {isAdmin && Object.keys(availableGroups).length > 1 && (
                                    <div className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50 mr-4">
                                        {Object.entries(availableGroups).map(([groupKey, group]) => {
                                            const GroupIcon = group.icon
                                            const isActive = activeTabGroup === groupKey
                                            return (
                                                <button
                                                    key={groupKey}
                                                    onClick={() => setActiveTabGroup(groupKey)}
                                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        isActive 
                                                            ? "text-white bg-gray-700/80 shadow-lg" 
                                                            : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                                                    }`}
                                                >
                                                    <GroupIcon className="w-4 h-4" />
                                                    <span className="hidden lg:block">{group.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Navigation Items with Horizontal Scroll */}
                                <div className="flex-1 relative">
                                    <div className="flex items-center overflow-x-auto scrollbar-hide space-x-2 py-2">
                                        <div className="flex space-x-1 min-w-max">
                                            {navigationItems.map((item) => {
                                                const Icon = item.icon
                                                const isActive = window.location.pathname === item.path
                                                return (
                                                    <NavLink
                                                        key={item.id}
                                                        to={item.path}
                                                        className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group whitespace-nowrap ${
                                                            isActive 
                                                                ? "text-white bg-gray-700/80 shadow-lg" 
                                                                : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                                                        }`}
                                                    >
                                                        <Icon className={`w-4 h-4 transition-all duration-300 ${
                                                            isActive ? "scale-110" : "group-hover:scale-105"
                                                        }`} />
                                                        <span className="hidden xl:block">{item.label}</span>

                                                        {isActive && (
                                                            <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}></div>
                                                        )}
                                                    </NavLink>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        )}

                        {/* Right Section */}
                        <div className="flex items-center space-x-2">
                            {/* Profile */}
                            <div className="relative profile-dropdown">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`flex items-center ${
                                        isMobile 
                                            ? "space-x-0" 
                                            : "space-x-3 p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className={`${
                                            isMobile 
                                                ? "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl" 
                                                : "w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full"
                                        } flex items-center justify-center text-white text-sm font-bold`}>
                                            {user?.avatar}
                                        </div>
                                        <div className={`absolute ${
                                            isMobile ? "-bottom-0.5 -right-0.5 w-3 h-3" : "-bottom-0.5 -right-0.5 w-3 h-3"
                                        } rounded-full border-2 ${
                                            isMobile ? "border-white" : "border-gray-900"
                                        } ${user?.status === "online" ? "bg-green-400" : "bg-gray-500"}`}></div>
                                    </div>

                                    {!isMobile && (
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-medium text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-400">{user?.role}</p>
                                        </div>
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className={`absolute right-0 mt-2 ${
                                        isMobile 
                                            ? "w-72 bg-white rounded-2xl shadow-2xl border border-gray-200" 
                                            : "w-72 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50"
                                    } py-2 animate-in fade-in slide-in-from-top-5 duration-300 z-50`}>
                                        {/* Profile Info */}
                                        <div className={`px-4 py-3 ${
                                            isMobile ? "border-b border-gray-200" : "border-b border-gray-700/50"
                                        }`}>
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className={`w-12 h-12 bg-gradient-to-br from-${
                                                        isMobile ? "blue" : "cyan"
                                                    }-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold`}>
                                                        {user.avatar}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 ${
                                                        isMobile ? "border-white" : "border-gray-800"
                                                    }`}></div>
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${
                                                        isMobile ? "text-gray-800" : "text-white"
                                                    }`}>{user.name}</p>
                                                    <p className={`text-sm ${
                                                        isMobile ? "text-gray-500" : "text-gray-400"
                                                    }`}>{user.email}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`inline-block px-2 py-1 ${
                                                            isMobile 
                                                                ? "bg-blue-100 text-blue-700" 
                                                                : "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400"
                                                        } text-xs rounded-full ${
                                                            isMobile ? "border border-blue-200" : "border border-cyan-500/30"
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                        <span className={`text-xs ${
                                                            isMobile ? "text-green-600" : "text-green-400"
                                                        } flex items-center`}>
                                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                                            Онлайн
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Menu Items */}
                                        <div className="py-2">
                                            <a href="#" className={`flex items-center px-4 py-2 text-sm ${
                                                isMobile 
                                                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" 
                                                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                            } transition-colors duration-150`}>
                                                <User className={`w-4 h-4 mr-3 ${
                                                    isMobile ? "text-blue-500" : "text-cyan-400"
                                                }`}/>
                                                Профиль
                                            </a>
                                            {hasPermission("settings") && (
                                                <NavLink
                                                    to="/settings"
                                                    className={`flex items-center px-4 py-2 text-sm ${
                                                        isMobile 
                                                            ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" 
                                                            : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                                    } transition-colors duration-150`}
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-3 text-gray-400"/>
                                                    Настройки
                                                </NavLink>
                                            )}
                                            {hasPermission("logs") && (
                                                <NavLink
                                                    to="/logs"
                                                    className={`flex items-center px-4 py-2 text-sm ${
                                                        isMobile 
                                                            ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100" 
                                                            : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                                    } transition-colors duration-150`}
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <FileText className={`w-4 h-4 mr-3 ${
                                                        isMobile ? "text-orange-500" : "text-orange-400"
                                                    }`}/>
                                                    Логи
                                                </NavLink>
                                            )}
                                        </div>

                                        <div className={`${
                                            isMobile ? "border-t border-gray-200" : "border-t border-gray-700/50"
                                        } pt-2`}>
                                            <button
                                                onClick={handleLogout}
                                                className={`flex items-center w-full px-4 py-2 text-sm ${
                                                    isMobile 
                                                        ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                                                        : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                } transition-colors duration-150`}
                                            >
                                                <LogOut className="w-4 h-4 mr-3"/>
                                                Выйти из системы
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`${
                                    isMobile 
                                        ? "w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200" 
                                        : "md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl"
                                } flex items-center justify-center transition-colors duration-200`}
                                aria-label="Меню"
                            >
                                {isMobileMenuOpen ? (
                                    <X className={`w-5 h-5 ${isMobile ? "text-gray-600" : ""}`}/>
                                ) : (
                                    <Menu className={`w-5 h-5 ${isMobile ? "text-gray-600" : ""}`}/>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`fixed top-0 right-0 h-full z-50 w-80 ${
                                isMobile 
                                    ? "bg-white" 
                                    : "bg-gray-900/95 backdrop-blur-xl"
                            } shadow-2xl transform transition-transform duration-300 ease-out ${
                                isMobile ? "border-l border-gray-200" : "border-l border-gray-700/50"
                            }`}
                        >
                            <div className="flex flex-col h-full">
                                {/* Mobile Header */}
                                <div className={`flex items-center justify-between p-4 ${
                                    isMobile ? "border-b border-gray-200 mt-6" : "border-b border-gray-700/50"
                                }`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 ${
                                            isMobile 
                                                ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                                                : "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600"
                                        } rounded-2xl flex items-center justify-center`}>
                                            <Star className="w-4 h-4 text-white"/>
                                        </div>
                                        <h2 className={`font-bold ${
                                            isMobile 
                                                ? "text-gray-800" 
                                                : "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                                        }`}>
                                            АТМ
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`p-2 ${
                                            isMobile ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"
                                        } rounded-lg`}
                                    >
                                        <X className="w-5 h-5"/>
                                    </button>
                                </div>

                                {/* Group Tabs для мобильного меню */}
                                {isAdmin && Object.keys(availableGroups).length > 1 && (
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            {Object.entries(availableGroups).map(([groupKey, group]) => {
                                                const GroupIcon = group.icon
                                                const isActive = activeTabGroup === groupKey
                                                return (
                                                    <button
                                                        key={groupKey}
                                                        onClick={() => setActiveTabGroup(groupKey)}
                                                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                                                            isActive 
                                                                ? "bg-white text-blue-600 shadow-sm" 
                                                                : "text-gray-600 hover:text-gray-800"
                                                        }`}
                                                    >
                                                        <GroupIcon className="w-4 h-4" />
                                                        <span>{group.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Navigation */}
                                <nav className="flex-1 p-4 space-y-2">
                                    {navigationItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = window.location.pathname === item.path
                                        return (
                                            <NavLink
                                                key={item.id}
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                                    isActive 
                                                        ? isMobile 
                                                            ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                                            : "bg-gray-700/80 text-white border border-gray-600/50"
                                                        : isMobile 
                                                            ? "text-gray-700 hover:text-gray-900 hover:bg-gray-50" 
                                                            : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                                                }`}
                                            >
                                                <Icon className="w-5 h-5"/>
                                                <span className="font-medium">{item.label}</span>
                                                {isActive && (
                                                    <div className={`ml-auto w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`}></div>
                                                )}
                                            </NavLink>
                                        )
                                    })}
                                </nav>

                                {/* Mobile User Section */}
                                <div className={`p-4 ${
                                    isMobile ? "border-t border-gray-200" : "border-t border-gray-700/50"
                                }`}>
                                    <div className={`flex items-center space-x-3 p-3 ${
                                        isMobile 
                                            ? "bg-gray-50 rounded-xl border border-gray-200" 
                                            : "bg-gray-800/50 rounded-xl border border-gray-700/50"
                                    }`}>
                                        <div className="relative">
                                            <div className={`w-10 h-10 ${
                                                isMobile 
                                                    ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                                                    : "bg-gradient-to-br from-cyan-500 to-purple-600"
                                            } rounded-full flex items-center justify-center text-white font-bold`}>
                                                {user.avatar}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 ${
                                                isMobile ? "border-gray-50" : "border-gray-900"
                                            }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                isMobile ? "text-gray-800" : "text-white"
                                            }`}>{user.name}</p>
                                            <p className={`text-sm ${
                                                isMobile ? "text-gray-500" : "text-gray-400"
                                            }`}>{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className={`p-2 ${
                                                isMobile ? "text-gray-500 hover:text-red-600" : "text-gray-400 hover:text-red-400"
                                            } rounded-lg transition-colors duration-200`}
                                        >
                                            <LogOut className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation - только для мобильных */}
            {isMobile && (
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2 safe-area-pb">
                    <div className="flex items-center justify-around">
                        {/* Основные элементы навигации */}
                        {primaryItems.map((item) => {
                            const Icon = item.icon
                            const isActive = window.location.pathname === item.path
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] transition-all duration-200 ${
                                        isActive ? "bg-blue-50" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-all duration-200 ${
                                        isActive 
                                            ? `bg-gradient-to-r ${item.color} shadow-lg` 
                                            : "bg-gray-100 hover:bg-gray-200"
                                    }`}>
                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-600"}`}/>
                                    </div>
                                    <span className={`text-xs font-medium truncate max-w-[50px] ${
                                        isActive ? "text-blue-600" : "text-gray-600"
                                    }`}>
                                        {item.label}
                                    </span>
                                </NavLink>
                            )
                        })}

                        {/* Кнопка "Больше" для переполнения */}
                        {overflowItems.length > 0 && (
                            <div className="relative overflow-menu">
                                <button
                                    onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                                    className="flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] transition-all duration-200 hover:bg-gray-50"
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                                        <MoreHorizontal className="w-4 h-4 text-gray-600"/>
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Еще</span>
                                </button>

                                {/* Overflow Menu */}
                                {showOverflowMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
                                        {overflowItems.map((item) => {
                                            const Icon = item.icon
                                            const isActive = window.location.pathname === item.path
                                            return (
                                                <NavLink
                                                    key={item.id}
                                                    to={item.path}
                                                    onClick={() => setShowOverflowMenu(false)}
                                                    className={`flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 ${
                                                        isActive 
                                                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500" 
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-600"}`}/>
                                                    <span className="font-medium">{item.label}</span>
                                                </NavLink>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            )}

            {/* Spacers */}
            <div className={`${isMobile ? "h-0" : "h-16"}`}></div>
            {isMobile && <div className="h-20"></div>}
        </>
    )
}