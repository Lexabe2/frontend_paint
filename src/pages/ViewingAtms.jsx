import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios.js";
import * as XLSX from "xlsx";

export default function AtmViewing() {
  const [allAtms, setAllAtms] = useState([]);
  const [filteredAtms, setFilteredAtms] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Все");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid | table
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedAtms, setSelectedAtms] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const searchInputRef = useRef(null);
  const filtersRef = useRef(null);

  const showToast = (text, type = "success", ms = 3000) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), ms);

    // Тактильная обратная связь для PWA
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
    }
  };

  useEffect(() => {
    const fetchAllAtms = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/atm_list/", {
          params: { page: "viewing" },
        });

        const atms = res.data.atms || [];
        setAllAtms(atms);
        setFilteredAtms(atms);
        showToast(`Загружено ${atms.length} банкоматов`);
      } catch (err) {
        console.error("Ошибка при загрузке:", err);
        setError("Не удалось загрузить данные. Проверьте подключение к интернету.");
        showToast("Ошибка загрузки данных", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchAllAtms();
  }, []);

  // Pull to refresh для PWA
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (diff < -100 && window.scrollY === 0) {
        setRefreshing(true);
        window.location.reload();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
        if (e.key === 'e') {
          e.preventDefault();
          exportToExcel();
        }
      }
      if (e.key === 'Escape') {
        setShowFilters(false);
        setSelectedAtms(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredAtms]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("ru-RU");
  };

  // Сортировка
  const sortAtms = (atms) => {
    return [...atms].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'date':
          aVal = new Date(a.accepted_at || 0);
          bVal = new Date(b.accepted_at || 0);
          break;
        case 'serial':
          aVal = a.serial_number || '';
          bVal = b.serial_number || '';
          break;
        case 'model':
          aVal = a.model || '';
          bVal = b.model || '';
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Фильтрация
  useEffect(() => {
    let data = allAtms;

    if (statusFilter !== "Все") {
      data = data.filter((atm) => atm.status === statusFilter);
    }

    if (dateFrom) {
      data = data.filter((atm) => {
        if (!atm.accepted_at) return false;
        return new Date(atm.accepted_at) >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      data = data.filter((atm) => {
        if (!atm.accepted_at) return false;
        return new Date(atm.accepted_at) <= new Date(dateTo);
      });
    }

    if (search.trim() !== "") {
      data = data.filter(
        (atm) =>
          atm.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
          atm.pallet?.toLowerCase().includes(search.toLowerCase()) ||
          atm.model?.toLowerCase().includes(search.toLowerCase())
      );
    }

    data = sortAtms(data);
    setFilteredAtms(data);
  }, [search, statusFilter, dateFrom, dateTo, allAtms, sortBy, sortOrder]);

  const statuses = ["Все", ...new Set(allAtms.map((atm) => atm.status).filter(Boolean))];

  const exportToExcel = async () => {
    if (filteredAtms.length === 0) {
      showToast("Нет данных для экспорта", "error");
      return;
    }

    setIsExporting(true);

    try {
      const dataToExport = selectedAtms.size > 0
        ? filteredAtms.filter((_, idx) => selectedAtms.has(idx))
        : filteredAtms;

      const ws = XLSX.utils.json_to_sheet(
        dataToExport.map((atm) => ({
          "Серийный номер": atm.serial_number,
          "Модель": atm.model,
          "Паллета": atm.pallet,
          "Статус": atm.status,
          "Дата оприходования": formatDate(atm.accepted_at),
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Банкоматы");
      XLSX.writeFile(wb, `bankomaty_${new Date().toISOString().split('T')[0]}.xlsx`);

      showToast(`Экспортировано ${dataToExport.length} записей`);
      setSelectedAtms(new Set());
    } catch (err) {
      showToast("Ошибка экспорта", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleAtmSelection = (index) => {
    const newSelected = new Set(selectedAtms);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedAtms(newSelected);
  };

  const selectAllAtms = () => {
    if (selectedAtms.size === filteredAtms.length) {
      setSelectedAtms(new Set());
    } else {
      setSelectedAtms(new Set(filteredAtms.map((_, idx) => idx)));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("Все");
    setDateFrom("");
    setDateTo("");
    setSelectedAtms(new Set());
    showToast("Фильтры очищены");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Принят': 'from-green-500 to-emerald-500',
      'В работе': 'from-blue-500 to-indigo-500',
      'Готов': 'from-purple-500 to-pink-500',
      'Отправлен': 'from-orange-500 to-red-500',
      'Дефект': 'from-red-500 to-pink-500',
    };
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  // Icons
  const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const FilterIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  );

  const GridIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );

  const TableIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V10z" />
    </svg>
  );

  const ExportIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const SortIcon = ({ active, order }) => (
    <svg className={`w-4 h-4 transition-all duration-200 ${active ? 'text-blue-600' : 'text-gray-400'} ${order === 'desc' && active ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const ATMIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  const SparkleIcon = () => (
    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto p-4 pb-20 lg:pb-8 relative z-10">

        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
                  <ATMIcon />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Просмотр банкоматов
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-base">
                    {loading ? "Загружаем данные..." : `Найдено ${filteredAtms.length} из ${allAtms.length} банкоматов`}
                  </p>
                  <div className="hidden lg:block mt-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Ctrl+K для поиска • Ctrl+E для экспорта • Потяните вниз для обновления
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{allAtms.length}</div>
                  <div className="text-xs text-gray-500">Всего</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{filteredAtms.length}</div>
                  <div className="text-xs text-gray-500">Показано</div>
                </div>
                {selectedAtms.size > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedAtms.size}</div>
                    <div className="text-xs text-gray-500">Выбрано</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Controls */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-8">

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Поиск по серийному номеру, паллете или модели..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`block w-full pl-12 pr-4 py-4 lg:py-5 border-2 rounded-2xl transition-all duration-300 text-lg font-medium placeholder-gray-400 ${
                  searchFocused 
                    ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-500/20 scale-105' 
                    : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'
                }`}
              />
            </div>

            {/* Controls Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

              {/* Left Controls */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`group flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                    showFilters 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <FilterIcon />
                  <span>Фильтры</span>
                  {(statusFilter !== "Все" || dateFrom || dateTo) && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>

                <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <GridIcon />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'table' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TableIcon />
                  </button>
                </div>

                {selectedAtms.size > 0 && (
                  <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-2xl">
                    <CheckIcon />
                    <span className="font-medium">{selectedAtms.size} выбрано</span>
                    <button
                      onClick={() => setSelectedAtms(new Set())}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex flex-wrap gap-3">
                {(search || statusFilter !== "Все" || dateFrom || dateTo || selectedAtms.size > 0) && (
                  <button
                    onClick={clearFilters}
                    className="group px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300 font-medium"
                  >
                    Очистить
                  </button>
                )}

                <button
                  onClick={exportToExcel}
                  disabled={isExporting || filteredAtms.length === 0}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isExporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Экспорт...</span>
                    </>
                  ) : (
                    <>
                      <ExportIcon />
                      <span>Excel</span>
                      <SparkleIcon />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div
                ref={filtersRef}
                className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {statuses.map((st, i) => (
                        <option key={i} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата от</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата до</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
                    <div className="flex space-x-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="date">По дате</option>
                        <option value="serial">По серийному номеру</option>
                        <option value="model">По модели</option>
                        <option value="status">По статусу</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
                      >
                        <SortIcon active={true} order={sortOrder} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transform transition-all duration-300 hover:scale-105 ${
              toast.type === "success" 
                ? "bg-green-50/90 text-green-800 border-green-200" 
                : "bg-red-50/90 text-red-800 border-red-200"
            }`}>
              <div className="flex items-center space-x-3">
                {toast.type === "success" ? <CheckIcon /> : <SearchIcon />}
                <span className="font-medium">{toast.text}</span>
                <SparkleIcon />
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Загружаем банкоматы</h3>
            <p className="text-gray-600">Получаем актуальную информацию...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-xl border-2 border-red-200 rounded-3xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Ошибка загрузки</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl transition-colors font-semibold"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Bulk Actions */}
            {selectedAtms.size > 0 && (
              <div className="mb-6">
                <div className="bg-purple-50/80 backdrop-blur-xl border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckIcon />
                      <span className="font-semibold text-purple-800">
                        Выбрано {selectedAtms.size} банкоматов
                      </span>
                    </div>
                    <button
                      onClick={selectAllAtms}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {selectedAtms.size === filteredAtms.length ? 'Снять выделение' : 'Выбрать все'}
                    </button>
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors font-medium"
                  >
                    Экспорт выбранных
                  </button>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAtms.length > 0 ? (
                  filteredAtms.map((atm, idx) => (
                    <div
                      key={idx}
                      className={`group bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative overflow-hidden ${
                        selectedAtms.has(idx) ? 'ring-4 ring-purple-500/50 bg-purple-50/80' : ''
                      }`}
                      onClick={() => toggleAtmSelection(idx)}
                    >
                      {/* Selection Indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        selectedAtms.has(idx) 
                          ? 'bg-purple-600 border-purple-600' 
                          : 'border-gray-300 group-hover:border-purple-400'
                      }`}>
                        {selectedAtms.has(idx) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <CheckIcon />
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(atm.status)} shadow-lg`}>
                        {atm.status || "—"}
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                          {atm.model || "Неизвестная модель"}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Серийный номер:</span>
                            <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {atm.serial_number || "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Паллета:</span>
                            <span className="font-medium text-gray-900">
                              {atm.pallet || "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Дата:</span>
                            <span className="font-medium text-gray-900">
                              {formatDate(atm.accepted_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Дата:</span>
                            <span className="font-medium text-gray-900">
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-300"></div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <SearchIcon />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Банкоматы не найдены</h3>
                      <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска или фильтры</p>
                      <button
                        onClick={clearFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-colors font-semibold"
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {filteredAtms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                          <th className="p-4 text-left">
                            <input
                              type="checkbox"
                              checked={selectedAtms.size === filteredAtms.length && filteredAtms.length > 0}
                              onChange={selectAllAtms}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                          </th>
                          <th className="p-4 text-left font-semibold text-gray-900">Модель</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Серийный номер</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Паллета</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Статус</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Дата</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAtms.map((atm, idx) => (
                          <tr
                            key={idx}
                            className={`border-t border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                              selectedAtms.has(idx) ? 'bg-purple-50/50' : ''
                            }`}
                            onClick={() => toggleAtmSelection(idx)}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedAtms.has(idx)}
                                onChange={() => toggleAtmSelection(idx)}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                              />
                            </td>
                            <td className="p-4 font-medium text-gray-900">
                              {atm.model || "Неизвестная модель"}
                            </td>
                            <td className="p-4">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                {atm.serial_number || "—"}
                              </span>
                            </td>
                            <td className="p-4 text-gray-700">{atm.pallet || "—"}</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(atm.status)}`}>
                                {atm.status || "—"}
                              </span>
                            </td>
                            <td className="p-4 text-gray-700">{formatDate(atm.accepted_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <SearchIcon />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Банкоматы не найдены</h3>
                    <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.3s ease-out;
        }
        @keyframes slideInFromTop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}