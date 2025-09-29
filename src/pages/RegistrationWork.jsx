"use client"

import React, {useEffect, useState} from "react"
import {
    Package,
    ChevronDown,
    ChevronUp,
    Trash2,
    Sparkles,
    Send,
    CheckCircle,
    ArrowRight,
    QrCode,
    AlertCircle,
    Target,
    Clock,
    CheckCircle2,
    X
} from "lucide-react"
import {useParams} from "react-router-dom"
import api from "../api/axios"
import ScannerInput from "../components/Skaner"
import Toast from "../components/toast"
import {useNavigate} from "react-router-dom"
import PhotoCapture from "../components/PhotoCapture.jsx";
import PhotoModal from "../components/PhotoModal.jsx";

const RegistrationWork = () => {
    const {id} = useParams()
    const [request, setRequest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)
    const [scannedDevices, setScannedDevices] = useState([])
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [redirectProgress, setRedirectProgress] = useState(0)
    const [toast, setToast] = useState(null)
    const [Atm, setAtm] = useState([])
    const [photoData, setPhotoData] = useState({photos: [], comment: ""});

    const storageKey = `scanned_devices_${id}`

    const showToast = (message, type = "success") => {
        setToast({message, type})
    }

    const hideToast = () => {
        setToast(null)
    }

    // Load saved devices from localStorage
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

    // Save devices to localStorage
    useEffect(() => {
        if (scannedDevices.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(scannedDevices))
        }
    }, [scannedDevices, storageKey])

    // Fetch request data
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

    // Fetch ATM list
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

        const isDuplicate = scannedDevices.some((device) => device.code === code)
        if (isDuplicate) {
            showToast("Это устройство уже было добавлено!", "error")
            return
        }

        const existsInAtmList = Atm.some((item) => item.serial_number === code.trim())
        if (!existsInAtmList) {
            showToast("Такого ATM нет в заявке!", "error")
            return
        }

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
        const duration = 1500
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
                photos: photoData.photos,
                comment: photoData.comment,
                devices: scannedDevices.map((device) => ({
                    atm: device.code,
                })),
            }

            await api.post(`/atm-add/${id}/register-devices/`, payload)
            showToast("Данные успешно отправлены!")
            setScannedDevices([])
            localStorage.removeItem(storageKey)

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
        if (!Atm.length) return 0
        return Math.min(Math.round((scannedDevices.length / Atm.length) * 100), 100)
    }

    const getDeviceStatus = (serialNumber) => {
        return scannedDevices.some(device => device.code === serialNumber) ? 'scanned' : 'pending'
    }

    const getRemainingDevices = () => {
        const scannedSerials = scannedDevices.map(device => device.code)
        return Atm.filter(atm => !scannedSerials.includes(atm.serial_number))
    }

    const isAllDevicesScanned = () => {
        return Atm.length > 0 && scannedDevices.length === Atm.length
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 p-4 pb-20">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center animate-pulse">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse"></div>
                                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse w-3/4"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl p-6">
                        <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 flex items-center justify-center p-4 pb-20">
                <div className="text-center bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-rose-200/50 max-w-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl shadow-lg mb-6">
                        <AlertCircle className="h-8 w-8 text-white"/>
                    </div>
                    <h3 className="text-xl font-bold text-rose-900 mb-3">Ошибка загрузки</h3>
                    <p className="text-rose-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors"
                    >
                        Обновить страницу
                    </button>
                </div>
            </div>
        )
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 flex items-center justify-center p-4 pb-20">
                <div className="text-center bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-200/50 max-w-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl shadow-lg mb-6">
                        <Package className="h-8 w-8 text-white"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Заявка не найдена</h3>
                    <p className="text-slate-600">Запрашиваемая заявка не существует</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 pb-20 relative">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast}/>}

            {/* Success Redirect Overlay */}
            {isRedirecting && (
                <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-600/95 via-teal-600/95 to-cyan-600/95 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center text-white max-w-sm mx-auto px-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30 shadow-2xl mb-6">
                            <CheckCircle className="w-10 h-10 text-white"/>
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Готово!</h2>
                        <p className="text-white/80 mb-6">Данные успешно отправлены</p>

                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-100"
                                style={{width: `${redirectProgress}%`}}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2 text-white/80">
                            <span className="text-sm">Переходим к списку заявок</span>
                            <ArrowRight className="w-4 h-4 animate-pulse"/>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Header with Request Info */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-violet-200/50 shadow-xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Оприходование устройств
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Заявка:</span>
                                    <span className="text-violet-600 font-bold">#{request.request_id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Проект:</span>
                                    <span className="text-indigo-600 font-medium">{request.project}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Устройство:</span>
                                    <span className="text-slate-900 font-medium">{request.device}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200/50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-violet-600"/>
                                <span className="font-semibold text-slate-900">Прогресс выполнения</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-violet-600">
                                    {scannedDevices.length}/{Atm.length}
                                </div>
                                <div className="text-sm text-slate-500">устройств</div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700 ease-out relative"
                                    style={{width: `${getProgressPercentage()}%`}}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                                {getProgressPercentage()}% завершено
                            </span>
                            {isAllDevicesScanned() ? (
                                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                    <CheckCircle2 className="w-4 h-4"/>
                                    <span>Все устройства добавлены!</span>
                                </div>
                            ) : (
                                <span className="text-amber-600 font-medium">
                                    Осталось: {getRemainingDevices().length}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scanner Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-200/50">
                        <div className="flex items-center gap-3 mb-2">
                            <QrCode className="w-6 h-6 text-emerald-600"/>
                            <span className="text-lg font-bold text-slate-900">Сканирование устройств</span>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Отсканируйте QR-код или введите серийный номер устройства вручную
                        </p>
                    </div>

                    <div className="p-6">
                        <ScannerInput onScan={handleNewScan} allowManualInput={true}/>
                    </div>
                </div>

                {/* Device List Section */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-200/50">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-blue-600"/>
                                <span className="text-lg font-bold text-slate-900">Список устройств</span>
                                <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                                    {Atm.length}
                                </span>
                            </div>
                            <div className="p-2 rounded-full group-hover:bg-slate-100 transition-colors">
                                {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                            </div>
                        </button>
                    </div>

                    {isExpanded && (
                        <div className="p-6 max-h-80 overflow-y-auto">
                            <div className="space-y-3">
                                {Atm.map((atm, index) => {
                                    const status = getDeviceStatus(atm.serial_number)
                                    return (
                                        <div
                                            key={atm.id}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                status === 'scanned' 
                                                    ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                        status === 'scanned'
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-slate-300 text-slate-600'
                                                    }`}>
                                                        {status === 'scanned' ? <CheckCircle2 className="w-5 h-5"/> : index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {atm.model}
                                                        </p>
                                                        <p className="text-sm text-slate-600 font-mono">
                                                            {atm.serial_number}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {status === 'scanned' ? (
                                                        <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                                                            <CheckCircle className="w-4 h-4"/>
                                                            <span>Добавлено</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                                                            <Clock className="w-4 h-4"/>
                                                            <span>Ожидает</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Scanned Devices List */}
                {scannedDevices.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-200/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-violet-600"/>
                                <span className="text-lg font-bold text-slate-900">Отсканированные устройства</span>
                                <span className="bg-violet-100 text-violet-700 text-sm font-bold px-3 py-1 rounded-full">
                                    {scannedDevices.length}
                                </span>
                            </div>
                            {scannedDevices.length > 1 && (
                                <button
                                    onClick={clearAllDevices}
                                    className="flex items-center gap-2 text-rose-600 hover:text-rose-700 text-sm font-medium hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                    <span>Очистить все</span>
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                                {scannedDevices.map((device, index) => (
                                    <div
                                        key={device.id}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/50 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-slate-900 truncate">{device.code}</p>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Clock className="w-3 h-3"/>
                                                    <span>
                                                        {new Date(device.scannedAt).toLocaleTimeString("ru-RU", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <PhotoCapture
                                                onSave={(data) => setPhotoData(data)}
                                                status="Принят в покрасочную"
                                                sn={device.code}
                                                bt="True"
                                            />
                                            <PhotoModal atmId={device.code}/>
                                            <button
                                                onClick={() => removeDevice(device.id)}
                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                                                title="Удалить устройство"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit Section */}
                            <div className={`bg-gradient-to-r rounded-2xl p-6 border-2 transition-all duration-300 ${
                                isAllDevicesScanned() 
                                    ? 'from-emerald-50 to-teal-50 border-emerald-200'
                                    : 'from-amber-50 to-orange-50 border-amber-200'
                            }`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {isAllDevicesScanned() ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-600"/>
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-amber-600"/>
                                            )}
                                            <h3 className={`font-bold ${
                                                isAllDevicesScanned() ? 'text-emerald-900' : 'text-amber-900'
                                            }`}>
                                                {isAllDevicesScanned() ? 'Готово к отправке!' : 'Требуется действие'}
                                            </h3>
                                        </div>

                                        <p className={`text-sm ${
                                            isAllDevicesScanned() ? 'text-emerald-700' : 'text-amber-700'
                                        }`}>
                                            {isAllDevicesScanned()
                                                ? `Все ${scannedDevices.length} устройств добавлены и готовы к отправке`
                                                : `Добавлено ${scannedDevices.length} из ${Atm.length} устройств`
                                            }
                                        </p>

                                        {!isAllDevicesScanned() && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Для отправки необходимо добавить все устройства
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={submitDevices}
                                        disabled={isSubmitting || !isAllDevicesScanned()}
                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg text-white ${
                                            isAllDevicesScanned() && !isSubmitting
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl'
                                                : 'bg-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Отправка...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5"/>
                                                <span>Отправить</span>
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