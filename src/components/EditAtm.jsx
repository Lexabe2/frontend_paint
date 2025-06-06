import { useState, useRef } from "react"

export default function EditAtm({ data }) {
  const [model, setModel] = useState(data.model || "")
  const [comment, setComment] = useState("")
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  // Ссылки на скрытые input'ы
  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
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

        {/* Камера */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Файлы */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="Фото устройства"
              className="w-full max-h-64 object-contain border rounded"
            />
          </div>
        )}
      </div>
    </div>
  )
}
