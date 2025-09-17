import React from 'react';
import {useState, useEffect, useRef} from "react"
import {NavLink} from "react-router-dom"
import {AnimatePresence, motion} from "framer-motion"
import {
    Menu,
    X,
    User,
    LogOut,
    Settings,
    FileText,
    Star,
    ChevronDown,
    Grid3X3,
    Home,
    Sparkles,
    Zap,
    Pickaxe
} from "lucide-react"
import api from "../api/axios"
import {navigationGroups, rolePermissions} from "../config/NavigationData.jsx"

export default function ResponsiveHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNavigationOpen, setIsNavigationOpen] = useState(false)
    const [activeTabGroup, setActiveTabGroup] = useState('group1')
    const [user, setUser] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [time, setTime] = useState(new Date())
    const navigationRef = useRef(null)

    // Функция проверки разрешений
    const hasPermission = (permission) => {
        if (!user) return false
        const userPermissions = rolePermissions[user.role] || []
        return userPermissions.includes(permission)
    }

    // Получаем доступные группы для пользователя
    const getAvailableGroups = () => {
        const availableGroups = {}

        // Группа 1 - Склад
        const warehouseItems = navigationGroups.group1.items.filter(item =>
            !item.permission || hasPermission(item.permission)
        )
        if (warehouseItems.length > 0) {
            availableGroups.group1 = {
                ...navigationGroups.group1,
                items: warehouseItems
            }
        }

        // Группа 2 - Покрасочная
        const paintingItems = navigationGroups.group2.items.filter(item =>
            !item.permission || hasPermission(item.permission)
        )
        if (paintingItems.length > 0) {
            availableGroups.group2 = {
                ...navigationGroups.group2,
                items: paintingItems
            }
        }

        return availableGroups
    }

    const availableGroups = getAvailableGroups()

    // Проверяем, является ли пользователь администратором (может видеть обе группы)
    const isAdmin = user?.role === 'admin'
    const isAdminPaint = user?.role === 'admin_paint'

    // Автоматически выбираем группу для пользователя
    useEffect(() => {
        if (user && Object.keys(availableGroups).length > 0) {
            // Если пользователь не админ, выбираем первую доступную группу
            if (!isAdmin) {
                const firstAvailableGroup = Object.keys(availableGroups)[0]
                setActiveTabGroup(firstAvailableGroup)
            }
        }
    }, [user, isAdmin])

    // Получаем главную страницу для отображения в хедере
    const getMainNavItem = () => {
        const currentGroup = availableGroups[activeTabGroup]
        return currentGroup?.items.find(item =>
            item.id.includes('dashboard') || item.label.includes('Главная')
        ) || currentGroup?.items[0]
    }

    const mainNavItem = getMainNavItem()

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
        const timer = setInterval(() => setTime(new Date()), 60000)
        return () => clearInterval(timer)
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
            if (isProfileOpen && !event.target.closest(".profile-dropdown")) {
                setIsProfileOpen(false)
            }
            if (isNavigationOpen && !event.target.closest(".navigation-dropdown")) {
                setIsNavigationOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isProfileOpen, isNavigationOpen])

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

    if (!user) {
        return (
            <div
                className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-400 font-medium">Загрузка...</div>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Main Header */}
            <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                isMobile
                    ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
                    : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl"
            }`}>
                {/* Animated background effects - только для десктопа */}
                {!isMobile && (
                    <>
                        <div className="absolute inset-0 opacity-20">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-cyan-600/30 animate-pulse"></div>
                            <div
                                className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                            <div
                                className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
                        </div>
                        {/* Floating particles effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div
                                className="absolute top-2 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
                            <div
                                className="absolute top-4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-30"
                                style={{animationDelay: '1s'}}></div>
                            <div
                                className="absolute top-3 left-2/3 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-50"
                                style={{animationDelay: '2s'}}></div>
                        </div>
                    </>
                )}

                <div className={`relative z-10 ${isMobile ? "px-4 py-3" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}`}>
                    <div className={`flex items-center justify-between ${isMobile ? "" : "h-16"}`}>
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{scale: 1.1, rotate: 12}}
                                whileTap={{scale: 0.95}}
                                className={`relative group ${
                                    isMobile
                                        ? "w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg"
                                        : "w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl shadow-xl"
                                } flex items-center justify-center cursor-pointer`}>
                                <Star
                                    className={`${isMobile ? "w-5 h-5 text-white" : "w-5 h-5 text-white animate-pulse"}`}/>
                                {!isMobile && (
                                    <>
                                        <div
                                            className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-2xl animate-pulse"></div>
                                    </>
                                )}
                            </motion.div>

                            <div>
                                <h1 className={`${
                                    isMobile
                                        ? "text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                        : "text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                                }`}>
                                    АТМ
                                </h1>
                            </div>

                            {/* Time Display - только для десктопа */}
                            {!isMobile && (
                                <div className="hidden lg:flex items-center space-x-3 ml-8">
                                    <div
                                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                                        <div
                                            className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                        <span className="text-sm font-mono text-gray-300">{formatTime(time)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <div className="flex items-center space-x-4">
                                {/* Main Navigation Button */}
                                {mainNavItem && (
                                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                        <NavLink
                                            to={mainNavItem.path}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                                                window.location.pathname === mainNavItem.path
                                                    ? "text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25"
                                                    : "text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50"
                                            }`}
                                        >
                                            <Home className="w-4 h-4"/>
                                            <span>Главная</span>
                                            {window.location.pathname === mainNavItem.path && (
                                                <Sparkles className="w-3 h-3 animate-pulse"/>
                                            )}
                                        </NavLink>
                                    </motion.div>
                                )}

                                {/* Navigation Dropdown */}
                                <div className="relative navigation-dropdown" ref={navigationRef}>
                                    <motion.button
                                        whileHover={{scale: 1.05}}
                                        whileTap={{scale: 0.95}}
                                        onClick={() => setIsNavigationOpen(!isNavigationOpen)}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 group"
                                    >
                                        <Grid3X3
                                            className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"/>
                                        <span>Навигация</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                            isNavigationOpen ? "rotate-180" : ""
                                        }`}/>
                                        <Zap
                                            className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                                    </motion.button>

                                    {/* Mega Menu Dropdown */}
                                    <AnimatePresence>
                                        {isNavigationOpen && (
                                            <motion.div
                                                initial={{opacity: 0, y: -10, scale: 0.95}}
                                                animate={{opacity: 1, y: 0, scale: 1}}
                                                exit={{opacity: 0, y: -10, scale: 0.95}}
                                                transition={{duration: 0.2, ease: "easeOut"}}
                                                className="absolute top-full left-0 mt-2 w-96 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-4 z-50 overflow-hidden"
                                            >
                                                {/* Animated background */}
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 animate-pulse opacity-50"></div>

                                                <div className="relative z-10">
                                                    {/* Group Tabs - показываем только если админ и есть обе группы */}
                                                    {isAdmin && Object.keys(availableGroups).length > 1 && (
                                                        <div className="px-4 mb-4">
                                                            <div
                                                                className="flex bg-gray-700/50 backdrop-blur-sm rounded-lg p-1 border border-gray-600/30">
                                                                {Object.entries(availableGroups).map(([groupKey, group]) => {
                                                                    const isActive = activeTabGroup === groupKey
                                                                    return (
                                                                        <motion.button
                                                                            key={groupKey}
                                                                            whileHover={{scale: 1.02}}
                                                                            whileTap={{scale: 0.98}}
                                                                            onClick={() => setActiveTabGroup(groupKey)}
                                                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                                                                                isActive
                                                                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                                                                                    : "text-gray-400 hover:text-white hover:bg-gray-600/50"
                                                                            }`}
                                                                        >
                                                                            {group.label}
                                                                        </motion.button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Navigation Grid */}
                                                    <div className="px-4">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {availableGroups[activeTabGroup]?.items.map((item, index) => {
                                                                const Icon = item.icon
                                                                const isActive = window.location.pathname === item.path
                                                                return (
                                                                    <motion.div
                                                                        key={item.id}
                                                                        initial={{opacity: 0, y: 10}}
                                                                        animate={{opacity: 1, y: 0}}
                                                                        transition={{delay: index * 0.05}}
                                                                        whileHover={{scale: 1.02}}
                                                                        whileTap={{scale: 0.98}}
                                                                    >
                                                                        <NavLink
                                                                            to={item.path}
                                                                            onClick={() => setIsNavigationOpen(false)}
                                                                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group ${
                                                                                isActive
                                                                                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                                                                                    : "text-gray-400 hover:text-white hover:bg-gray-700/40 border border-transparent hover:border-gray-600/30"
                                                                            }`}
                                                                        >
                                                                            <Icon
                                                                                className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                                                                                    isActive ? "text-cyan-400 scale-110" : "group-hover:scale-105"
                                                                                }`}/>
                                                                            <span
                                                                                className="text-sm font-medium truncate">{item.label}</span>
                                                                            {isActive && (
                                                                                <div
                                                                                    className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                                                                            )}
                                                                        </NavLink>
                                                                    </motion.div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Right Section */}
                        <div className="flex items-center space-x-2">
                            {/* Profile */}
                            <div className="relative profile-dropdown">
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`flex items-center ${
                                        isMobile
                                            ? "space-x-0"
                                            : "space-x-3 p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300 group border border-transparent hover:border-gray-600/30"
                                    }`}
                                >
                                    <div className="relative">
                                        <div className={`${
                                            isMobile
                                                ? "w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg"
                                                : "w-8 h-8 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-full shadow-lg"
                                        } flex items-center justify-center text-white text-sm font-bold group-hover:shadow-xl transition-shadow duration-300`}>
                                            {user?.avatar}
                                        </div>
                                        <div
                                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                                                isMobile ? "border-white" : "border-gray-900"
                                            } bg-green-400 animate-pulse shadow-lg shadow-green-400/50`}></div>
                                    </div>

                                    {!isMobile && (
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors duration-300">{user?.name}</p>
                                            <p className="text-xs text-gray-400">{user?.role}</p>
                                        </div>
                                    )}
                                </motion.button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{opacity: 0, y: -10, scale: 0.95}}
                                            animate={{opacity: 1, y: 0, scale: 1}}
                                            exit={{opacity: 0, y: -10, scale: 0.95}}
                                            transition={{duration: 0.2}}
                                            className={`absolute right-0 mt-2 ${
                                                isMobile
                                                    ? "w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50"
                                                    : "w-72 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50"
                                            } py-2 z-50 overflow-hidden`}
                                        >
                                            {/* Animated background */}
                                            {!isMobile && (
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 animate-pulse opacity-30"></div>
                                            )}

                                            <div className="relative z-10">
                                                {/* Profile Info */}
                                                <div className={`px-4 py-3 ${
                                                    isMobile ? "border-b border-gray-200/50" : "border-b border-gray-700/50"
                                                }`}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative">
                                                            <div className={`w-12 h-12 bg-gradient-to-br ${
                                                                isMobile
                                                                    ? "from-blue-500 via-purple-500 to-pink-500"
                                                                    : "from-cyan-500 via-blue-500 to-purple-600"
                                                            } rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                                                                {user.avatar}
                                                            </div>
                                                            <div
                                                                className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 ${
                                                                    isMobile ? "border-white" : "border-gray-800"
                                                                } animate-pulse shadow-lg shadow-green-400/50`}></div>
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
                                                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                                        : "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30"
                                                                } text-xs rounded-full font-medium`}>
                                                                    {user.role}
                                                                </span>
                                                                <span className={`text-xs ${
                                                                    isMobile ? "text-green-600" : "text-green-400"
                                                                } flex items-center font-medium`}>
                                                                    <div
                                                                        className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse shadow-sm shadow-green-400/50"></div>
                                                                    Онлайн
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Profile Menu Items */}
                                                <div className="py-2">
                                                    <motion.a
                                                        whileHover={{x: 4}}
                                                        href="#"
                                                        className={`flex items-center px-4 py-2 text-sm ${
                                                            isMobile
                                                                ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                                                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                                        } transition-all duration-200`}
                                                    >
                                                        <User className={`w-4 h-4 mr-3 ${
                                                            isMobile ? "text-blue-500" : "text-cyan-400"
                                                        }`}/>
                                                        Профиль
                                                    </motion.a>
                                                    {isAdmin || isAdminPaint  && (
                                                        <motion.a
                                                            whileHover={{x: 4}}
                                                            href="work"
                                                            className={`flex items-center px-4 py-2 text-sm ${
                                                                isMobile
                                                                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                                                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                                            } transition-all duration-200`}
                                                        >
                                                            <Pickaxe className={`w-4 h-4 mr-3 ${
                                                                isMobile ? "text-blue-500" : "text-cyan-400"
                                                            }`}/>
                                                            Работы
                                                        </motion.a>
                                                    )}
                                                    {hasPermission("settings") && (
                                                        <motion.div whileHover={{x: 4}}>
                                                            <NavLink
                                                                to="/settings"
                                                                className={`flex items-center px-4 py-2 text-sm ${
                                                                    isMobile
                                                                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                                                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                                                } transition-all duration-200`}
                                                                onClick={() => setIsProfileOpen(false)}
                                                            >
                                                                <Settings className="w-4 h-4 mr-3 text-gray-400"/>
                                                                Настройки
                                                            </NavLink>
                                                        </motion.div>
                                                    )}
                                                    {hasPermission("logs") && (
                                                        <motion.div whileHover={{x: 4}}>
                                                            <NavLink
                                                                to="/logs"
                                                                className={`flex items-center px-4 py-2 text-sm ${
                                                                    isMobile
                                                                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                                                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                                                                } transition-all duration-200`}
                                                                onClick={() => setIsProfileOpen(false)}
                                                            >
                                                                <FileText className={`w-4 h-4 mr-3 ${
                                                                    isMobile ? "text-orange-500" : "text-orange-400"
                                                                }`}/>
                                                                Логи
                                                            </NavLink>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                <div className={`${
                                                    isMobile ? "border-t border-gray-200/50" : "border-t border-gray-700/50"
                                                } pt-2`}>
                                                    <motion.button
                                                        whileHover={{x: 4}}
                                                        onClick={handleLogout}
                                                        className={`flex items-center w-full px-4 py-2 text-sm ${
                                                            isMobile
                                                                ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        } transition-all duration-200`}
                                                    >
                                                        <LogOut className="w-4 h-4 mr-3"/>
                                                        Выйти из системы
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Menu Button */}
                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`${
                                    isMobile
                                        ? "w-10 h-10 bg-gray-100 rounded-xl hover:bg-gray-200 shadow-sm"
                                        : "p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl border border-transparent hover:border-gray-600/30"
                                } flex items-center justify-center transition-all duration-300`}
                                aria-label="Меню"
                            >
                                <motion.div
                                    animate={{rotate: isMobileMenuOpen ? 180 : 0}}
                                    transition={{duration: 0.3}}
                                >
                                    {isMobileMenuOpen ? (
                                        <X className={`w-5 h-5 ${isMobile ? "text-gray-600" : ""}`}/>
                                    ) : (
                                        <Menu className={`w-5 h-5 ${isMobile ? "text-gray-600" : ""}`}/>
                                    )}
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        <motion.div
                            initial={{x: "100%"}}
                            animate={{x: 0}}
                            exit={{x: "100%"}}
                            transition={{type: "spring", damping: 30, stiffness: 300}}
                            className={`fixed top-0 right-0 h-full z-50 w-80 ${
                                isMobile
                                    ? "bg-white/95 backdrop-blur-xl"
                                    : "bg-gray-900/95 backdrop-blur-xl"
                            } shadow-2xl ${
                                isMobile ? "border-l border-gray-200" : "border-l border-gray-700/50"
                            } overflow-hidden`}
                        >
                            {/* Animated background for mobile menu */}
                            {!isMobile && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 animate-pulse opacity-50"></div>
                            )}

                            <div className="flex flex-col h-full">
                                {/* Mobile Header */}
                                <div className={`flex items-center justify-between p-4 ${
                                    isMobile ? "border-b border-gray-200/50 mt-6" : "border-b border-gray-700/50"
                                }`}>
                                    <div className="flex items-center space-x-3">
                                        <motion.div
                                            whileHover={{rotate: 12, scale: 1.1}}
                                            className={`w-8 h-8 ${
                                                isMobile
                                                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg"
                                                    : "bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600"
                                            } rounded-2xl flex items-center justify-center cursor-pointer`}>
                                            <Star className="w-4 h-4 text-white"/>
                                        </motion.div>
                                        <h2 className={`font-bold ${
                                            isMobile
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                                : "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                                        }`}>
                                            АТМ
                                        </h2>
                                    </div>
                                    <motion.button
                                        whileHover={{scale: 1.1, rotate: 90}}
                                        whileTap={{scale: 0.9}}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`p-2 ${
                                            isMobile ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"
                                        } rounded-lg transition-colors duration-200`}
                                    >
                                        <X className="w-5 h-5"/>
                                    </motion.button>
                                </div>

                                {/* Group Tabs для мобильного меню - показываем только если админ и есть обе группы */}
                                {isAdmin && Object.keys(availableGroups).length > 1 && (
                                    <div className={`p-4 ${
                                        isMobile ? "border-b border-gray-200/50" : "border-b border-gray-700/50"
                                    }`}>
                                        <div className={`flex ${
                                            isMobile ? "bg-gray-100" : "bg-gray-800/50"
                                        } rounded-lg p-1 backdrop-blur-sm`}>
                                            {Object.entries(availableGroups).map(([groupKey, group]) => {
                                                const GroupIcon = group.icon
                                                const isActive = activeTabGroup === groupKey
                                                return (
                                                    <motion.button
                                                        key={groupKey}
                                                        whileHover={{scale: 1.02}}
                                                        whileTap={{scale: 0.98}}
                                                        onClick={() => setActiveTabGroup(groupKey)}
                                                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                                                            isActive
                                                                ? isMobile
                                                                    ? "bg-white text-blue-600 shadow-lg shadow-blue-500/25"
                                                                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                                                                : isMobile
                                                                    ? "text-gray-600 hover:text-gray-800"
                                                                    : "text-gray-400 hover:text-white"
                                                        }`}
                                                    >
                                                        <GroupIcon className="w-4 h-4"/>
                                                        <span>{group.label}</span>
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Navigation */}
                                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                    {availableGroups[activeTabGroup]?.items.map((item, index) => {
                                        const Icon = item.icon
                                        const isActive = window.location.pathname === item.path
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{opacity: 0, x: 20}}
                                                animate={{opacity: 1, x: 0}}
                                                transition={{delay: index * 0.05}}
                                                whileHover={{x: 4, scale: 1.02}}
                                                whileTap={{scale: 0.98}}
                                            >
                                                <NavLink
                                                    to={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                                                        isActive
                                                            ? isMobile
                                                                ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-lg shadow-blue-500/10"
                                                                : "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                                                            : isMobile
                                                                ? "text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                                                : "text-gray-400 hover:text-white hover:bg-gray-700/40 border border-transparent hover:border-gray-600/30"
                                                    }`}
                                                >
                                                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                                                        isActive ? "scale-110" : ""
                                                    }`}/>
                                                    <span className="font-medium">{item.label}</span>
                                                    {isActive && (
                                                        <div className={`ml-auto w-2 h-2 rounded-full ${
                                                            isMobile ? "bg-blue-500" : "bg-cyan-400"
                                                        } animate-pulse shadow-lg ${
                                                            isMobile ? "shadow-blue-500/50" : "shadow-cyan-400/50"
                                                        }`}></div>
                                                    )}
                                                </NavLink>
                                            </motion.div>
                                        )
                                    })}
                                </nav>

                                {/* Mobile User Section */}
                                <div className={`p-4 ${
                                    isMobile ? "border-t border-gray-200/50" : "border-t border-gray-700/50"
                                }`}>
                                    <motion.div
                                        whileHover={{scale: 1.02}}
                                        className={`flex items-center space-x-3 p-3 ${
                                            isMobile
                                                ? "bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm"
                                                : "bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm"
                                        } transition-all duration-300`}>
                                        <div className="relative">
                                            <div className={`w-10 h-10 ${
                                                isMobile
                                                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg"
                                                    : "bg-gradient-to-br from-cyan-500 to-purple-600"
                                            } rounded-full flex items-center justify-center text-white font-bold`}>
                                                {user.avatar}
                                            </div>
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 ${
                                                    isMobile ? "border-white" : "border-gray-800"
                                                } animate-pulse shadow-lg shadow-green-400/50`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                isMobile ? "text-gray-800" : "text-white"
                                            }`}>{user.name}</p>
                                            <p className={`text-sm ${
                                                isMobile ? "text-gray-500" : "text-gray-400"
                                            }`}>{user.email}</p>
                                        </div>
                                        <motion.button
                                            whileHover={{scale: 1.1, rotate: 15}}
                                            whileTap={{scale: 0.9}}
                                            onClick={handleLogout}
                                            className={`p-2 ${
                                                isMobile ? "text-gray-500 hover:text-red-600" : "text-gray-400 hover:text-red-400"
                                            } rounded-lg transition-all duration-300`}
                                        >
                                            <LogOut className="w-4 h-4"/>
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Spacers */}
            <div className="h-16"></div>
        </>
    )
}