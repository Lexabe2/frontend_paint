"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  X,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from "lucide-react";

export default function PhotoCapture({ label = "Сделать фото", onPhotosChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Notify parent about photos change
  useEffect(() => {
    if (onPhotosChange) {
      onPhotosChange(photos);
    }
  }, [photos, onPhotosChange]);

  // запуск камеры
  const startCamera = async () => {
    if (stream) return;

    try {
      setLoading(true);
      setError(null);

      // Определяем протокол для локальной разработки
      const isLocalDev = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('webcontainer');

      // Для локальной разработки используем менее строгие настройки
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? facingMode : undefined,
          width: isLocalDev ? { ideal: 640, max: 1280 } : { ideal: 1920, max: 1920 },
          height: isLocalDev ? { ideal: 480, max: 720 } : { ideal: 1080, max: 1080 },
          frameRate: isLocalDev ? { ideal: 15, max: 30 } : { ideal: 30 }
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Ждем загрузки метаданных видео
        await new Promise((resolve, reject) => {
          const video = videoRef.current;

          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve();
          };

          const onError = (err) => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(err);
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);

          // Таймаут для локальной разработки
          setTimeout(() => {
            if (video.readyState >= 1) {
              onLoadedMetadata();
            }
          }, isLocalDev ? 2000 : 5000);
        });

        await videoRef.current.play().catch((err) => {
          console.warn("Play error:", err);
          // Для некоторых браузеров требуется пользовательское взаимодействие
          if (!isLocalDev) {
            throw new Error("Требуется взаимодействие пользователя для запуска видео");
          }
        });
      }

      setStream(mediaStream);
      showNotification(isLocalDev ? "Камера запущена (локальная разработка)" : "Камера успешно запущена");
    } catch (err) {
      console.error("Ошибка камеры:", err);
      let errorMessage = "Не удалось открыть камеру";

      if (err.name === 'NotAllowedError') {
        errorMessage = isLocalDev
          ? "Доступ к камере запрещен. В Chrome перейдите в chrome://settings/content/camera и разрешите доступ для localhost"
          : "Доступ к камере запрещен. Разрешите доступ в настройках браузера.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "Камера не найдена. Проверьте подключение камеры.";
      } else if (err.name === 'NotSupportedError') {
        errorMessage = isLocalDev
          ? "Для локальной разработки используйте HTTPS или настройте исключения в браузере"
          : "Камера не поддерживается на этом устройстве.";
      } else if (err.message?.includes("взаимодействие")) {
        errorMessage = "Нажмите на кнопку еще раз для запуска камеры";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // остановка камеры
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      showNotification("Камера выключена");
    }
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    if (!isMobile) {
      showNotification("Переключение камеры доступно только на мобильных устройствах", 'error');
      return;
    }

    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    if (stream) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  // открытие модалки
  const handleOpen = () => {
    setIsOpen(true);
    setPhotos([]);
    setError(null);
    startCamera();
  };

  // закрытие модалки
  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setError(null);
    setLoading(false);
  };

  // сделать фото
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Проверяем готовность видеопотока
    if (!video || !canvas) {
      setError("Видеопоток не готов для съемки");
      return;
    }

    // Ждем готовности видео
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Камера еще загружается, попробуйте через секунду");
      // Автоматически попробуем через секунду
      setTimeout(() => {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          takePhoto();
        }
      }, 1000);
      return;
    }

    try {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // For front camera, mirror the image
      if (facingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPhotos((prev) => [...prev, { id: Date.now(), data: dataUrl, timestamp: new Date() }]);
      showNotification("Фото успешно сделано!");
    } catch (err) {
      console.error("Photo capture error:", err);
      setError("Не удалось сделать снимок");
    }
  };

  // удалить фото
  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    showNotification("Фото удалено");
  };

  // Download photo
  const downloadPhoto = (photo, index) => {
    const link = document.createElement('a');
    link.download = `photo_${index + 1}_${Date.now()}.jpg`;
    link.href = photo.data;
    link.click();
    showNotification("Фото загружено");
  };

  // сохранить все фото (можно отправить на сервер)
  const handleSaveAll = () => {
    console.log("Сохраняем фото:", photos.map(p => p.data));
    showNotification(`Сохранено ${photos.length} фото`);
    handleClose();
  };

  return (
    <>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`fixed top-4 right-4 z-[60] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm border ${
              notification.type === 'success'
                ? 'bg-green-50/90 border-green-200 text-green-800'
                : 'bg-red-50/90 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* кнопка открытия модалки */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpen}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Camera className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {photos.length > 0 && (
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
            {photos.length}
          </span>
        )}
      </motion.button>

      {/* модалка */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Камера</h2>
                    <p className="text-sm text-gray-600">
                      {isMobile ? `Камера: ${facingMode === 'environment' ? 'Задняя' : 'Передняя'}` : 'Фотосъемка'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                {/* Error Display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-800 font-medium">{error}</p>
                        <p className="text-red-600 text-sm mt-1">
                          Убедитесь, что сайт открыт по HTTPS и разрешен доступ к камере
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        console.log("Video metadata loaded:", {
                          width: videoRef.current?.videoWidth,
                          height: videoRef.current?.videoHeight,
                          readyState: videoRef.current?.readyState
                        });
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="p-4 bg-gray-800 rounded-full mb-4 mx-auto w-fit">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-400 font-medium">Камера не активна</p>
                        {loading && (
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-blue-500 text-sm">Запуск камеры...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {stream && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={takePhoto}
                        disabled={!videoRef.current || videoRef.current.readyState < 2}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="font-medium">Сфотографировать</span>
                        {videoRef.current?.readyState < 2 && (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        )}
                      </motion.button>

                      {isMobile && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={switchCamera}
                          className="flex items-center space-x-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <RotateCcw className="w-5 h-5" />
                          <span className="font-medium">Переключить</span>
                        </motion.button>
                      )}
                    </>
                  )}

                  {photos.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveAll}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Сохранить все ({photos.length})</span>
                    </motion.button>
                  )}
                </div>

                {/* Gallery */}
                <AnimatePresence>
                  {photos.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Галерея ({photos.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <AnimatePresence>
                          {photos.map((photo, index) => (
                            <motion.div
                              key={photo.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative group bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                              <img
                                src={photo.data}
                                alt={`Фото ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => downloadPhoto(photo, index)}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-200"
                                >
                                  <Download className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removePhoto(index)}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors duration-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </motion.button>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {photo.timestamp.toLocaleTimeString()}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}