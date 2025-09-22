"use client"

import React, {useEffect, useState, useRef, useCallback} from "react"
import ScannerInput from "../components/Skaner"
import {useParams} from "react-router-dom"
import api from "../api/axios.js"
import PhotoCapture from "../components/PhotoCapture.jsx";
import {
    CheckCircle,
    AlertCircle,
    Trash2,
    Package,
    Scan,
    Clock,
    ArrowLeft,
    RefreshCw,
    Target,
    Zap
} from "lucide-react"

export default function ScannerPage() {
    const [lastScan, setLastScan] = useState(null)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const {id} = useParams()
    const [requests, setRequests] = useState([])
    const [Atm, setAtm] = useState([])
    const [loading, setLoading] = useState(false)
    const [deletingAtm, setDeletingAtm] = useState(null)
    const [scanningMode, setScanningMode] = useState(false)
    const [isPullToRefresh, setIsPullToRefresh] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const containerRef = useRef(null)
    const startY = useRef(0)
    const currentY = useRef(0)
    const isDragging = useRef(false)
    const [photoData, setPhotoData] = useState({photos: [], comment: ""});

    // Загружаем заявку
    const fetchCreatedRequests = async () => {
        setError("")
        setLoading(true)
        try {
            const res = await api.get(`/requests-list/?id=${id}`)
            setRequests(res.data)
        } catch (err) {
            console.error("Ошибка при загрузке заявок:", err)
            setError("Все заявки приняты или ошибка загрузки")
        } finally {
            setLoading(false)
        }
    }

    // Загружаем список банкоматов для покраски
    const AtmForPaintList = async () => {
        setError("")
        setLoading(true)
        try {
            const res = await api.get(`/atm_for_paint/`, {params: {request_id: id}})
            setAtm(res.data.atms)
        } catch (err) {
            console.error("Ошибка при загрузке банкоматов:", err)
            setError("Ошибка загрузки банкоматов")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCreatedRequests()
        AtmForPaintList()
    }, [])

    // Очистка уведомлений
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    // Pull-to-refresh functionality
    const handleTouchStart = useCallback((e) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY
            isDragging.current = true
        }
    }, [])

    const handleTouchMove = useCallback((e) => {
        if (!isDragging.current || window.scrollY > 0) return

        currentY.current = e.touches[0].clientY
        const distance = Math.max(0, currentY.current - startY.current)

        if (distance > 0) {
            e.preventDefault()
            const maxDistance = 120
            const normalizedDistance = Math.min(distance, maxDistance)
            setPullDistance(normalizedDistance)

            if (normalizedDistance >= 80) {
                setIsPullToRefresh(true)
            } else {
                setIsPullToRefresh(false)
            }
        }
    }, [])

    const handleTouchEnd = useCallback(async () => {
        if (!isDragging.current) return

        isDragging.current = false

        if (isPullToRefresh && pullDistance >= 80) {
            // Trigger refresh
            await handleRefresh()
        }

        // Reset states
        setPullDistance(0)
        setIsPullToRefresh(false)
    }, [isPullToRefresh, pullDistance])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('touchstart', handleTouchStart, {passive: false})
        container.addEventListener('touchmove', handleTouchMove, {passive: false})
        container.addEventListener('touchend', handleTouchEnd, {passive: false})

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    // Обработка сканирования
    const handleScan = async (code) => {
        setLastScan(code)
        setError("")
        setSuccess("")
        if (!code) return

        try {
            setLoading(true)
            setScanningMode(true)
            const res = await api.post("/atm_for_paint/", {sn: code, request_id: id, photos: photoData.photos,
                comment: photoData.comment})
            if (res.data.error) {
                setError(res.data.error)
            } else {
                setSuccess(`Банкомат ${code} успешно добавлен!`)
            }

            await AtmForPaintList()
        } catch (err) {
            console.error("Ошибка при добавлении банкомата:", err)
            setError(err.response?.data?.error || "Ошибка загрузки банкомата")
        } finally {
            setLoading(false)
            setScanningMode(false)
        }
    }

    // Удаление банкомата
    const handleDeleteAtm = async (serial_number) => {
        setError("")
        setSuccess("")
        setDeletingAtm(serial_number)
        try {
            await api.delete(`/atm_for_paint/`, {
                data: {
                    serial_number: serial_number,
                    request_id: id
                }
            })
            setSuccess(`Банкомат ${serial_number} удален`)
            await AtmForPaintList()
        } catch (err) {
            console.error("Ошибка при удалении банкомата:", err)
            setError(err.response?.data?.error || "Ошибка удаления банкомата")
        } finally {
            setDeletingAtm(null)
        }
    }

    const handleError = (err) => {
        console.error("Scanner error:", err)
        setError(err.message || "Ошибка сканера")
    }

    const handleRefresh = () => {
        fetchCreatedRequests()
        AtmForPaintList()
    }

    const getProgressPercentage = () => {
        if (!requests.length) return 0
        const totalQuantity = requests.reduce((sum, req) => sum + (req.quantity || 0), 0)
        return totalQuantity > 0 ? Math.round((Atm.length / totalQuantity) * 100) : 0
    }

    const isCompleted = () => {
        if (!requests.length) return false
        const totalQuantity = requests.reduce((sum, req) => sum + (req.quantity || 0), 0)
        return Atm.length >= totalQuantity
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 relative overflow-hidden"
            style={{
                transform: `translateY(${pullDistance * 0.5}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.3s ease-out'
            }}
        >
            {/* Pull-to-refresh indicator */}
            <div
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm border-b border-gray-200 transition-all duration-300"
                style={{
                    height: `${Math.min(pullDistance, 80)}px`,
                    opacity: pullDistance > 20 ? 1 : 0,
                    transform: `translateY(${pullDistance > 80 ? 0 : -80}px)`
                }}
            >
                <div className="flex items-center space-x-3">
                    <div className={`transition-transform duration-300 ${isPullToRefresh ? 'rotate-180' : ''}`}>
                        <RefreshCw className={`w-5 h-5 text-blue-600 ${isPullToRefresh ? 'animate-spin' : ''}`}/>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                        {isPullToRefresh ? 'Отпустите для обновления' : 'Потяните для обновления'}
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <PhotoCapture
                    onSave={(data) => {
                        setPhotoData(data); // Сохраняем в состояние
                    }}
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-white/80 rounded-xl transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600"/>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                Подготовка банкоматов
                            </h1>
                            <p className="text-gray-600 mt-1">Заявка №{id}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
                        <span className="hidden sm:inline">Обновить</span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${isCompleted() ? 'bg-green-100' : 'bg-blue-100'}`}>
                                {isCompleted() ?
                                    <CheckCircle className="w-6 h-6 text-green-600"/> :
                                    <Target className="w-6 h-6 text-blue-600"/>
                                }
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Прогресс выполнения</h3>
                                <p className="text-sm text-gray-600">
                                    {Atm.length} из {requests.reduce((sum, req) => sum + (req.quantity || 0), 0)} банкоматов
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{getProgressPercentage()}%</div>
                            {isCompleted() && (
                                <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4 mr-1"/>
                                    Завершено
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                                isCompleted() ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{width: `${getProgressPercentage()}%`}}
                        ></div>
                    </div>
                </div>

                {/* Notifications */}
                {success && (
                    <div
                        className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-in slide-in-from-top-5 duration-300">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0"/>
                        <p className="text-green-800 font-medium">{success}</p>
                    </div>
                )}

                {error && (
                    <div
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 animate-in slide-in-from-top-5 duration-300">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0"/>
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                {/* Request Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading && !requests.length ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <div className="flex items-center space-x-3">
                                <RefreshCw className="w-6 h-6 animate-spin text-blue-600"/>
                                <p className="text-gray-600 font-medium">Загрузка заявок...</p>
                            </div>
                        </div>
                    ) : requests && requests.length > 0 ? (
                        requests.map((request) => {
                            const maxReached = Atm.length >= request.quantity

                            return (
                                <div
                                    key={request.request_id}
                                    className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md ${
                                        lastScan === request.device ? "ring-2 ring-emerald-400 shadow-lg" : "border-gray-100"
                                    } ${maxReached ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : ""}`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`p-2 rounded-xl ${maxReached ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                    <Package
                                                        className={`w-5 h-5 ${maxReached ? 'text-green-600' : 'text-blue-600'}`}/>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {request.project || "Без проекта"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">ID: {request.request_id}</p>
                                                </div>
                                            </div>
                                            {maxReached && (
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle className="w-5 h-5"/>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Устройство:</span>
                                                <span
                                                    className="text-sm text-gray-900 font-medium">{request.device || "—"}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Количество:</span>
                                                <span
                                                    className="text-sm text-gray-900 font-medium">{request.quantity ?? "—"}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">Статус:</span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        request.status?.includes("принята")
                                                            ? "bg-green-100 text-green-700 border border-green-200"
                                                            : "bg-gray-100 text-gray-600 border border-gray-200"
                                                    }`}
                                                >
                                                    {request.status || "—"}
                                                </span>
                                            </div>
                                        </div>

                                        {!maxReached ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className="text-sm font-medium text-gray-600">Сканирование:</span>
                                                    <div className="flex items-center space-x-2">
                                                        {scanningMode && (
                                                            <div className="flex items-center space-x-2 text-blue-600">
                                                                <Zap className="w-4 h-4 animate-pulse"/>
                                                                <span className="text-xs">Обработка...</span>
                                                            </div>
                                                        )}
                                                        <Scan className="w-4 h-4 text-gray-400"/>
                                                    </div>
                                                </div>
                                                <ScannerInput
                                                    onScan={handleScan}
                                                    onError={handleError}
                                                    allowManualInput={true}
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-green-100 rounded-xl p-4 text-center">
                                                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2"/>
                                                <p className="text-green-800 font-medium">
                                                    Все банкоматы приняты
                                                </p>
                                                <p className="text-green-600 text-sm">
                                                    {Atm.length}/{request.quantity}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="p-4 bg-gray-100 rounded-full">
                                    <Clock className="w-8 h-8 text-gray-400"/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Заявок пока нет</h3>
                                    <p className="text-gray-500">Заявки появятся здесь после создания</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ATM List */}
                {Atm.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-xl">
                                        <Package className="w-6 h-6 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Принятые банкоматы</h2>
                                        <p className="text-gray-600">Всего: {Atm.length} устройств</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid gap-4">
                                {Atm.map((atm, index) => (
                                    <div
                                        key={atm.id}
                                        className="bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 animate-in slide-in-from-left-5"
                                        style={{animationDelay: `${index * 50}ms`}}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Модель: <span className="text-blue-600">{atm.model}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    S/N: <span className="font-mono">{atm.serial_number}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAtm(atm.serial_number)}
                                            disabled={deletingAtm === atm.serial_number}
                                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 hover:border-red-300"
                                        >
                                            {deletingAtm === atm.serial_number ? (
                                                <RefreshCw className="w-4 h-4 animate-spin"/>
                                            ) : (
                                                <Trash2 className="w-4 h-4"/>
                                            )}
                                            <span className="text-sm font-medium">Удалить</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}