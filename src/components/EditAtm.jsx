import { useState, useRef } from "react"

export default function EditAtm({ data }) {
  const [model, setModel] = useState(data.model || "")
  const [comment, setComment] = useState("")
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])

  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    const newImages = [...images, ...files]
    const newPreviews = [
      ...previews,
      ...files.map((file) => URL.createObjectURL(file)),
    ]

    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleRemoveImage = (index) => {
    const newImages = [...images]
    const newPreviews = [...previews]
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  return (
    <div className="border-t pt-4 mt-4 text-sm">
      <div className="mb-2">
        <strong>Серийный номер:</strong> {data.serial_number}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Модель устройства:</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Введите модель"
          className="w-full border border-slate-300 rounded p-2 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Комментарий:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Добавьте комментарий"
          className="w-full border border-slate-300 rounded p-2 text-sm"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Добавить фото:</label>

        <div className="flex gap-4 mb-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📷 Камера
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            📁 Файлы
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
          multiple
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          multiple
        />

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  alt={`Фото ${index + 1}`}
                  className="w-full max-h-48 object-cover border rounded"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
