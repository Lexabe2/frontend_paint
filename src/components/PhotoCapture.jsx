"use client";

import {useRef, useState} from "react";
import {Camera, X, Download, Trash2, Image, Zap} from "lucide-react";

// Компонент для захвата фотографий с камеры
export default function PhotoCapture({label = "Сделать фото"}) {
    // Рефы для видео и canvas элементов
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Состояния компонента
    const [isOpen, setIsOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const [photos, setPhotos] = useState([]);

    // Функция запуска камеры
    const startCamera = async () => {
        if (stream) return; // уже работает

        try {
            // Получаем доступ к камере
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Вручную запускаем воспроизведение для iOS
                await videoRef.current.play().catch((err) => console.warn("play error:", err));
            }

            setStream(mediaStream);
        } catch (err) {
            console.error("Ошибка камеры:", err);
            alert("Не удалось открыть камеру. Используйте HTTPS и дайте разрешение.");
        }
    };

    // Функция остановки камеры
    const stopCamera = () => {
        if (stream) {
            // Останавливаем все треки медиа потока
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    // Обработчик открытия модального окна
    const handleOpen = () => {
        setIsOpen(true);
        startCamera();
    };

    // Обработчик закрытия модального окна
    const handleClose = () => {
        stopCamera();
        setIsOpen(false);
    };

    // Функция создания фотографии
    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        // Настраиваем canvas под размеры видео
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Рисуем кадр из видео на canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Конвертируем в base64 и сохраняем
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhotos((prev) => [...prev, dataUrl]);
    };

    // Функция удаления фотографии
    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    // Функция сохранения всех фотографий
    const handleSaveAll = () => {
        console.log("Сохраняем фото:", photos);
        handleClose();
    };

    return (
        <div className="p-4 bg from-slate-50 to-blue-50 rounded-xl">
            {/* Компактная кнопка открытия камеры */}
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 z-50 group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 overflow-hidden"
            >
                {/* Анимированный блик */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                <span className="font-semibold relative z-10">{label}</span>

                {/* Счетчик фотографий */}
                {photos.length > 0 && (
                    <span
                        className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium relative z-10 border border-white/20">
      {photos.length}
    </span>
                )}
            </button>
            {/* Модальное окно камеры */}
            {isOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4 animate-in fade-in duration-300">
                    <div
                        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-3xl space-y-8 relative max-h-[95vh] overflow-y-auto border border-gray-100 animate-in slide-in-from-bottom-8 duration-500">
                        {/* Кнопка закрытия */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:rotate-90"
                        >
                            <X className="w-6 h-6"/>
                        </button>

                        {/* Заголовок модального окна */}
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-4 mb-4">
                                <div
                                    className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg">
                                    <Camera className="w-8 h-8 text-white"/>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Камера
                                    </h2>
                                    <div className="flex items-center justify-center space-x-2 mt-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-500">Активна</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg">Сделайте качественные фотографии для документации</p>
                        </div>

                        {/* Контейнер видео потока */}
                        <div
                            className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full aspect-video object-cover rounded-2xl"
                            />
                            {/* Индикатор загрузки камеры */}
                            {!stream && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                                    <div className="text-center text-white">
                                        <div className="relative">
                                            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse"/>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div
                                                    className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        </div>
                                        <p className="text-lg opacity-75 font-medium">Загрузка камеры...</p>
                                        <p className="text-sm opacity-50 mt-2">Подождите несколько секунд</p>
                                    </div>
                                </div>
                            )}

                            {/* Декоративные элементы управления */}
                            <div className="absolute top-4 left-4 flex space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                            </div>
                        </div>

                        {/* Панель управления */}
                        <div className="flex gap-4">
                            {/* Кнопка съемки */}
                            <button
                                onClick={takePhoto}
                                disabled={!stream}
                                className="group flex-1 flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <Zap className="w-6 h-6 relative z-10"/>
                                <span className="font-semibold text-lg relative z-10">Сфотографировать</span>
                            </button>
                            {/* Кнопка сохранения (показывается только при наличии фото) */}
                            {photos.length > 0 && (
                                <button
                                    onClick={handleSaveAll}
                                    className="group flex-1 flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden"
                                >
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <Download className="w-6 h-6 relative z-10"/>
                                    <span
                                        className="font-semibold text-lg relative z-10">Сохранить все ({photos.length})</span>
                                </button>
                            )}
                        </div>

                        {/* Галерея сделанных фотографий */}
                        {photos.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                        <Image className="w-6 h-6 text-purple-600"/>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Сделанные фото ({photos.length})
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {/* Отображение каждой фотографии */}
                                    {photos.map((photo, index) => (
                                        <div key={index}
                                             className="relative group transform hover:scale-105 transition-all duration-300">
                                            <img
                                                src={photo}
                                                alt={`Фото ${index + 1}`}
                                                className="w-full h-40 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 border-2 border-gray-100"
                                            />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300"/>
                                            {/* Кнопка удаления фото */}
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                            {/* Номер фотографии */}
                                            <div
                                                className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium">
                                                Фото {index + 1}
                                            </div>
                                            {/* Время создания фото */}
                                            <div
                                                className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium">
                                                {new Date().toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Скрытый canvas для обработки изображений */}
                        <canvas ref={canvasRef} className="hidden"/>
                    </div>
                </div>
            )}
        </div>
    );
}