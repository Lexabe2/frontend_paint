import React, {useEffect, useState} from "react";
import {CreditCard, Calendar, Package, Hash, Scan, RefreshCw, Plus, AlertCircle} from "lucide-react";
import api from "../api/axios";
import ScannerInput from "../components/Skaner"
import PhotoCapture from "../components/PhotoCapture.jsx";

export default function AddAtm({onSuccess}) {
    const [serialNumber, setSerialNumber] = useState("");
    const [model, setModel] = useState("");
    const [acceptedAt, setAcceptedAt] = useState("");
    const [requestId, setRequestId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [palletNumber, setPalletNumber] = useState(null);
    const [modelList, setModelList] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [photoData, setPhotoData] = useState({photos: [], comment: ""});


    const resetForm = () => {
        setSerialNumber("");
        setModel("");
        setAcceptedAt("");
        setRequestId("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!serialNumber.trim() || !model.trim() || !acceptedAt) {
            setError("Поля серийный номер, модель и дата обязательны.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                serial_number: serialNumber.trim(),
                pallet: palletNumber,
                model: model.trim(),
                accepted_at: acceptedAt,
                photos: photoData.photos,
                comment: photoData.comment
            };
            if (requestId.trim()) payload.request_id = requestId.trim();

            const res = await api.post(
                "/atms/raw_create/",
                payload,
                {}
            );

            resetForm();
            setPhotoData({ photos: [], comment: "" });
            await fetchAtms();
            if (onSuccess) onSuccess(res.data);
        } catch (error) {
            console.error("Ошибка при создании ATM:", error);
            if (error.response?.data) {
                setError(JSON.stringify(error.response.data));
            } else {
                setError("Ошибка связи с сервером");
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
            console.error("Ошибка при загрузке:", err);
        }
    };

// Внутри useEffect
    useEffect(() => {
        fetchAtms();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-8">
            {/* Header */}
            <PhotoCapture
                onSave={(data) => {
                    setPhotoData(data); // Сохраняем в состояние
                }}
            />
            <div className="text-center mb-8">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                    <CreditCard className="w-8 h-8 text-white"/>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Добавить банкомат</h2>
                <p className="text-gray-600">Заполните информацию о новом устройстве</p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Scanner Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Scan className="w-5 h-5 text-blue-600"/>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Сканирование серийного номера</h3>
                                <p className="text-sm text-gray-600">Используйте камеру или введите вручную</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowScanner(!showScanner)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                            {showScanner ? 'Скрыть сканер' : 'Показать сканер'}
                        </button>
                    </div>

                    {showScanner && (
                        <div className="bg-white rounded-2xl p-4 border border-blue-200">
                            <ScannerInput
                                onScan={(code) => setSerialNumber(code)}
                                onError={(err) => console.warn("Ошибка сканера:", err)}
                                allowManualInput={true}
                            />
                        </div>
                    )}
                </div>

                {/* Form Content */}
                <div className="p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h4 className="font-medium text-red-800">Ошибка</h4>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Serial Number */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <Hash className="w-4 h-4 text-gray-500"/>
                                <span>Серийный номер *</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                    placeholder="Введите серийный номер"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <Hash className="w-4 h-4 text-gray-400"/>
                                </div>
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <CreditCard className="w-4 h-4 text-gray-500"/>
                                <span>Модель *</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                                    required
                                >
                                    <option value="">Выберите модель</option>
                                    {modelList.map((m, idx) => (
                                        <option key={idx} value={m}>{m}</option>
                                    ))}
                                    <option value="__new__">Другая модель...</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </div>
                            </div>

                            {model === "__new__" && (
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        placeholder="Введите новую модель"
                                        value=""
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Pallet Info */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <Package className="w-4 h-4 text-gray-500"/>
                                <span>Паллет</span>
                            </label>
                            <div
                                className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-4 h-4 text-green-600"/>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-800">PP{palletNumber}</p>
                                        <p className="text-sm text-green-600">Текущий номер паллета</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-500"/>
                                <span>Дата приёмки *</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={acceptedAt}
                                    onChange={(e) => setAcceptedAt(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Calendar className="w-4 h-4 text-gray-400"/>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin"/>
                                        <span>Сохранение...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4"/>
                                        <span>Добавить банкомат</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                                Очистить
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Поля отмеченные * обязательны для заполнения
                </p>
            </div>
        </div>
    );
}