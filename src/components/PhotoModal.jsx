import {useState} from "react";
import {X, Camera, Loader, ZoomIn, Download, FolderClock} from "lucide-react";
import api from "../api/axios";
import {createPortal} from "react-dom";

export default function PhotoModal({atmId}) {
    const [open, setOpen] = useState(false);
    const [photos, setPhotos] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeStatus, setActiveStatus] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [imageLoading, setImageLoading] = useState({});

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/atm/${atmId}/photos/`);
            setPhotos(res.data.photos || {});
            const statuses = Object.keys(res.data.photos || {});
            if (statuses.length > 0) setActiveStatus(statuses[0]);
        } catch (err) {
            console.error("Ошибка загрузки фото:", err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setOpen(true);
        fetchPhotos();
    };

    const closeModal = () => {
        setOpen(false);
        setSelectedPhoto(null);
        setPhotos({});
        setActiveStatus("");
        setImageLoading({});
    };

    const handleImageLoad = (photoIndex) => {
        setImageLoading(prev => ({
            ...prev,
            [photoIndex]: false
        }));
    };

    const handleImageLoadStart = (photoIndex) => {
        setImageLoading(prev => ({
            ...prev,
            [photoIndex]: true
        }));
    };

    const downloadImage = (src, filename) => {
        const link = document.createElement('a');
        link.href = src;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
            >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20">
                    <FolderClock className="h-4 w-4 text-white"/>
                </div>
                <span className="text-sm sm:text-base">История</span>
            </button>

            {open && createPortal(
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden relative transform transition-all duration-300">
                        {/* Header */}
                        <div
                            className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Camera className="h-5 w-5 text-blue-600"/>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Фотографии</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                <X className="h-5 w-5 text-gray-600"/>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="h-8 w-8 animate-spin text-blue-500"/>
                                    <span className="ml-3 text-gray-600">Загрузка фотографий...</span>
                                </div>
                            ) : Object.keys(photos).length === 0 ? (
                                <div className="text-center py-12">
                                    <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Фотографии отсутствуют</h3>
                                    <p className="text-gray-500">Для данного объекта пока нет загруженных фотографий</p>
                                </div>
                            ) : (
                                <>
                                    {/* Status Tabs */}
                                    <div className="flex gap-2 mb-6 flex-wrap">
                                        {Object.keys(photos).map((status) => (
                                            <button
                                                key={status}
                                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                                    activeStatus === status
                                                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                                onClick={() => setActiveStatus(status)}
                                            >
                                                {status}
                                                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {photos[status].length}
                        </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Photo Grid */}
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {photos[activeStatus]?.map((src, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                                onClick={() => setSelectedPhoto({
                                                    src,
                                                    status: activeStatus,
                                                    index: idx
                                                })}
                                            >
                                                {imageLoading[idx] && (
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                                        <Loader className="h-6 w-6 animate-spin text-gray-400"/>
                                                    </div>
                                                )}
                                                <img
                                                    src={src}
                                                    alt={`${activeStatus} ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    onLoadStart={() => handleImageLoadStart(idx)}
                                                    onLoad={() => handleImageLoad(idx)}
                                                    onError={() => handleImageLoad(idx)}
                                                />

                                                {/* Overlay */}
                                                <div
                                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                    <div
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2">
                                                        <div className="p-2 bg-white/90 rounded-lg backdrop-blur-sm">
                                                            <ZoomIn className="h-4 w-4 text-gray-700"/>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                downloadImage(src, `${activeStatus}_${idx + 1}.jpg`);
                                                            }}
                                                            className="p-2 bg-white/90 rounded-lg backdrop-blur-sm hover:bg-white transition-colors duration-200"
                                                        >
                                                            <Download className="h-4 w-4 text-gray-700"/>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Photo Number */}
                                                <div
                                                    className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur-sm">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>,
    document.body // рендерим в body, а не в родителе
            )}

            {/* Full Size Photo Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-60 p-4">
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-200 z-10"
                        >
                            <X className="h-6 w-6"/>
                        </button>

                        <button
                            onClick={() => downloadImage(selectedPhoto.src, `${selectedPhoto.status}_${selectedPhoto.index + 1}.jpg`)}
                            className="absolute top-4 right-20 p-3 bg-white/10 rounded-full backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-200 z-10"
                        >
                            <Download className="h-6 w-6"/>
                        </button>

                        <img
                            src={selectedPhoto.src}
                            alt={`${selectedPhoto.status} ${selectedPhoto.index + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={() => setSelectedPhoto(null)}
                        />

                        {/* Photo Info */}
                        <div
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-lg backdrop-blur-sm">
              <span className="text-sm font-medium">
                {selectedPhoto.status} - Фото {selectedPhoto.index + 1}
              </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}