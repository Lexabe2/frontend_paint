"use client"

import { useState, useRef, useEffect } from "react"
import { Package, MessageSquare, Camera, Upload, Save, X, ImageIcon } from "lucide-react"
import CameraCapture from "./CameraCapture"
import api from "../api/axios"

export default function EditAtm({ data }) {
  const [model, setModel] = useState(data.model || "")
  const [comment, setComment] = useState("")
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [photoType, setPhotoType] = useState("Работы") // Добавлен тип фото

  const fileInputRef = useRef(null)

  // Типы фотографий
  const photoTypes = [
    { value: "Приемка", icon: "📥" },
    { value: "Отправка", icon: "📤" },
    { value: "Работы", icon: "🔧" },
    { value: "Рекломация", icon: "⚠️" },
  ]

  // Загрузка из sessionStorage
  useEffect(() => {
    const savedPreviews = JSON.parse(sessionStorage.getItem("atmPhotos") || "[]")
    if (savedPreviews.length > 0) {
      const files = savedPreviews.map(base64ToFile)
      setImages(files)
      setPreviews(savedPreviews)
    }
  }, [])

  // Сохранение в sessionStorage
  useEffect(() => {
    const saveToSession = async () => {
      const base64Array = await Promise.all(images.map(fileToBase64))
      sessionStorage.setItem("atmPhotos", JSON.stringify(base64Array))
    }

    if (images.length > 0) {
      saveToSession()
    } else {
      sessionStorage.removeItem("atmPhotos")
    }
  }, [images])

  // Отслеживание изменений
  useEffect(() => {
    const modelChanged = model !== (data.model || "")
    const commentChanged = comment !== ""
    const hasImages = images.length > 0

    setHasChanges(modelChanged || commentChanged || hasImages)
  }, [model, comment, images, data.model])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (index) => {
    const newImages = [...images]
    const newPreviews = [...previews]
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleCapture = (file, previewUrl) => {
    setImages((prev) => [...prev, file])
    setPreviews((prev) => [...prev, previewUrl])
    setShowCamera(false)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("comment", comment)
    formData.append("model", model)
    formData.append("photo_type", photoType) // Добавлен тип фото

    images.forEach((img) => {
      formData.append("images", img)
    })

    try {
      const res = await api.post(`/atm/${data.serial_number}/update/`, formData)
      sessionStorage.removeItem("atmPhotos")

      // Показать анимацию успеха
      setIsSuccess(true)

      // Сбросить состояние через 2 секунды
      setTimeout(() => {
        setIsSuccess(false)
        setImages([])
        setPreviews([])
        setComment("")
        // Модель не сбрасываем, так как она может быть изначальной
      }, 2000)
    } catch (err) {
      console.error("Ошибка отправки:", err)
      if (err.response) {
        alert(`⚠️ Ошибка сервера: ${err.response.status}`)
      } else {
        alert("❌ Ошибка сети")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Форма редактирования */}
      <div>
        <div className="p-2 space-y-6">
          {/* Модель устройства */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Package className="w-4 h-4 text-blue-600" />
              Модель устройства
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Введите модель устройства"
              className="w-full px-4 py-3 bg-white/70 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 outline-none transition-all"
            />
          </div>

          {/* Тип фотографии */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Тип фотографии
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {photoTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPhotoType(type.value)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    photoType === type.value
                      ? "bg-purple-100 border-purple-300 text-purple-700 font-medium"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span>{type.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Комментарий */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Комментарий
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий или примечания"
              className="w-full h-[100px] px-4 py-3 bg-white/70 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 outline-none transition-all resize-none"
              rows={4}
            />
          </div>

          {/* Фотографии */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Фотографии устройства
            </label>

            {/* Кнопки добавления фото */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Camera className="w-5 h-5" />
                Камера
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Upload className="w-5 h-5" />
                Загрузить файлы
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              multiple
            />

            {/* Камера */}
            {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}

            {/* Превью изображений */}
            {previews.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50/50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-slate-900">Загруженные фото</span>
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                    {previews.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src || "/placeholder.svg"}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-slate-200/50 shadow-sm group-hover:shadow-lg transition-all"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-500 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                        title="Удалить фото"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка сохранения - показывается только при наличии изменений */}
        {hasChanges && (
          <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSuccess}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 font-bold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                isSuccess
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white scale-105"
                  : isSubmitting
                    ? "bg-gradient-to-r from-violet-400 to-purple-400 text-white"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="transition-all duration-300">Сохранение...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="transition-all duration-300 animate-pulse">Успешно сохранено!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 transition-all duration-300" />
                    <span className="transition-all duration-300">Сохранить изменения</span>
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Подсказка когда нет изменений */}
        {!hasChanges && (
          <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50 transition-all duration-300">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl shadow-lg mb-3 opacity-50 transition-all duration-300">
                <Save className="w-6 h-6 text-white" />
              </div>
              <p className="text-slate-500 font-medium transition-all duration-300">
                Внесите изменения или добавьте фото для сохранения
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Вспомогательные функции
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

function base64ToFile(base64) {
  const [meta, content] = base64.split(",")
  const mime = meta.match(/:(.*?);/)[1]
  const bstr = atob(content)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `restored-${Date.now()}.png`, { type: mime })
}
