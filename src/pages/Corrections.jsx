import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import PhotoCapture from "../components/PhotoCapture.jsx";

export default function Corrections() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [atms, setAtms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [photoData, setPhotoData] = useState({ photos: [], comment: "" });
  const [photos, setPhotos] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState({});

  // Загружаем список банкоматов
  useEffect(() => {
    const fetchAllAtms = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/atm_list/", {
          params: { page: "corrections" },
        });
        setAtms(res.data.atms);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError("Не удалось загрузить данные. Проверьте подключение к интернету.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllAtms();
  }, []);

  // Подсказки при вводе
  useEffect(() => {
    if (search.trim() === "" || selectedAtm) {
      setSuggestions([]);
      return;
    }
    const filtered = atms.filter(
      (atm) =>
        atm.serial_number.toLowerCase().includes(search.toLowerCase()) ||
        (atm.pallet && atm.pallet.toLowerCase().includes(search.toLowerCase()))
    );
    setSuggestions(filtered.slice(0, 5));
  }, [search, atms, selectedAtm]);

  // Загружаем фото выбранного банкомата
  const fetchPhotos = async (sn) => {
    setLoading(true);
    try {
      const res = await api.get(`/atm/${sn}/photos/`);
      setPhotos(res.data.photos || {});
      setUploadedPhotos({}); // сбрасываем состояние при новом выборе
    } catch (err) {
      console.error("Ошибка загрузки фото:", err);
    } finally {
      setLoading(false);
    }
  };

  // Выбор банкомата
  const handleSelect = (atm) => {
    setSelectedAtm(atm);
    setSearch(atm.serial_number);
    fetchPhotos(atm.serial_number);
    setSuggestions([]);
  };

  // Сброс поиска
  const handleReset = () => {
    setSelectedAtm(null);
    setSearch("");
    setSuggestions([]);
    setPhotos({});
    setUploadedPhotos({});
  };

  // Проверяем, все ли дефекты закрыты фото
  const allDefectsUploaded = Object.entries(photos)
    .filter(([key]) => key.includes("Дефект"))
    .every(([key]) => uploadedPhotos[key]);

  // Отправка исправлений
  const handleSubmit = async () => {
    try {
      await api.post("/corrections/", {
        atmSerial: selectedAtm.serial_number,
      });
      alert("Исправления отправлены!");
      handleReset();
    } catch (err) {
      console.error("Ошибка отправки:", err);
      alert("Ошибка при отправке исправлений");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Поиск банкомата</h1>

      {/* Поисковый блок */}
      {!selectedAtm && (
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Введите серийный номер или паллет"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Подсказки */}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow">
              {suggestions.map((atm) => (
                <li
                  key={atm.serial_number}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => handleSelect(atm)}
                >
                  <span className="font-semibold">{atm.serial_number}</span> -{" "}
                  {atm.pallet || "Не указана"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Кнопка повторного поиска */}
      {selectedAtm && (
        <div className="mb-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Повторный поиск
          </button>
        </div>
      )}

      {/* Карточка банкомата */}
      {selectedAtm && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">
            {selectedAtm.model || "Не указана модель"}
          </h2>
          <p>
            <span className="font-semibold">Серийный номер:</span>{" "}
            {selectedAtm.serial_number}
          </p>
          <p>
            <span className="font-semibold">Паллет:</span>{" "}
            {selectedAtm.pallet || "Не указана"}
          </p>
        </div>
      )}

      {/* Работы/дефекты */}
      {selectedAtm && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">Недочеты</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            {Object.entries(photos)
              .filter(([key]) => key.includes("Дефект"))
              .map(([key, value]) => {
                const urls = Array.isArray(value) ? value : value.split(/(?=http)/);
                return (
                  <div key={key} className="mb-4">
                    <p className="font-semibold">{key.replace("Дефект ", "")}:</p>

                    <PhotoCapture
                      onSave={(data) => setPhotoData(data)}
                      defect={`Исправлен ${key.replace("Дефект ", "")}`}
                      status="Без статуса"
                      sn={selectedAtm.serial_number}
                      bt="True"
                      onUploadSuccess={() =>
                        setUploadedPhotos((prev) => ({ ...prev, [key]: true }))
                      }
                    />

                    <div className="flex flex-wrap gap-2 mt-2">
                      {urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={key}
                          className="w-32 h-32 object-cover rounded border"
                        />
                      ))}
                    </div>

                    {!uploadedPhotos[key] && (
                      <p className="text-sm text-red-500 mt-1">
                        Фото для «{key.replace("Дефект ", "")}» не загружено
                      </p>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Кнопка "Отправить" */}
          {allDefectsUploaded && (
            <button
              onClick={handleSubmit}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Отправить исправления
            </button>
          )}
        </div>
      )}

      {loading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}