import { useState } from "react";
import { Trash2, Camera, X, Image, MessageCircle, Upload, Check, AlertCircle, Loader } from "lucide-react";
import api from "../api/axios";

export default function PhotoCapture({ onSave, status, sn, bt, mode }) {
  const [photos, setPhotos] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Выбор фото
  const handleChange = (e) => {
    const files = e.target.files;
    processFiles(files);
    e.target.value = null;
  };

  // Обработка файлов
  const processFiles = (files) => {
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
          alert(`Файл ${file.name} не является изображением`);
          return;
        }

        // Проверка размера (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой (максимум 10MB)`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          setPhotos((prev) => [
            ...prev,
            {
              data: event.target.result,
              timestamp: new Date().toLocaleString(),
              name: file.name,
              size: file.size,
              id: Date.now() + Math.random(),
            },
          ]);
          // Автоматически открыть галерею при добавлении фото
          setShowGallery(true);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  };

  // Удаление фото
  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Очистка
  const clearAll = () => {
    setPhotos([]);
    setComment("");
    setShowGallery(false);
    setUploadSuccess(false);
  };

  // Закрытие с автоматическим onSave
  const handleCloseGallery = () => {
    if (onSave) {
      onSave({ photos, comment });
    }
    setShowGallery(false);
  };

  // Сохранение на сервер
  const handleSave = async () => {
    if (photos.length === 0) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        const arr = photo.data.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8arr], { type: mime });
        formData.append("photos", blob, photo.name);
      });

      formData.append("comment", comment);
      formData.append("status", status);
      formData.append("sn", sn);

      const res = await api.post("/atm/upload-photos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Сохранено:", res.data);
      setUploadSuccess(true);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Ошибка: ${err.response.data.error}`);
      } else {
        alert("Произошла ошибка при отправке файлов");
      }
      console.error("Ошибка при отправке:", err);
    } finally {
      setUploading(false);
    }
  };

  // Переключение галереи
  const toggleGallery = () => setShowGallery(!showGallery);

  // Форматирование размера файла
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Компактная кнопка для строки */}
      <div
        className={`relative p-2 bg-gray-50 rounded-lg border-2 border-dashed transition-all duration-200 ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer flex-1">
            <div className="p-1 bg-white rounded-md shadow-sm">
              {uploadSuccess ? (
                <Check className="w-4 h-4 text-green-600"/>
              ) : (
                <Camera className="w-4 h-4 text-blue-600"/>
              )}
            </div>
            <span className={`text-sm truncate ${uploadSuccess ? 'text-green-700' : 'text-gray-700'}`}>
              {uploadSuccess ? 'Отправлено!' : photos.length > 0 ? `${photos.length} фото` : 'Добавить фото'}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleChange}
            />
          </label>

          {photos.length > 0 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleGallery}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Image className="w-4 h-4" />
              </button>

              {bt !== 'False' && !uploadSuccess && (
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className={`p-1 rounded transition-colors ${
                    uploading 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {uploading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Мини превью фото */}
        {photos.length > 0 && (
          <div className="flex -space-x-1 mt-2">
            {photos.slice(0, 4).map((photo, idx) => (
              <img
                key={idx}
                src={photo.data}
                alt={`Preview ${idx + 1}`}
                className="w-6 h-6 rounded border-2 border-white object-cover"
              />
            ))}
            {photos.length > 4 && (
              <div className="w-6 h-6 rounded border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                +{photos.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Галерея (открывается по клику) */}
      {showGallery && photos.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Image className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Фото к {sn}</h3>
                  <p className="text-xs text-gray-500">
                    {photos.length} фотографий
                    {comment && <span className="ml-2 text-blue-600">• Есть комментарий</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseGallery}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Фото */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[40vh]">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative group bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.data}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-1 left-1 text-white">
                        <p className="text-xs font-medium">{index + 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform hover:scale-110"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Комментарий и кнопки */}
            <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 space-y-3">
              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-2">
                  <MessageCircle className="w-3 h-3 text-blue-500" />
                  <span>Комментарий</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Добавьте комментарий..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm bg-white"
                  rows={2}
                  maxLength={500}
                />
                {comment && <p className="mt-1 text-xs text-gray-500">{comment.length}/500</p>}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={clearAll}
                  disabled={uploading}
                  className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="text-xs font-medium">Очистить</span>
                </button>

                {bt !== 'False' && !uploadSuccess && (
                  <button
                    onClick={handleSave}
                    disabled={uploading}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${
                      uploading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        <span className="text-xs">Сохранить</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Статус загрузки */}
              {uploading && (
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                  <Loader className="w-3 h-3 animate-spin text-blue-500" />
                  <span>Загружаем {photos.length} фотографий...</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-center justify-center space-x-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Фотографии отправлены успешно!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Полноэкранный просмотр фото */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-60 flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 bg-white/10 rounded-full backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-200 z-10"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <img
              src={selectedPhoto.data}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={() => setSelectedPhoto(null)}
            />

            {/* Информация о фото */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/50 text-white rounded-lg backdrop-blur-sm">
              <div className="text-center">
                <p className="text-xs font-medium">{selectedPhoto.name}</p>
                <p className="text-xs opacity-75">
                  {selectedPhoto.timestamp} • {formatFileSize(selectedPhoto.size)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}