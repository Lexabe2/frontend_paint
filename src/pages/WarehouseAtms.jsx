import {useEffect, useState} from "react";
import {Package, AlertCircle, PlusCircle, X, Warehouse, FileText, Calendar, Hash, Building2, Clock, CheckCircle2, Loader2, CreditCard} from "lucide-react";
import api from "../api/axios";

export default function WarehouseAtms() {
    const [atms, setAtms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [countAtmData, setCountAtmData] = useState(0);
    const [countAtm, setCountAtm] = useState(0);
    const [projectData, setProjectData] = useState([]);
    const [req, setReq] = useState(0);
    const [creating, setCreating] = useState(false);

    // Загрузка банкоматов и данных проектов
    const fetchAtms = async () => {
        try {
            setLoading(true);
            const res = await api.get("/atms/warehouse/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
            });

            const atmsData = Array.isArray(res.data.atms) ? res.data.atms : [];
            setAtms(atmsData);
            setCountAtmData(res.data.count);
            setReq(res.data.last_request);
            setProjectData(Array.isArray(res.data.project_data) ? res.data.project_data : []);
        } catch (err) {
            console.error("Ошибка при загрузке банкоматов:", err);
            setError("Не удалось загрузить данные с сервера");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAtms();
    }, []);

    const handleChangeCount = (e) => {
        let value = parseInt(e.target.value, 10);

        if (isNaN(value) || value < 1) {
            value = 0;
        } else if (value > countAtmData) {
            value = countAtmData;
        }

        setCountAtm(value);
    };

    // Создание заявки
    const handleCreateRequest = async () => {
        if (!selectedProject.trim() || countAtm <= 0) {
            alert("Пожалуйста, заполните все поля");
            return;
        }

        try {
            setCreating(true);
            const payload = {
                project: selectedProject,
                device: "Hyosung",
                quantity: countAtm,
                status: 'На согласование(покрасочная)'
            };

            await api.post("/requests/", payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
            });

            alert("Заявка создана успешно!");
            setIsModalOpen(false);
            setSelectedProject("");
            setCountAtm(0);
            fetchAtms();
        } catch (err) {
            console.error("Ошибка при создании заявки:", err);
            alert("Не удалось создать заявку");
        } finally {
            setCreating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'на складе':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'в работе':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'готов':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Warehouse className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Склад банкоматов</h1>
                            <p className="text-gray-600">Управление устройствами на складе</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Создать заявку</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Всего на складе</p>
                            <p className="text-2xl font-bold text-gray-900">{atms.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Доступно</p>
                            <p className="text-2xl font-bold text-gray-900">{countAtmData}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Последняя заявка</p>
                            <p className="text-2xl font-bold text-gray-900">#{req}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-2xl border border-gray-100">
                        <button
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Создать заявку</h3>
                            <p className="text-gray-600">Заполните данные для новой заявки</p>
                        </div>

                        <div className="space-y-6">
                            {/* Количество */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <Hash className="w-4 h-4 text-gray-500" />
                                    <span>Количество устройств</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Введите количество"
                                        value={countAtm}
                                        max={countAtmData}
                                        min={1}
                                        onChange={handleChangeCount}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <Hash className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Доступно: {countAtmData}</span>
                                    <span className="text-blue-600 font-medium">Остается: {countAtmData - countAtm}</span>
                                </div>
                            </div>

                            {/* Номер заявки */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span>Номер заявки</span>
                                </label>
                                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-purple-800">#{req}</p>
                                            <p className="text-sm text-purple-600">Автоматически присвоенный номер</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Проект */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <span>Проект</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Выберите или введите проект"
                                        list="projects-list"
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <datalist id="projects-list">
                                    {projectData.map((proj, idx) => (
                                        <option
                                            key={idx}
                                            value={proj.project}
                                        >
                                            {`${proj.project} — Дедлайн: ${proj.deadlines || "-"} дней — ${proj.comments || ""}`}
                                        </option>
                                    ))}
                                </datalist>
                                {projectData.length > 0 && (
                                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                                        <p className="font-medium mb-1">Доступные проекты:</p>
                                        <div className="space-y-1">
                                            {projectData.slice(0, 3).map((proj, idx) => (
                                                <div key={idx} className="flex items-center space-x-2">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span>{proj.project}</span>
                                                    {proj.deadlines && (
                                                        <span className="text-orange-600">({proj.deadlines} дней)</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Кнопка создания */}
                            <button
                                onClick={handleCreateRequest}
                                disabled={creating || !selectedProject.trim() || countAtm <= 0}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Создание заявки...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Создать заявку</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-gray-600 font-medium">Загрузка данных...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-200">
                    <div className="flex items-center space-x-3 text-red-600">
                        <AlertCircle className="w-6 h-6" />
                        <div>
                            <h3 className="font-semibold">Ошибка загрузки</h3>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <Package className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Список устройств</h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {atms.length} устройств
                            </span>
                        </div>
                    </div>

                    {/* Table Content */}
                    {atms.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                                <div className="flex items-center space-x-2">
                                                    <Hash className="w-4 h-4 text-gray-500" />
                                                    <span>Серийный номер</span>
                                                </div>
                                            </th>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                                <div className="flex items-center space-x-2">
                                                    <Package className="w-4 h-4 text-gray-500" />
                                                    <span>Модель</span>
                                                </div>
                                            </th>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                                <div className="flex items-center space-x-2">
                                                    <Warehouse className="w-4 h-4 text-gray-500" />
                                                    <span>Паллет</span>
                                                </div>
                                            </th>
                                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle2 className="w-4 h-4 text-gray-500" />
                                                    <span>Статус</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {atms.map((atm, index) => (
                                            <tr key={atm.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                                                        </div>
                                                        <span className="font-mono text-gray-900 font-medium">{atm.serial_number}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-gray-900 font-medium">{atm.model}</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Package className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-900 font-medium">{atm.pallet}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(atm.status)}`}>
                                                        <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                                                        {atm.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4 p-4">
                                {atms.map((atm, index) => (
                                    <div key={atm.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        {/* Header with number and status */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                                                </div>
                                                <span className="text-sm text-gray-500 font-medium">Устройство #{index + 1}</span>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(atm.status)}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current mr-1"></div>
                                                {atm.status}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-3">
                                            {/* Serial Number */}
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Hash className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 font-medium">Серийный номер</p>
                                                    <p className="font-mono text-gray-900 font-semibold">{atm.serial_number}</p>
                                                </div>
                                            </div>

                                            {/* Model */}
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 font-medium">Модель</p>
                                                    <p className="text-gray-900 font-semibold">{atm.model}</p>
                                                </div>
                                            </div>

                                            {/* Pallet */}
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 font-medium">Паллет</p>
                                                    <p className="text-gray-900 font-semibold">{atm.pallet}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет устройств на складе</h3>
                            <p className="text-gray-600">Устройства появятся здесь после добавления на склад</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}