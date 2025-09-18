"use client";

import React from "react";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import WarehouseInfo from "../components/WarehouseInfo";
import PaintingInfo from "../components/PaintingInfo";
import PhotoCapture from "../components/PhotoCapture";
import api from "../api/axios.js";
import {
    Home,
    Package,
    Palette,
    User,
    Shield,
    AlertCircle,
    RefreshCw,
    Settings
} from "lucide-react";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [photos, setPhotos] = useState([]);

    // правила доступа
    const accessRules = {
        warehouse: ["warehouse", "admin", "supervisor"],
        painting: ["painting", "admin"],
    };

    const tabConfig = {
        warehouse: {
            label: "Склад",
            icon: Package,
            color: "from-blue-500 to-cyan-500",
            bgColor: "from-blue-50 to-cyan-50",
        },
        painting: {
            label: "Покрасочная",
            icon: Palette,
            color: "from-purple-500 to-pink-500",
            bgColor: "from-purple-50 to-pink-50",
        }
    };

    const getRoleDisplayName = (role) => {
        const roleNames = {
            admin: "Администратор",
            warehouse: "Складской работник",
            painting: "Покрасочный работник",
            supervisor: "Супервизор"
        };
        return roleNames[role] || role;
    };

    const getRoleIcon = (role) => {
        if (role === "admin") return Shield;
        if (role === "supervisor") return Settings;
        return User;
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get("/auth/me/");
                const data = response.data;

                setUser({
                    role: data.role,
                    name: data.name || data.username || "Пользователь",
                    username: data.username
                });

                // выбираем первую доступную вкладку по роли
                if (accessRules.warehouse.includes(data.role)) {
                    setActiveTab("warehouse");
                } else if (accessRules.painting.includes(data.role)) {
                    setActiveTab("painting");
                } else {
                    setActiveTab(null);
                }
            } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
                setError("Не удалось загрузить данные пользователя");
                // Uncomment if you want to redirect to login
                // window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleRetry = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div
                            className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Home className="w-6 h-6 text-blue-600 animate-pulse"/>
                        </div>
                    </div>
                    <p className="text-gray-600 font-medium">Загрузка панели управления...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center"
                >
                    <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600"/>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <motion.button
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
                        onClick={handleRetry}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4"/>
                        <span>Попробовать снова</span>
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center"
                >
                    <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-600"/>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет доступа</h3>
                    <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
                </motion.div>
            </div>
        );
    }

    const canSeeWarehouse = accessRules.warehouse.includes(user.role);
    const canSeePainting = accessRules.painting.includes(user.role);
    const availableTabs = [];

    if (canSeeWarehouse) availableTabs.push("warehouse");
    if (canSeePainting) availableTabs.push("painting");

    const RoleIcon = getRoleIcon(user.role);

    return (
        <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-50">
            <div className="p-4">
                <PhotoCapture onSave={setPhotos}/>
            </div>
            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Home className="w-8 h-8 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Панель управления
                            </h1>
                            <p className="text-gray-600 mt-1">Добро пожаловать!</p>
                        </div>
                    </div>

                    {/* User Info */}
                    <motion.div
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        className="flex items-center space-x-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100"
                    >
                        <div className="p-2 bg-gray-100 rounded-xl">
                            <RoleIcon className="w-5 h-5 text-gray-600"/>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{getRoleDisplayName(user.role)}</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Tab Navigation */}
                {availableTabs.length > 1 && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.1}}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2"
                    >
                        <div className="flex space-x-2">
                            {availableTabs.map((tab) => {
                                const config = tabConfig[tab];
                                const Icon = config.icon;
                                const isActive = activeTab === tab;

                                return (
                                    <motion.button
                                        key={tab}
                                        whileHover={{scale: 1.02}}
                                        whileTap={{scale: 0.98}}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-200 flex-1 ${
                                            isActive
                                                ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5"/>
                                        <div className="text-left">
                                            <div className="font-semibold">{config.label}</div>
                                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                                {config.description}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab && (
                        <motion.div
                            key={activeTab}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.3}}
                            className="space-y-6"
                        >
                            {/* Tab Header */}
                            <div
                                className={`bg-gradient-to-r ${tabConfig[activeTab].bgColor} rounded-2xl p-6 border border-gray-100`}>
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`p-3 bg-gradient-to-r ${tabConfig[activeTab].color} rounded-2xl shadow-lg`}>
                                        {React.createElement(tabConfig[activeTab].icon, {className: "w-6 h-6 text-white"})}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{tabConfig[activeTab].label}</h2>
                                        <p className="text-gray-600">{tabConfig[activeTab].description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="space-y-6">
                                {activeTab === "warehouse" && canSeeWarehouse && <WarehouseInfo/>}
                                {activeTab === "painting" && canSeePainting && <PaintingInfo/>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No Access State */}
                {availableTabs.length === 0 && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="text-center py-12"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <Shield className="w-8 h-8 text-gray-400"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Нет доступных разделов</h3>
                                <p className="text-gray-500">Обратитесь к администратору для получения доступа</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}