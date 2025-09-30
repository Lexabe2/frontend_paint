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
  const [submitting, setSubmitting] = useState(false);
  const [expandedDefect, setExpandedDefect] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Загружаем список банкоматов
  useEffect(() => {
    const fetchAllAtms = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/atm_list/", {
          params: { page: "corrections" },
        });
        setAtms(res.data.atms || []);
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
      setUploadedPhotos({});
    } catch (err) {
      console.error("Ошибка загрузки фото:", err);
      setError("Ошибка загрузки фотографий");
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
    setError("");
  };

  // Проверяем, все ли дефекты закрыты фото
  const defectEntries = Object.entries(photos).filter(([key]) => key.includes("Дефект"));
  const allDefectsUploaded = defectEntries.length > 0 && defectEntries.every(([key]) => uploadedPhotos[key]);
  const uploadedCount = defectEntries.filter(([key]) => uploadedPhotos[key]).length;

  // Отправка исправлений
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/corrections/", {
        atmSerial: selectedAtm.serial_number,
      });

      // Показываем успешное уведомление
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      alert("Исправления успешно отправлены!");
      handleReset();
    } catch (err) {
      console.error("Ошибка отправки:", err);

      // Вибрация при ошибке
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      alert("Ошибка при отправке исправлений. Попробуйте еще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Icons
  const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const ClearIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const ATMIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  const ToolIcon = () => (
    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const AlertIcon = () => (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  const CameraIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const ChevronIcon = ({ isOpen }) => (
    <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const SparkleIcon = () => (
    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  // Loading State
  if (loading && !selectedAtm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Загружаем данные</h3>
          <p className="text-gray-600 text-center">Получаем список банкоматов для исправления...</p>
          <div className="mt-6 flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-2 h-2 bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !selectedAtm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
          <div className="text-red-500 mb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-red-800 text-center mb-2">Упс! Что-то пошло не так</h3>
          <p className="text-red-600 text-center mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4 pb-20">

        {/* Floating Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ToolIcon />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Исправления дефектов
                </h1>
                <p className="text-gray-600">
                  {selectedAtm ? "Загрузите фото исправленных дефектов" : "Найдите банкомат для исправления дефектов"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        {!selectedAtm && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Введите серийный номер или паллету..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className={`block w-full pl-12 pr-12 py-4 border-2 rounded-2xl transition-all duration-300 text-lg font-medium placeholder-gray-400 ${
                    searchFocused 
                      ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/20' 
                      : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'
                  }`}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors"
                    title="Очистить поиск"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>

              {/* Enhanced Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {suggestions.map((atm, index) => (
                    <button
                      key={atm.serial_number}
                      className="w-full text-left p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 group"
                      onClick={() => handleSelect(atm)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <ATMIcon />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg">{atm.serial_number}</div>
                          <div className="text-sm text-gray-600">
                            Паллета: <span className="font-medium">{atm.pallet || "Не указана"}</span> •
                            <span className="font-medium ml-1">{atm.model || "Модель не указана"}</span>
                          </div>
                        </div>
                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {search && suggestions.length === 0 && atms.length > 0 && (
                <div className="mt-6 text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <SearchIcon />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                  <p className="text-gray-600">Попробуйте изменить поисковый запрос</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected ATM Header */}
        {selectedAtm && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Информация о банкомате
                </h2>
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Новый поиск
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Серийный номер:</span>
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                      {selectedAtm.serial_number}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Модель:</span>
                    <span className="font-bold text-gray-900">{selectedAtm.model || "Не указана"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Паллета:</span>
                    <span className="font-mono text-gray-900">{selectedAtm.pallet || "Не указана"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 font-medium">Статус:</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm font-bold rounded-full border border-orange-200">
                      Требует исправлений
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {selectedAtm && defectEntries.length > 0 && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <SparkleIcon />
                  <h3 className="text-xl font-bold text-gray-900">Прогресс исправлений</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{uploadedCount}/{defectEntries.length}</div>
                  <div className="text-sm text-gray-600">дефектов исправлено</div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${defectEntries.length > 0 ? (uploadedCount / defectEntries.length) * 100 : 0}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -bottom-1 bg-white rounded-full w-6 h-6 shadow-lg border-2 border-orange-500 transition-all duration-1000 ease-out"
                     style={{ left: `calc(${defectEntries.length > 0 ? (uploadedCount / defectEntries.length) * 100 : 0}% - 12px)` }}>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4 text-center">
                {allDefectsUploaded ? (
                  <span className="text-green-600 font-semibold flex items-center justify-center space-x-2">
                    <CheckIcon />
                    <span>Все дефекты исправлены! Готово к отправке</span>
                  </span>
                ) : (
                  `Осталось исправить ${defectEntries.length - uploadedCount} из ${defectEntries.length} дефектов`
                )}
              </p>
            </div>
          </div>
        )}

        {/* Defects Section */}
        {selectedAtm && defectEntries.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <ToolIcon />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Дефекты для исправления
              </h3>
            </div>

            {defectEntries.map(([key, value], index) => {
              const urls = Array.isArray(value) ? value : value.split(/(?=http)/).filter(url => url.trim());
              const isUploaded = uploadedPhotos[key];
              const defectName = key.replace("Дефект ", "");
              const isExpanded = expandedDefect === key;

              return (
                <div key={key} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-3xl">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                          isUploaded 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-br from-orange-500 to-red-500'
                        }`}>
                          {isUploaded ? <CheckIcon /> : index + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{defectName}</h4>
                          <p className={`text-sm font-medium ${isUploaded ? 'text-green-600' : 'text-orange-600'}`}>
                            {isUploaded ? 'Исправлено ✨' : 'Требует исправления'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {isUploaded && (
                          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                            <CheckIcon />
                            <span className="text-sm font-bold">Готово</span>
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedDefect(isExpanded ? null : key)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <ChevronIcon isOpen={isExpanded} />
                        </button>
                      </div>
                    </div>

                    {/* Original Photos */}
                    {urls.length > 0 && (
                      <div className="mb-8">
                        <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                          <CameraIcon />
                          <span>Фото дефекта:</span>
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {urls.map((url, idx) => (
                            <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <img
                                src={url.trim()}
                                alt={`${defectName} - фото ${idx + 1}`}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute bottom-2 left-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Фото {idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photo Upload */}
                    <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                      isUploaded 
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
                        : 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50'
                    }`}>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
                            isUploaded ? 'bg-green-500' : 'bg-orange-500'
                          }`}>
                            <CameraIcon />
                          </div>
                          <h5 className="text-lg font-bold text-gray-800">
                            {isUploaded ? 'Фото исправления загружено ✨' : 'Загрузите фото исправления'}
                          </h5>
                        </div>

                        <PhotoCapture
                          onSave={(data) => setPhotoData(data)}
                          defect={`Исправлен ${defectName}`}
                          status="Исправлено"
                          sn={selectedAtm.serial_number}
                          bt="True"
                          onUploadSuccess={() =>
                            setUploadedPhotos((prev) => ({ ...prev, [key]: true }))
                          }
                        />

                        {!isUploaded && (
                          <div className="mt-4 flex items-center text-sm text-orange-700 bg-orange-100 px-4 py-3 rounded-xl">
                            <AlertIcon />
                            <span className="ml-2 font-medium">Фото исправления обязательно для завершения</span>
                          </div>
                        )}
                      </div>

                      {isUploaded && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckIcon />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Defects Message */}
        {selectedAtm && defectEntries.length === 0 && !loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Отличные новости!</h3>
            <p className="text-gray-600 text-lg">У этого банкомата нет дефектов, требующих исправления</p>
            <div className="mt-6 flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <SparkleIcon key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedAtm && allDefectsUploaded && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckIcon />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                Все дефекты исправлены!
              </h3>
              <p className="text-gray-600 text-lg mb-8">Готово к отправке на проверку</p>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-2xl transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 min-w-[250px]"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Отправляем...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <CheckIcon />
                    <span>Отправить исправления</span>
                    <SparkleIcon />
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && selectedAtm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm mx-4 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                </div>
              </div>
              <p className="text-center text-gray-700 font-medium">Загружаем фотографии...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}