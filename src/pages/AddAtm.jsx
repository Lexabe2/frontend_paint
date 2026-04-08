import React, {useEffect, useState} from "react";
import {
    CreditCard, Calendar, Package, Hash, Scan, RefreshCw, Plus,
    AlertCircle, Paintbrush, CheckCircle, X, Barcode,
    QrCode, Layers, ChevronDown, HardDrive, CalendarDays,
    Save, Trash2, History
} from "lucide-react";
import api from "../api/axios";
import ScannerInput from "../components/Skaner";

export default function AddAtm({onSuccess}) {
    const [serialNumber, setSerialNumber] = useState("");
    const [model, setModel] = useState("");
    const today = new Date().toISOString().split("T")[0];
    const [acceptedAt, setAcceptedAt] = useState(today);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [palletNumber, setPalletNumber] = useState(null);
    const [modelList, setModelList] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [activeTab, setActiveTab] = useState("new");
    const [isCameraAvailable, setIsCameraAvailable] = useState(true);
    const [recentAtms, setRecentAtms] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    // Проверка доступности камеры
    useEffect(() => {
        const checkCamera = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasCamera = devices.some(device => device.kind === 'videoinput');
                setIsCameraAvailable(hasCamera);
            } catch {
                setIsCameraAvailable(false);
            }
        };
        checkCamera();
    }, []);

    useEffect(() => {
        if (modelList.length > 0 && !model) {
            setModel(modelList[0]); // ← первая модель по умолчанию
        }
    }, [modelList]);

    const resetForm = () => {
        setSerialNumber("");
        setModel("");
        setError("");
        setSuccess("");
        setFormErrors({});
        setResetKey(prev => prev + 1);
    };

    const validateForm = () => {
        const errors = {};

        if (!serialNumber.trim()) {
            errors.serialNumber = "Серийный номер обязателен";
        } else if (serialNumber.length < 5) {
            errors.serialNumber = "Минимум 5 символов";
        }

        if (!model.trim()) {
            errors.model = "Выберите модель";
        }

        if (!acceptedAt) {
            errors.acceptedAt = "Дата обязательна";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        const payload = {
            serial_number: serialNumber.trim().toUpperCase(),
            pallet: palletNumber,
            model: model.trim(),
            accepted_at: acceptedAt,
            reception: activeTab
        };

        setLoading(true);
        try {
            const res = await api.post("/atms/raw_create/", payload);
            resetForm();
            setSuccess(`✅ Банкомат ${serialNumber} успешно добавлен!`);
            await fetchAtms();
            await fetchRecentAtms();
            if (onSuccess) onSuccess(res.data);

            setTimeout(() => setSuccess(""), 5000);
        } catch (error) {
            console.error("Ошибка:", error);
            if (error.response?.data) {
                if (error.response.status === 409) {
                    setError("❌ Такой серийный номер уже существует");
                } else {
                    setError(JSON.stringify(error.response.data));
                }
            } else {
                setError("❌ Ошибка связи с сервером");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAtms = async () => {
        try {
            const res = await api.get("/atms/raw_create/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
            });
            setPalletNumber(res.data.pallet);
            setModelList(res.data.model);
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
        }
    };

    const fetchRecentAtms = async () => {
        try {
            const res = await api.get("/atms/recent/");
            setRecentAtms(res.data.slice(0, 5));
        } catch {
            console.warn("Не удалось загрузить последние ATM");
        }
    };

    useEffect(() => {
        fetchAtms();
        fetchRecentAtms();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                                Добавить банкомат
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Заполните информацию о новом устройстве
                            </p>
                        </div>

                        {/* Pallet Info */}
                        {palletNumber && (
                            <div className="bg-gray-50 rounded-2xl shadow-sm p-3 sm:p-4 border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Текущий паллет</p>
                                        <p className="text-lg sm:text-2xl font-bold text-green-700">PP{palletNumber}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div
                        className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start space-x-3 animate-slideDown">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                        <div className="flex-1">
                            <p className="text-sm sm:text-base text-red-700">{error}</p>
                        </div>
                        <button onClick={() => setError("")}
                                className="text-red-500 hover:text-red-700 transition-colors">
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {success && (
                    <div
                        className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-start space-x-3 animate-slideDown">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                        <div className="flex-1">
                            <p className="text-sm sm:text-base text-green-700">{success}</p>
                        </div>
                        <button onClick={() => setSuccess("")}
                                className="text-green-500 hover:text-green-700 transition-colors">
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Scanner Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"/>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Быстрое
                                        сканирование</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        {isCameraAvailable ? 'Используйте камеру или введите вручную' : 'Введите серийный номер вручную'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScanner(!showScanner)}
                                disabled={!isCameraAvailable}
                                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                    showScanner
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                } ${!isCameraAvailable && 'opacity-50 cursor-not-allowed'}`}
                            >
                                {showScanner ? 'Скрыть сканер' : 'Показать сканер'}
                            </button>
                        </div>

                        {showScanner && isCameraAvailable && (
                            <div className="mt-4 bg-white rounded-xl p-3 sm:p-4 border border-blue-200 animate-fadeIn">
                                <ScannerInput
                                    key={`scanner-${resetKey}`}
                                    onScan={(code) => {
                                        setSerialNumber(code);
                                        setShowScanner(false);
                                    }}
                                    onError={(err) => {
                                        console.warn("Ошибка сканера:", err);
                                        setError("Ошибка доступа к камере");
                                    }}
                                    allowManualInput={true}
                                    className="rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="p-4 sm:p-8">
                        {/* Tab Selector */}
                        <div className="mb-6 sm:mb-8">
                            <div className="bg-gray-100 p-1 rounded-2xl grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => setActiveTab("new")}
                                    className={`py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                                        activeTab === "new"
                                            ? "bg-white text-green-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                                    }`}
                                >
                                    <Layers className="w-3 h-3 sm:w-4 sm:h-4"/>
                                    <span>Новое устройство</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("paint")}
                                    className={`py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                                        activeTab === "paint"
                                            ? "bg-white text-red-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                                    }`}
                                >
                                    <Paintbrush className="w-3 h-3 sm:w-4 sm:h-4"/>
                                    <span>С покраски</span>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            {/* Serial Number */}
                            <div className="space-y-1 sm:space-y-2">
                                <label
                                    className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-gray-700">
                                    <Barcode className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500"/>
                                    <span>Серийный номер <span className="text-red-500">*</span></span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-blue-200 transition-all duration-200 placeholder-gray-400 ${
                                            formErrors.serialNumber
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                        placeholder="Введите серийный номер"
                                        inputMode="text"
                                        autoCapitalize="characters"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <HardDrive
                                            className={`w-3 h-3 sm:w-4 sm:h-4 ${formErrors.serialNumber ? 'text-red-400' : 'text-gray-400'}`}/>
                                    </div>
                                </div>
                                {formErrors.serialNumber && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>
                                        {formErrors.serialNumber}
                                    </p>
                                )}
                            </div>

                            {/* Model Selection */}
                            <div className="space-y-1 sm:space-y-2">
                                <label
                                    className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-gray-700">
                                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500"/>
                                    <span>Модель <span className="text-red-500">*</span></span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none ${
                                            formErrors.model
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        <option value="">Выберите модель</option>
                                        {modelList.map((m, idx) => (
                                            <option key={idx} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <div
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"/>
                                    </div>
                                </div>
                                {formErrors.model && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>
                                        {formErrors.model}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="space-y-1 sm:space-y-2">
                                <label
                                    className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-gray-700">
                                    <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500"/>
                                    <span>Дата приёмки <span className="text-red-500">*</span></span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={acceptedAt}
                                        onChange={(e) => setAcceptedAt(e.target.value)}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                                            formErrors.acceptedAt
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"/>
                                    </div>
                                </div>
                                {formErrors.acceptedAt && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>
                                        {formErrors.acceptedAt}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                    Очистить форму
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3 rounded-xl text-white font-semibold transition-all duration-200 text-sm sm:text-base ${
                                        activeTab === "new"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin"/>
                                            <span>Сохранение...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4"/>
                                            <span>
                                                {activeTab === "new" ? "Добавить устройство" : "Принять с покраски"}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Recent ATMs */}
                {recentAtms.length > 0 && (
                    <div className="mt-6 sm:mt-8">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-500"/>
                                Последние добавленные
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {recentAtms.map((atm, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-xs sm:text-sm font-semibold text-gray-900">{atm.serial_number}</p>
                                            <p className="text-xs text-gray-500 mt-1">{atm.model}</p>
                                        </div>
                                        <span
                                            className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {new Date(atm.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                /* Mobile optimizations */
                @media (max-width: 640px) {
                    input, select, button {
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}