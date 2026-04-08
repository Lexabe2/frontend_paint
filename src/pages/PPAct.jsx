import { useState } from "react";
import api from "../api/axios"; // Используем твой API axios

export default function GetActs() {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://localhost:8000";
    const [loading, setLoading] = useState(false); // Статус загрузки
    const [error, setError] = useState(""); // Ошибки
    const [zipFileUrl, setZipFileUrl] = useState(""); // Ссылка на архив

    // Получение файла акта (ссылки на архив)
    const handleGetActs = async () => {
        setLoading(true);
        setError(""); // Очищаем старые ошибки

        try {
            const response = await api.get("/create_act_work"); // Эндпоинт для получения акта

            // Сохраняем ссылку на архив
            setZipFileUrl(response.data.zip_file || "");
        } catch (e) {
            setError(e.response?.data?.error || "Ошибка при получении акта.");
        } finally {
            setLoading(false);
        }
    };

    // Функция для скачивания архива
    const handleDownloadArchive = () => {
        if (zipFileUrl) {
            const link = document.createElement("a");
            link.href = zipFileUrl;
            console.log(link)
            link.download = zipFileUrl.split("/").pop(); // Имя архива
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Убираем ссылку после скачивания
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">
                Получение актов
            </h2>

            {/* Кнопка для получения актов */}
            <div className="text-center">
                <button
                    onClick={handleGetActs}
                    disabled={loading}
                    className={`
                        px-6 py-3 font-medium rounded-lg transition
                        ${
                        loading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    }
                    `}
                >
                    {loading ? "Загружаем акты..." : "Получить акты"}
                </button>
            </div>

            {/* Сообщения об ошибках */}
            {error && (
                <p className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </p>
            )}

            {/* Кнопка для скачивания архива */}
            {zipFileUrl && (
                <div className="text-center mt-6">
                    <button
                        onClick={handleDownloadArchive}
                        className="px-6 py-3 font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition shadow-sm"
                    >
                        Скачать архив с актами
                    </button>
                </div>
            )}

            {/* Ссылка на архив */}
            {zipFileUrl && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Доступный архив:</h3>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href={zipFileUrl}
                                download
                                className="text-blue-600 hover:underline"
                            >
                                Скачать архив: {zipFileUrl.split("/").pop()}
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}