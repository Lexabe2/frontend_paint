"use client";

import { useState } from "react";
import { Trash2, Camera } from "lucide-react";

export default function PhotoCapture({ label = "Сделать фото" }) {
    const [photos, setPhotos] = useState([]);

    const handleChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setPhotos((prev) => [...prev, event.target.result]);
                };
                reader.readAsDataURL(file);
            });
        }
        // Сбрасываем input чтобы можно было выбрать одно и то же фото снова
        e.target.value = null;
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            {/* Плавающая кнопка */}
            <label className="fixed bottom-6 right-6 z-50 cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>{label}</span>
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={handleChange}
                />
                {photos.length > 0 && (
                    <span className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium border border-white/20">
                        {photos.length}
                    </span>
                )}
            </label>

            {/* Галерея */}
            {photos.length > 0 && (
                <div className="fixed bottom-24 right-6 z-50 w-72 max-h-[60vh] overflow-y-auto p-3 bg-white rounded-2xl shadow-lg space-y-2">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Фото ({photos.length})</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={photo}
                                    alt={`Фото ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-xl shadow"
                                />
                                <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}