"use client"

import { useEffect, useState } from "react"
import api from "../api/axios"

export default function ATMDetails({ data }) {
  const [atm, setAtm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentGroup, setCurrentGroup] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoading, setImageLoading] = useState({})

  // Типы фотографий с иконками и цветами
  const photoTypes = {
    Приемка: {
      icon: "📥",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    Отправка: {
      icon: "📤",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
    },
    Работы: {
      icon: "🔧",
      color: "from-orange-500 to-amber-600",
      bgColor: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
    },
    Рекломация: {
      icon: "⚠️",
      color: "from-red-500 to-rose-600",
      bgColor: "from-red-50 to-rose-50",
      borderColor: "border-red-200",
    },
  }

  useEffect(() => {
    if (!data || !data.serial_number) return

    api
      .get(`/atm-comment/${data.serial_number}/`)
      .then((res) => {
        setAtm(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Ошибка загрузки банкомата", err)
        setLoading(false)
      })
  }, [data])

  const handleImageLoad = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }))
  }

  const handleImageLoadStart = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: true }))
  }

  const openImageModal = (image, groupImages) => {
    setSelectedImage(image)
    setCurrentGroup(groupImages)
    setCurrentImageIndex(groupImages.findIndex((img) => img === image))
  }

  const navigateImage = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % currentGroup.length
        : (currentImageIndex - 1 + currentGroup.length) % currentGroup.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(currentGroup[newIndex])
  }

  // Группировка изображений по типу
  const groupImagesByType = (images) => {
    const grouped = {}

    // Инициализируем все типы
    Object.keys(photoTypes).forEach((type) => {
      grouped[type] = []
    })

    // Группируем изображения
    images.forEach((img) => {
      const type = img.photo_type || "Работы" // По умолчанию "Работы"
      if (grouped[type]) {
        grouped[type].push(img)
      } else {
        grouped["Работы"].push(img) // Если тип неизвестен, добавляем в "Работы"
      }
    })

    return grouped
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div className="ml-4">
          <p className="text-gray-700 font-medium">Загрузка деталей...</p>
          <p className="text-gray-500 text-sm">Получение информации о банкомате</p>
        </div>
      </div>
    )
  }

  if (!atm) {
    return (
      <div className="p-8 text-center">
        <div className="relative mx-auto mb-6 w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Банкомат не найден</h3>
        <p className="text-gray-500">Данные недоступны или произошла ошибка загрузки</p>
      </div>
    )
  }

  const groupedImages = groupImagesByType(atm.images || [])

  return (
    <div className="p-6 pb-20 sm:pb-6">
      {/* Фотографии по типам */}
      <div className="space-y-8">
        {Object.entries(photoTypes).map(([type, config]) => {
          const images = groupedImages[type] || []
          const hasImages = images.length > 0
          const hasComments = images.some((img) => img.comment)

          // Показываем секцию только если есть фото или комментарии
          if (!hasImages && !hasComments) return null

          return (
            <div key={type} className="relative">
              <div className={`absolute -inset-2 bg-gradient-to-r ${config.bgColor} rounded-2xl opacity-30`}></div>
              <div className={`relative bg-white rounded-xl p-6 shadow-sm border ${config.borderColor}`}>
                {/* Заголовок секции */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center mr-4 shadow-lg text-lg`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {type}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {hasImages ? `${images.length} фото` : "Только комментарии"}
                      </p>
                    </div>
                  </div>

                  {hasImages && (
                    <div
                      className={`bg-gradient-to-r ${config.color} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}
                    >
                      {images.length} фото
                    </div>
                  )}
                </div>

                {/* Фотографии */}
                {hasImages ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="group relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => openImageModal(img, images)}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10`}
                        ></div>

                        <div className="aspect-video overflow-hidden relative">
                          {imageLoading[`${type}-${index}`] && (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                          )}
                          <img
                            src={img.image || "/placeholder.svg?height=200&width=300&query=ATM photo"}
                            alt={img.photo_type || ""}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onLoadStart={() => handleImageLoadStart(`${type}-${index}`)}
                            onLoad={() => handleImageLoad(`${type}-${index}`)}
                          />

                          {/* Overlay с иконкой увеличения */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300">
                              <svg
                                className="w-6 h-6 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Индикатор позиции в группе */}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                            {index + 1}/{images.length}
                          </div>
                        </div>

                        <div className="p-4">
                          {img.comment && (
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{img.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Показываем только комментарии, если нет фото
                  <div className="space-y-3">
                    {images
                      .filter((img) => img.comment)
                      .map((img, index) => (
                        <div
                          key={index}
                          className={`bg-gradient-to-br ${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`w-6 h-6 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-sm`}
                            >
                              {config.icon}
                            </div>
                            <div>
                              <span className="text-gray-800 font-medium text-sm block mb-1">
                                Комментарий {index + 1}
                              </span>
                              <p className="text-gray-700 text-sm leading-relaxed">{img.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Улучшенное модальное окно с навигацией */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-center">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-bold text-lg truncate">
                  {selectedImage.photo_type || "Фотография"}
                  <span className="text-purple-200 ml-2">
                    ({currentImageIndex + 1} из {currentGroup.length})
                  </span>
                </h3>
                {selectedImage.comment && (
                  <p className="text-purple-100 text-sm mt-1 line-clamp-2">{selectedImage.comment}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
                  title="Полноэкранный режим"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
                  title="Закрыть"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Изображение с навигацией */}
            <div className="relative p-4 bg-gray-50">
              <div className="bg-white rounded-xl p-4 shadow-inner flex items-center justify-center relative">
                <img
                  src={selectedImage.image || "/placeholder.svg?height=600&width=800&query=ATM detailed photo"}
                  alt={selectedImage.photo_type || ""}
                  className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: "60vh" }}
                  loading="lazy"
                />

                {/* Навигационные кнопки */}
                {currentGroup.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage("prev")}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                      title="Предыдущее фото"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => navigateImage("next")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                      title="Следующее фото"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Миниатюры */}
              {currentGroup.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
                  {currentGroup.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setSelectedImage(img)
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentImageIndex
                          ? "border-purple-500 shadow-lg"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={img.image || "/placeholder.svg?height=64&width=64&query=ATM thumbnail"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Полноэкранный режим */}
      {isFullscreen && selectedImage && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200 z-10"
            title="Выйти из полноэкранного режима"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="bg-white bg-opacity-5 p-4 rounded-xl max-w-5xl max-h-[90vh] flex items-center justify-center relative">
            <img
              src={selectedImage.image || "/placeholder.svg?height=800&width=1200&query=ATM fullscreen photo"}
              alt={selectedImage.photo_type || ""}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              loading="lazy"
            />

            {/* Навигация в полноэкранном режиме */}
            {currentGroup.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
