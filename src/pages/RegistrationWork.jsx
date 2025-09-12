"use client"

import {useEffect, useState} from "react"
import {
    Package,
    ChevronDown,
    ChevronUp,
    Trash2,
    Plus,
    Sparkles,
    Send,
    CheckCircle,
    ArrowRight,
} from "lucide-react"
import {useParams} from "react-router-dom"
import api from "../api/axios"
import ScannerInput from "../components/Skaner"
import Toast from "../components/toast"
import {useNavigate} from "react-router-dom"

const RegistrationWork = () => {
    const {id} = useParams()
    const [request, setRequest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)
    const [isExpandedAtm, setIsExpandedAtm] = useState(false)
    const [scannedDevices, setScannedDevices] = useState([])
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [redirectProgress, setRedirectProgress] = useState(0)
    const [toast, setToast] = useState(null)
    const [Atm, setAtm] = useState([])

    const storageKey = `scanned_devices_${id}`

    const showToast = (message, type = "success") => {
        setToast({message, type})
    }

    const hideToast = () => {
        setToast(null)
    }

    useEffect(() => {
        const savedDevices = localStorage.getItem(storageKey)
        if (savedDevices) {
            try {
                setScannedDevices(JSON.parse(savedDevices))
            } catch (e) {
                console.error("Ошибка при загрузке сохраненных данных:", e)
            }
        }
    }, [storageKey])

    useEffect(() => {
        if (scannedDevices.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(scannedDevices))
        }
    }, [scannedDevices, storageKey])

    useEffect(() => {
        const fetchRequest = async () => {
            setLoading(true)
            setError("")

            try {
                const res = await api.get(`/requests-work/${id}/`)
                setRequest(res.data)
            } catch (err) {
                console.error("Ошибка при загрузке заявки:", err)
                setError("Не удалось загрузить данные заявки")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchRequest()
        }
    }, [id])

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
        AtmForPaintList()
    }, [])


    const handleNewScan = (code) => {
        if (!code.trim()) return

        // Проверяем — дубликат среди уже добавленных
        const isDuplicate = scannedDevices.some((device) => device.code === code)
        if (isDuplicate) {
            showToast("Это устройство уже было добавлено!", "error")
            return
        }

        // Проверяем — существует ли в списке банкоматов
        const existsInAtmList = Atm.some((item) => item.serial_number === code.trim())
        if (!existsInAtmList) {
            showToast("Такого ATM нет в заявке!", "error")
            return
        }

        // Если всё ок — добавляем
        const newDevice = {
            id: Date.now(),
            code: code.trim(),
            scannedAt: new Date().toISOString(),
            requestId: id,
        }

        setScannedDevices((prev) => [...prev, newDevice])
        showToast("Устройство успешно добавлено!")
    }

    const removeDevice = (deviceId) => {
        setScannedDevices((prev) => prev.filter((device) => device.id !== deviceId))
        showToast("Устройство удалено")
    }

    const clearAllDevices = () => {
        if (window.confirm("Очистить весь список устройств?")) {
            setScannedDevices([])
            localStorage.removeItem(storageKey)
            showToast("Список очищен")
        }
    }

    const animatedRedirect = () => {
        setIsRedirecting(true)

        // Анимация прогресса
        const duration = 2000 // 2 секунды
        const interval = 50
        const steps = duration / interval
        let currentStep = 0

        const progressInterval = setInterval(() => {
            currentStep++
            const progress = (currentStep / steps) * 100
            setRedirectProgress(progress)

            if (currentStep >= steps) {
                clearInterval(progressInterval)
                navigate("/registration")
            }
        }, interval)
    }

    const submitDevices = async () => {
        if (scannedDevices.length === 0) {
            showToast("Нет устройств для отправки!", "error")
            return
        }

        // Проверяем: все ли ATM добавлены
        const atmSerials = Atm.map((item) => item.serial_number)
        const scannedSerials = scannedDevices.map((device) => device.code)

        const notScanned = atmSerials.filter(serial => !scannedSerials.includes(serial))

        if (notScanned.length > 0) {
            showToast(`Не все устройства добавлены! Осталось: ${notScanned.join(", ")}`, "error")
            return
        }

        setIsSubmitting(true)

        try {
            const payload = {
                requestId: id,
                devices: scannedDevices.map((device) => ({
                    atm: device.code,
                })),
            }

            await api.post(`/atm-add/${id}/register-devices/`, payload)
            showToast("Данные успешно отправлены!")
            setScannedDevices([])
            localStorage.removeItem(storageKey)

            // Запускаем анимированный редирект
            setTimeout(() => {
                animatedRedirect()
            }, 1000)
        } catch (err) {
            console.error("Ошибка при отправке данных:", err)
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Ошибка отправки данных"
            showToast(errorMsg, "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getProgressPercentage = () => {
        if (!request) return 0
        return Math.min(Math.round((scannedDevices.length / request.quantity) * 100), 100)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 p-3 pb-20">
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl animate-pulse"></div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-4 space-y-4">
                        <div
                            className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse"></div>
                        <div
                            className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 flex items-center justify-center p-3 pb-20">
                <div
                    className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-rose-200/50 max-w-sm">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl shadow-lg mb-4">
                        <Package className="h-8 w-8 text-white"/>
                    </div>
                    <h3 className="text-xl font-bold text-rose-900 mb-2">Ошибка загрузки</h3>
                    <p className="text-rose-700">{error}</p>
                </div>
            </div>
        )
    }

    if (!request) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 flex items-center justify-center p-3 pb-20">
                <div
                    className="text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200/50 max-w-sm">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl shadow-lg mb-4">
                        <Package className="h-8 w-8 text-white"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Заявка не найдена</h3>
                    <p className="text-slate-600">Запрашиваемая заявка не существует</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-l-screen from-slate-50 via-violet-50/30 to-indigo-50 pb-20 relative">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast}/>}

            {/* Анимированный оверлей редиректа */}
            {isRedirecting && (
                <div
                    className="fixed inset-0 z-50 bg-gradient-to-br from-violet-600/95 via-purple-600/95 to-indigo-600/95 backdrop-blur-xl flex items-center justify-center">
                    {/* Декоративные элементы */}
                    <div
                        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
                    <div
                        className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl animate-pulse"
                        style={{animationDelay: "1s"}}
                    ></div>

                    <div className="text-center text-white max-w-sm mx-auto px-6">
                        {/* Анимированная иконка успеха */}
                        <div className="relative mb-8">
                            <div
                                className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30 shadow-2xl">
                                <CheckCircle className="w-12 h-12 text-white animate-pulse"/>
                            </div>
                            <div
                                className="absolute inset-0 w-24 h-24 bg-emerald-400/30 rounded-full mx-auto animate-ping"></div>
                        </div>

                        {/* Заголовок */}
                        <div
                            className="opacity-0 translate-y-5 transition-all duration-600 ease-out"
                            style={{
                                opacity: 1,
                                transform: "translateY(0px)",
                                transitionDelay: "0ms",
                            }}
                        >
                            <h2 className="text-2xl font-bold mb-3">Успешно отправлено!</h2>
                        </div>

                        <div
                            className="opacity-0 translate-y-5 transition-all duration-600 ease-out"
                            style={{
                                opacity: 1,
                                transform: "translateY(0px)",
                                transitionDelay: "300ms",
                            }}
                        >
                            <p className="text-white/80 mb-8">Переходим к списку заявок...</p>
                        </div>

                        {/* Прогресс-бар */}
                        <div className="relative mb-6">
                            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-100 ease-out shadow-lg relative"
                                    style={{width: `${redirectProgress}%`}}
                                >
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-white/60 mt-2">
                                <span>Обработка...</span>
                                <span>{Math.round(redirectProgress)}%</span>
                            </div>
                        </div>

                        {/* Анимированная стрелка */}
                        <div className="flex items-center justify-center gap-2 text-white/80 animate-bounce">
                            <span className="text-sm">Переход</span>
                            <ArrowRight className="w-4 h-4"/>
                        </div>
                    </div>

                    {/* Анимированные частицы */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white/20 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animation: `float-${i} ${3 + Math.random() * 2}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 3}s`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
                {/* Компактный Header */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-violet-200/50 shadow-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent truncate">
                                Оприходование
                            </h1>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-violet-600 font-medium">#{request.request_id}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-indigo-600 font-medium truncate">{request.project}</span>
                            </div>
                        </div>
                    </div>

                    {/* Компактный прогресс */}
                    {scannedDevices.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Прогресс</span>
                                <span className="font-bold text-violet-600">
                  {scannedDevices.length}/{request.quantity} ({getProgressPercentage()}%)
                </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{width: `${getProgressPercentage()}%`}}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Компактная информация о заявке */}
                <div
                    className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-600"/>
                            <span className="font-semibold text-slate-900">Детали заявки</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </button>

                    {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-200/50">
                            <div className="grid grid-cols-2 gap-3 pt-3">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 font-medium">Устройство</p>
                                    <p className="text-sm font-semibold text-slate-900">{request.device}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 font-medium">Количество</p>
                                    <p className="text-sm font-semibold text-slate-900">{request.quantity} шт.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                    <button
                        onClick={() => setIsExpandedAtm(!isExpandedAtm)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-600"/>
                            <span className="font-semibold text-slate-900">Устройства</span>
                        </div>
                        {isExpandedAtm ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                    </button>

                    {isExpandedAtm && (
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Компактный сканер */}
                <div
                    className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-200/50">
                        <div className="flex items-center gap-3">
                            <Plus className="w-5 h-5 text-emerald-600"/>
                            <span className="font-semibold text-slate-900">Добавление устройств</span>
                        </div>
                    </div>
                    <div className="p-4">
                        <ScannerInput onScan={handleNewScan} allowManualInput={true}/>
                    </div>
                </div>

                {/* Компактный список устройств */}
                {scannedDevices.length > 0 && (
                    <div
                        className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-200/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600"/>
                                <span className="font-semibold text-slate-900">Устройства</span>
                                <span
                                    className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded-full">
                  {scannedDevices.length}
                </span>
                            </div>
                            <button onClick={clearAllDevices}
                                    className="text-rose-600 hover:text-rose-700 text-sm font-medium">
                                Очистить
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Компактный список */}
                            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                                {scannedDevices.map((device, index) => (
                                    <div
                                        key={device.id}
                                        className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-200/50 hover:bg-violet-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div
                                                className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-900 truncate">{device.code}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(device.scannedAt).toLocaleTimeString("ru-RU", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeDevice(device.id)}
                                            className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Компактная кнопка отправки */}
                            <div
                                className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-xl p-4 border border-violet-200/50">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-900 text-sm">Готово к отправке</p>
                                        <p className="text-xs text-slate-600">
                                            {scannedDevices.length} устройств
                                            {request && scannedDevices.length < request.quantity && (
                                                <span className="text-amber-600 block">
                          ⚠️ {scannedDevices.length}/{request.quantity}
                        </span>
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        onClick={submitDevices}
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all duration-300 shadow-lg text-sm flex-shrink-0"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div
                                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span className="hidden sm:inline">Отправка...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4"/>
                                                <span className="hidden sm:inline">Отправить</span>
                                                <span className="sm:hidden">({scannedDevices.length})</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RegistrationWork
