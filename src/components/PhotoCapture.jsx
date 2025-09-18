"use client";

import { useRef, useState } from "react";
import { Camera, X, Download, Trash2, Image, Zap, RotateCw } from "lucide-react";

export default function PhotoCapture( ) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [facingMode, setFacingMode] = useState("environment"); // задняя камера по умолчанию

    const startCamera = async () => {
        stopCamera(); // останавливаем предыдущий поток
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play().catch((err) => console.warn("play error:", err));
            }

            setStream(mediaStream);
        } catch (err) {
            console.error("Ошибка камеры:", err);
            alert("Не удалось открыть камеру. Используйте HTTPS и дайте разрешение.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        startCamera();
    };

    const handleClose = () => {
        stopCamera();
        setIsOpen(false);
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhotos((prev) => [...prev, dataUrl]);
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveAll = () => {
        console.log("Сохраняем фото:", photos);
        handleClose();
    };

    const toggleCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
        startCamera();
    };

    return (
        <div className="p-4">
            {/* Плавающая кнопка открытия камеры */}
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 z-50 group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 overflow-hidden"
            >
                <div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Camera className="w-5 h-5 relative z-10" />
                {photos.length > 0 && (
                    <span className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium relative z-10 border border-white/20">
                        {photos.length}
                    </span>
                )}
            </button>

            {/* Модальное окно */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-3xl space-y-6 relative max-h-[95vh] overflow-y-auto border border-gray-100">
                        {/* Закрыть */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Заголовок */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Камера
                            </h2>
                            <p className="text-gray-600">Сделайте качественные фотографии для документации</p>
                        </div>

                        {/* Видео */}
                        <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-lg border-4 border-gray-200">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full aspect-video object-cover rounded-2xl"
                            />
                        </div>

                        {/* Кнопки управления */}
                        <div className="flex gap-4 mt-4">
                            {/* Съемка */}
                            <button
                                onClick={takePhoto}
                                disabled={!stream}
                                className="flex-1 px-6 py-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all duration-300 disabled:opacity-50"
                            >
                                <Zap className="w-5 h-5 inline-block mr-2" />
                                Сфотографировать
                            </button>

                            {/* Переключение камеры */}
                            <button
                                onClick={toggleCamera}
                                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <RotateCw className="w-5 h-5" />
                                <span>{facingMode === "user" ? "Передняя" : "Задняя"}</span>
                            </button>

                            {/* Сохранение */}
                            {photos.length > 0 && (
                                <button
                                    onClick={handleSaveAll}
                                    className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-300"
                                >
                                    <Download className="w-5 h-5 inline-block mr-2" />
                                    Сохранить все ({photos.length})
                                </button>
                            )}
                        </div>

                        {/* Галерея */}
                        {photos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                {photos.map((photo, i) => (
                                    <div key={i} className="relative group">
                                        <img
                                            src={photo}
                                            alt={`Фото ${i + 1}`}
                                            className="w-full h-40 object-cover rounded-2xl shadow-lg"
                                        />
                                        <button
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </div>
            )}
        </div>
    );
}