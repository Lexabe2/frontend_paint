import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import api from "../api/axios";
import PhotoCapture from "../components/PhotoCapture.jsx";
import PhotoModal from "../components/PhotoModal.jsx";
import { useNavigate } from "react-router-dom";

export default function OTL() {
    const {query} = useParams();
    const [atm, setAtm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openSection, setOpenSection] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Состояния анкеты
    const [selectedOption, setSelectedOption] = useState({});
    const [uploadedPhotos, setUploadedPhotos] = useState({});
    const [photoData, setPhotoData] = useState({photos: [], comment: ""});
    const [photoUploaded, setPhotoUploaded] = useState(false);

    // Пользователь
    const [user, setUser] = useState(null);
    const [isLockedByOther, setIsLockedByOther] = useState(false);
    const [lockedBy, setLockedBy] = useState(null);

    // Загружаем данные банкомата
    useEffect(() => {
        const fetchData = async () => {
            if (atm) return;
            setLoading(true);
            setError("");
            try {
                const res = await api.get("/otk/", {params: {query}});
                setAtm(res.data.atms[0] || null);
            } catch (err) {
                console.error("Ошибка при загрузке:", err);
                setError("Не удалось загрузить данные банкомата. Проверьте подключение к интернету.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query, atm]);

    // Загружаем текущего пользователя
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });
                const data = response.data;
                const initials = data.full_name
                    .split(" ")
                    .map((word) => word[0])
                    .join("");

                setUser({
                    name: data.full_name,
                    username: data.username,
                    avatar: initials,
                    role: data.role,
                    status: "online",
                });
            } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
                window.location.href = "/login";
            }
        };
        fetchUser();
    }, []);

    // Восстановление состояния из localStorage
    useEffect(() => {
        if (atm?.serial_number) {
            const saved = localStorage.getItem(`progress_${atm.serial_number}`);
            if (saved) {
                const state = JSON.parse(saved);
                setSelectedOption(state.selectedOption || {});
                setUploadedPhotos(state.uploadedPhotos || {});
                setPhotoData(state.photoData || {photos: [], comment: ""});
            }
        }
    }, [atm]);

    // Сохраняем состояние в localStorage
    useEffect(() => {
        if (atm?.serial_number) {
            const state = {selectedOption, uploadedPhotos, photoData};
            localStorage.setItem(`progress_${atm.serial_number}`, JSON.stringify(state));
        }
    }, [selectedOption, uploadedPhotos, photoData, atm]);

    // Логика блокировки заявки по username
    useEffect(() => {
        if (atm?.serial_number && user) {
            const lockKey = `lock_${atm.serial_number}`;
            const lock = localStorage.getItem(lockKey);

            if (!lock) {
                localStorage.setItem(lockKey, JSON.stringify(user));
            } else {
                const lockedBy = JSON.parse(lock);
                if (lockedBy.username !== user.username) {
                    setIsLockedByOther(true);
                    setLockedBy(lockedBy);
                }
            }
        }
    }, [atm, user]);

    const accordionData = [
        {title: "Лицевая", items: [{id: "lic_g", label: "Замечаний нет"}, {id: "lic_b", label: "Есть замечания"}]},
        {
            title: "Бок (лево)",
            items: [{id: "bok_l_g", label: "Замечаний нет"}, {id: "bok_l_b", label: "Есть замечания"}]
        },
        {
            title: "Бок (право)",
            items: [{id: "bok_r_g", label: "Замечаний нет"}, {id: "bok_r_b", label: "Есть замечания"}]
        },
        {
            title: "Задняя часть",
            items: [{id: "back_g", label: "Замечаний нет"}, {id: "back_b", label: "Есть замечания"}]
        },
        {
            title: "Внутренняя часть",
            items: [{id: "internal_g", label: "Замечаний нет"}, {id: "internal_b", label: "Есть замечания"}]
        },
    ];

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const handleRadioChange = (section, id) => {
        setSelectedOption({...selectedOption, [section]: id});
    };

    const allSelected = Object.keys(selectedOption).length === accordionData.length;
    const allNoIssues = accordionData.every(
        (block) =>
            selectedOption[block.title] &&
            block.items.find((i) => i.id === selectedOption[block.title])?.label === "Замечаний нет"
    );

    const completedSections = Object.keys(selectedOption).length;
    const totalSections = accordionData.length;
    const progressPercentage = (completedSections / totalSections) * 100;

    // Функция отправки на сервер
    const handleSend = async () => {
        setSubmitting(true);
        const payload = {
            atmSerial: atm.serial_number,
            hasIssues: !allNoIssues,
            sections: accordionData.map((block) => ({
                title: block.title,
                status: selectedOption[block.title] || null,
                label: block.items.find((i) => i.id === selectedOption[block.title])?.label || null,
            })),
        };

        try {
            await api.post("/otk/", payload);
            // Очищаем сохраненное состояние после успешной отправки
            localStorage.removeItem(`progress_${atm.serial_number}`);
            localStorage.removeItem(`lock_${atm.serial_number}`);
            navigate(-1)
            alert("Данные отправлены успешно!");
        } catch (err) {
            console.error("Ошибка при отправке:", err);
            alert("Ошибка при отправке данных. Попробуйте еще раз.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Загрузка данных</h3>
                    <p className="text-gray-600 text-center">Получаем информацию о банкомате...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-red-600 mb-4 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 text-center mb-2">Ошибка загрузки</h3>
                    <p className="text-red-600 text-center mb-6">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    // Not Found State
    if (!atm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-gray-400 mb-4 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2.306"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Банкомат не найден</h3>
                    <p className="text-gray-600 text-center">Проверьте правильность серийного номера</p>
                </div>
            </div>
        );
    }

    // Locked State
    if (isLockedByOther) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-amber-600 mb-4 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-amber-800 text-center mb-2">Заявка заблокирована</h3>
                    <p className="text-amber-700 text-center mb-2">
                        Заявка редактируется пользователем:
                    </p>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div
                                className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-semibold mr-3">
                                {lockedBy?.name?.split(" ").map(word => word[0]).join("")}
                            </div>
                            <div>
                                <p className="font-semibold text-amber-800">{lockedBy?.name}</p>
                                <p className="text-sm text-amber-600">@{lockedBy?.username}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const CheckIcon = () => (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
        </svg>
    );

    const AlertIcon = () => (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
    );

    const ChevronIcon = ({isOpen}) => (
        <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none"
             stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
    );

    const CameraIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
    );

    return (
        <div className="min-h-screen from-gray-50 to-blue-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Контроль качества</h1>
                    <p className="text-gray-600">Проверка банкомата перед передачей</p>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Прогресс проверки</h3>
                        <span className="text-sm font-medium text-gray-600">
                            {completedSections} из {totalSections} разделов
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{width: `${progressPercentage}%`}}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500">
                        {allSelected ? "Все разделы заполнены" : `Осталось заполнить ${totalSections - completedSections} разделов`}
                    </p>
                </div>

                {/* ATM Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    {/* Заголовок */}
                    <button
                        className="flex items-center justify-between w-full p-6"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <h2 className="text-xl font-bold text-gray-900">Информация</h2>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isOpen ? "bg-blue-500" : "bg-green-500"}`}></div>
                            <span className="text-sm text-gray-600">{isOpen ? "Свернуть" : "Активен"}</span>
                        </div>
                    </button>

                    {/* Содержимое */}
                    {isOpen && (
                        <div className="px-6 pb-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 mb-4">
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-32">Серийный номер:</span>
                                        <span
                                            className="font-mono font-semibold text-gray-900">{atm.serial_number}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-32">Модель:</span>
                                        <span className="font-semibold text-gray-900">{atm.model}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-500 w-32">Паллета:</span>
                                        <span className="font-mono text-gray-900">{atm.pallet || "Не указана"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <PhotoModal atmId={atm.serial_number}/>
                            </div>
                        </div>
                    )}
                </div>

                {/* Inspection Sections */}
                <div className="space-y-4 mb-6">
                    {accordionData.map((block, index) => {
                        const isSelected = selectedOption[block.title];
                        const hasIssues = isSelected && block.items.find(i => i.id === isSelected)?.label === "Есть замечания";
                        const isPhotoUploaded = uploadedPhotos[block.title];
                        const needsPhoto = hasIssues && !isPhotoUploaded;

                        return (
                            <div key={block.title}
                                 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    className={`w-full text-left p-6 hover:bg-gray-50 transition-colors ${
                                        openSection === block.title ? 'bg-gray-50' : ''
                                    }`}
                                    onClick={() => toggleSection(block.title)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
                                                {isSelected && (
                                                    <p className={`text-sm mt-1 ${hasIssues ? 'text-red-600' : 'text-green-600'}`}>
                                                        {block.items.find(i => i.id === isSelected)?.label}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {isSelected && (
                                                <div className="flex items-center space-x-2">
                                                    {hasIssues ? <AlertIcon/> : <CheckIcon/>}
                                                    {hasIssues && (
                                                        <div className="flex items-center space-x-1">
                                                            <CameraIcon/>
                                                            <span
                                                                className={`text-xs ${isPhotoUploaded ? 'text-green-600' : 'text-red-600'}`}>
                                                                {isPhotoUploaded ? 'Загружено' : 'Требуется'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <ChevronIcon isOpen={openSection === block.title}/>
                                        </div>
                                    </div>
                                </button>

                                {openSection === block.title && (
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <div className="pt-4 space-y-4">
                                            {block.items.map((item) => (
                                                <label key={item.id}
                                                       className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={block.title}
                                                        value={item.id}
                                                        checked={selectedOption[block.title] === item.id}
                                                        onChange={() => handleRadioChange(block.title, item.id)}
                                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <span className="text-gray-900 font-medium">{item.label}</span>
                                                    {selectedOption[block.title] === item.id && item.label === "Замечаний нет" && (
                                                        <CheckIcon/>
                                                    )}
                                                    {selectedOption[block.title] === item.id && item.label === "Есть замечания" && (
                                                        <AlertIcon/>
                                                    )}
                                                </label>
                                            ))}

                                            {/* Photo Upload Section */}
                                            {hasIssues && (
                                                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                                    <div className="flex items-center mb-3">
                                                        <CameraIcon/>
                                                        <h4 className="ml-2 font-semibold text-red-800">Фото дефекта
                                                            обязательно</h4>
                                                    </div>
                                                    <PhotoCapture
                                                        onSave={(data) => setPhotoData(data)}
                                                        defect={`Дефект ${block.title}`}
                                                        status="Без статуса"
                                                        sn={query}
                                                        bt="True"
                                                        onUploadSuccess={(ok) =>
                                                            setUploadedPhotos((prev) => ({...prev, [block.title]: ok}))
                                                        }
                                                    />
                                                    {needsPhoto && (
                                                        <p className="text-sm text-red-600 mt-2 flex items-center">
                                                            <AlertIcon/>
                                                            <span className="ml-2">Загрузите фото для продолжения</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Final Action Section */}
                {allSelected && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {allNoIssues ? (
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div
                                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckIcon/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-green-800 mb-2">Все проверки пройдены
                                    успешно</h3>
                                <p className="text-green-600 mb-6">Банкомат готов к передаче в производственную
                                    площадку</p>

                                <div className="bg-green-50 rounded-lg p-4 mb-6">
                                    <PhotoCapture
                                        onSave={(data) => setPhotoData(data)}
                                        status="Готов к передачи в ПП"
                                        sn={query}
                                        bt="True"
                                        onUploadSuccess={setPhotoUploaded}
                                    />
                                </div>

                                {photoUploaded ? (
                                    <button
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center mx-auto"
                                        onClick={handleSend}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <div
                                                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Отправка...
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon/>
                                                <span className="ml-2">Подтвердить готовность</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-600 mb-2">Для завершения проверки загрузите итоговое
                                            фото</p>
                                        <div className="flex items-center justify-center text-sm text-gray-500">
                                            <CameraIcon/>
                                            <span className="ml-1">Фото обязательно</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertIcon/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-red-800 mb-2">Обнаружены замечания</h3>
                                <p className="text-red-600 mb-6">Банкомат будет отправлен на исправление дефектов</p>

                                <button
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center mx-auto"
                                    onClick={handleSend}
                                    disabled={submitting || Object.entries(selectedOption).some(([section, id]) => {
                                        const block = accordionData.find((b) => b.title === section);
                                        return (
                                            block?.items.find((i) => i.id === id)?.label === "Есть замечания" &&
                                            !uploadedPhotos[section]
                                        );
                                    })}
                                >
                                    {submitting ? (
                                        <>
                                            <div
                                                className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Отправка...
                                        </>
                                    ) : (
                                        <>
                                            <AlertIcon/>
                                            <span className="ml-2">Отправить на исправление</span>
                                        </>
                                    )}
                                </button>

                                {/* Missing Photos Warning */}
                                {Object.entries(selectedOption).some(([section, id]) => {
                                    const block = accordionData.find((b) => b.title === section);
                                    return (
                                        block?.items.find((i) => i.id === id)?.label === "Есть замечания" &&
                                        !uploadedPhotos[section]
                                    );
                                }) && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                        <h4 className="font-semibold text-red-800 mb-2">Требуются фото для
                                            разделов:</h4>
                                        <ul className="text-sm text-red-600 space-y-1">
                                            {Object.entries(selectedOption).map(([section, id]) => {
                                                const block = accordionData.find((b) => b.title === section);
                                                if (block?.items.find((i) => i.id === id)?.label === "Есть замечания" && !uploadedPhotos[section]) {
                                                    return (
                                                        <li key={section} className="flex items-center">
                                                            <CameraIcon/>
                                                            <span className="ml-2">"{section}"</span>
                                                        </li>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}