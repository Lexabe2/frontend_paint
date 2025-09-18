"use client";

import { useState } from "react";
import { Trash2, Camera, X, Image, MessageCircle } from "lucide-react";

export default function PhotoCapture({ onSave }) {
    const [photos, setPhotos] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [comment, setComment] = useState("");

    // Обработка выбора файлов
    const handleChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setPhotos((prev) => [
                        ...prev,
                        {
                            data: event.target.result,
                            timestamp: new Date().toLocaleString(),
                            name: file.name,
                        },
                    ]);
                };
                reader.readAsDataURL(file);
            });
            if (!showGallery) setShowGallery(true);
        }
        e.target.value = null; // сброс input
    };

    // Удаление фото
    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        if (photos.length === 1) setShowGallery(false);
    };

    // Переключение галереи
    const toggleGallery = () => {
        setShowGallery(!showGallery);
    };

    // Очистка всех данных
    const clearAll = () => {
        setPhotos([]);
        setComment("");
        setShowGallery(false);
    };

    // Закрытие галереи с автоматическим onSave
    const handleCloseGallery = () => {
        if (onSave) {
            onSave({ photos, comment });
        }
        setShowGallery(false);
    };

    return (
        <div>
            {/* Плавающая кнопка камеры */}
            <label className="fixed bottom-6 right-6 z-50 cursor-pointer group">
                <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Camera className="w-5 h-5" />
                    {photos.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <span className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium border border-white/20">
                                {photos.length}
                            </span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={handleChange}
                />
            </label>

            {/* Кнопка галереи */}
            {photos.length > 0 && (
                <button
                    onClick={toggleGallery}
                    className="fixed bottom-20 right-6 z-50 p-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
                >
                    <Image className="w-5 h-5" />
                </button>
            )}

            {/* Модальная галерея */}
            {showGallery && photos.length > 0 && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        {/* Заголовок галереи */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                    <Image className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Фото замечаний</h3>
                                    <p className="text-sm text-gray-500">
                                        {photos.length} фотографий
                                        {comment && (
                                            <span className="ml-2 text-blue-600">• Есть комментарий</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseGallery}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Контент галереи */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="relative group bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <img
                                            src={photo.data}
                                            alt={`Фото ${index + 1}`}
                                            className="w-full h-32 sm:h-40 object-cover"
                                        />

                                        {/* Overlay с информацией */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="absolute bottom-2 left-2 text-white">
                                                <p className="text-xs font-medium">Фото {index + 1}</p>
                                                <p className="text-xs opacity-75">{photo.timestamp}</p>
                                            </div>
                                        </div>

                                        {/* Кнопка удаления */}
                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform hover:scale-110"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Панель комментария */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                                        <MessageCircle className="w-4 h-4 text-blue-500" />
                                        <span>Комментарий</span>
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Добавьте комментарий к фотографиям..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                                        rows={3}
                                    />
                                    {comment && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {comment.length} символов
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        onClick={clearAll}
                                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Очистить всё</span>
                                    </button>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>Данные сохранены</span>
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}