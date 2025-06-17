"use client"

import { useState, useRef } from "react"
import { X, Upload, Camera, FileText, Hash, Calendar, AlertTriangle, Scan, Grid3X3, List } from "lucide-react"
import ScannerInput from "./Skaner"
import CameraCapture from "./CameraCapture"

export default function CreateReclamationModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    serial_number: "",
    remarks: "",
    due_date: "",
    photos: [],
  })
  const [previews, setPreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [photoViewMode, setPhotoViewMode] = useState("grid") // "grid" или "list"
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = files.map((file) => URL.createObjectURL(file))

    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleScanResult = (scannedCode) => {
    setFormData((prev) => ({ ...prev, serial_number: scannedCode }))
    setShowScanner(false)
  }

  const handleCameraCapture = (file, previewUrl) => {
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, file] }))
    setPreviews((prev) => [...prev, previewUrl])
    setShowCamera(false)
  }

  const removePhoto = (index) => {
    const newPhotos = [...formData.photos]
    const newPreviews = [...previews]

    newPhotos.splice(index, 1)
    newPreviews.splice(index, 1)

    setFormData((prev) => ({ ...prev, photos: newPhotos }))
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.serial_number.trim() || !formData.remarks.trim()) {
      alert("Заполните обязательные поля")
      return
    }

    setIsSubmitting(true)

    const submitData = new FormData()
    submitData.append("serial_number", formData.serial_number)
    submitData.append("remarks", formData.remarks)
    if (formData.due_date) {
      submitData.append("due_date", formData.due_date)
    }

    formData.photos.forEach((photo, index) => {
      submitData.append(`photos`, photo)
    })

    try {
      await onCreate(submitData)
    } catch (error) {
      console.error("Ошибка создания рекламации:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      {/* Полноэкранное модальное окно */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Заголовок - фиксированный */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Создать рекламацию</h2>
                <p className="text-red-100 text-xs sm:text-sm hidden sm:block">
                  Заполните форму для создания новой рекламации
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Форма - прокручиваемая */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Серийный номер с возможностью сканирования */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Hash className="w-4 h-4 text-blue-600" />
                Серийный номер *
              </label>

              <div className="space-y-3">
                {/* Поле ввода с кнопкой сканирования */}
                <div className="relative">
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleInputChange}
                    placeholder="Введите серийный номер"
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-300 outline-none transition-all text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                    title="Сканировать QR/штрих-код"
                  >
                    <Scan className="w-4 h-4" />
                  </button>
                </div>

                {/* Сканер */}
                {showScanner && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-800 text-sm">Сканирование кода</h4>
                      <button
                        type="button"
                        onClick={() => setShowScanner(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ScannerInput
                      onScan={handleScanResult}
                      onError={(error) => console.error("Scanner error:", error)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Замечания */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-green-600" />
                Замечания *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Опишите проблему или замечание..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-300 outline-none transition-all resize-none text-sm sm:text-base"
                required
              />
            </div>

            {/* Срок выполнения */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Срок выполнения
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-300 outline-none transition-all text-sm sm:text-base"
              />
            </div>

            {/* Фотографии с компактным дизайном */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Camera className="w-4 h-4 text-orange-600" />
                  Фотографии
                  {previews.length > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      {previews.length}
                    </span>
                  )}
                </label>

                {/* Переключатель режима просмотра фото */}
                {previews.length > 0 && (
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setPhotoViewMode("grid")}
                      className={`p-1.5 rounded transition-all ${
                        photoViewMode === "grid" ? "bg-white shadow-sm text-slate-700" : "text-slate-500"
                      }`}
                      title="Сетка"
                    >
                      <Grid3X3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoViewMode("list")}
                      className={`p-1.5 rounded transition-all ${
                        photoViewMode === "list" ? "bg-white shadow-sm text-slate-700" : "text-slate-500"
                      }`}
                      title="Список"
                    >
                      <List className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Кнопки добавления фото - компактные */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 active:from-emerald-200 active:to-teal-200 border border-emerald-200 rounded-lg transition-all duration-200"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-medium text-sm">Камера</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 active:from-blue-200 active:to-indigo-200 border border-blue-200 rounded-lg transition-all duration-200"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium text-sm">Файлы</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Камера - компактная */}
                {showCamera && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
                  </div>
                )}

                {/* Превью фотографий - адаптивное */}
                {previews.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    {photoViewMode === "grid" ? (
                      // Сетка - компактная
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Фото ${index + 1}`}
                              className="w-full h-12 sm:h-16 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => removePhoto(index)}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <X className="w-2 h-2 text-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Список - компактный
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {previews.map((preview, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-2">
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Фото ${index + 1}`}
                              className="w-10 h-10 object-cover rounded border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">Фото {index + 1}</p>
                              <p className="text-xs text-slate-500">
                                {formData.photos[index]?.size
                                  ? `${Math.round(formData.photos[index].size / 1024)} KB`
                                  : "Размер неизвестен"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-center">
                      <p className="text-xs text-slate-500">
                        Нажмите на фото для удаления • {previews.length} из 10 максимум
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки - зафиксированы внизу */}
          <div className="flex-shrink-0 bg-white border-t border-slate-200 p-4 sm:p-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 active:from-red-700 active:to-orange-800 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Создание...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Создать
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
