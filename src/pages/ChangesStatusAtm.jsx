import React, { useEffect, useState } from "react";
import {
  Search,
  History,
  Edit3,
  X,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  User,
  Calendar,
  ChevronDown
} from "lucide-react";
import api from "../api/axios.js";

export default function ATMStatusPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [statusModalAtm, setStatusModalAtm] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const statusOptions = [
    {
      value: "В работе",
      label: "В работе",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: Clock
    },
    {
      value: "Неисправен",
      label: "Неисправен",
      color: "bg-red-100 text-red-700 border-red-300",
      icon: AlertCircle
    },
    {
      value: "Ожидает ремонта",
      label: "Ожидает ремонта",
      color: "bg-amber-100 text-amber-700 border-amber-300",
      icon: Clock
    },
    {
      value: "Готов к установке",
      label: "Готов к установке",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle2
    },
    {
      value: "Готов к передаче в ПП",
      label: "Готов к передаче в ПП",
      color: "bg-slate-100 text-slate-700 border-slate-300",
      icon: CheckCircle2
    }
  ];

  const getStatusConfig = (statusValue) => {
    return statusOptions.find(opt => opt.value === statusValue) || statusOptions[0];
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isStatusDropdownOpen && !event.target.closest('.status-dropdown-modal')) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusDropdownOpen]);

  const fetchItems = () => {
    api
      .get("/status_atm/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setItems(res.data.data))
      .catch((err) => console.error("Ошибка загрузки:", err))
      .finally(() => setLoading(false));
  };

  const fetchHistory = (serialNumber) => {
    setLoadingHistory(true);
    setSelectedAtm(serialNumber);
    api
      .get(`/status_atm/?history=${serialNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setHistory(res.data.history))
      .catch((err) => console.error("Ошибка загрузки истории:", err))
      .finally(() => setLoadingHistory(false));
  };

  const closeHistory = () => {
    setSelectedAtm(null);
    setHistory([]);
  };

  const openStatusModal = (atm) => {
    setStatusModalAtm(atm);
    setNewStatus(atm.status || "");
    setIsStatusDropdownOpen(false);
  };

  const closeStatusModal = () => {
    setStatusModalAtm(null);
    setNewStatus("");
    setIsStatusDropdownOpen(false);
  };

  const handleStatusChange = () => {
    if (!newStatus) return;

    setSaving(true);
    api
      .patch("/status_atm/", {
        serial_number: statusModalAtm.serial_number,
        status: newStatus,
      })
      .then(() => {
        fetchItems();
        closeStatusModal();
      })
      .catch((err) => {
        console.error("Ошибка при изменении статуса:", err);
      })
      .finally(() => setSaving(false));
  };

  const searchedItems = items.filter((atm) => {
    const s = search.toLowerCase();
    return (
      (atm.serial_number && atm.serial_number.toLowerCase().includes(s)) ||
      (atm.request && atm.request.toLowerCase().includes(s)) ||
      (atm.model && atm.model.toLowerCase().includes(s)) ||
      (atm.pallet && atm.pallet.toLowerCase().includes(s)) ||
      (atm.status && atm.status.toLowerCase().includes(s)) ||
      (atm.accepted_at &&
        new Date(atm.accepted_at).toLocaleString().toLowerCase().includes(s))
    );
  });

  const filteredItems = searchedItems.filter((atm) =>
    showCompleted ? true : atm.status?.toLowerCase() !== "завершен"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium text-lg">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const currentStatusConfig = newStatus ? getStatusConfig(newStatus) : null;
  const StatusIcon = currentStatusConfig?.icon;

  return (
    <div className="min-l-screen from-slate-50 via-blue-50 to-slate-100">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 truncate">
                  Статусы банкоматов
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 mt-1">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    Всего: <span className="font-bold text-slate-800">{filteredItems.length}</span>
                  </span>
                </p>
              </div>
              <button
                onClick={fetchItems}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md font-semibold text-sm whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Обновить</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 border-2 border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl outline-none transition-all text-sm"
                />
              </div>

              <label className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 accent-blue-600 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Завершённые
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-3 sm:p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-500">
              {search ? "Ничего не найдено" : "Нет данных"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Серийный номер
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Заявка
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Принят
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Модель
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Паллет
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredItems.map((atm, index) => {
                    const statusConfig = getStatusConfig(atm.status);
                    const AtmStatusIcon = statusConfig.icon;
                    const isCompleted = atm.status?.toLowerCase() === "завершен";

                    return (
                      <tr
                        key={index}
                        className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                          isCompleted ? "opacity-60" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{atm.serial_number}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600">{atm.request || "—"}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {atm.accepted_at
                              ? new Date(atm.accepted_at).toLocaleDateString("ru-RU")
                              : "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600">{atm.model}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200">
                            {atm.pallet || "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${statusConfig.color} rounded-xl border font-semibold text-sm`}>
                            <AtmStatusIcon className="w-4 h-4" />
                            {atm.status || "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchHistory(atm.serial_number)}
                              className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 active:scale-95 transition-all shadow-sm font-medium text-sm"
                            >
                              <History className="w-4 h-4" />
                              История
                            </button>
                            <button
                              onClick={() => openStatusModal(atm)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm font-medium text-sm"
                            >
                              <Edit3 className="w-4 h-4" />
                              Изменить
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {filteredItems.map((atm, index) => {
              const statusConfig = getStatusConfig(atm.status);
              const AtmStatusIcon = statusConfig.icon;
              const isCompleted = atm.status?.toLowerCase() === "завершен";

              return (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-slate-200 overflow-hidden transition-all hover:shadow-xl ${
                    isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-lg mb-1 break-words">
                          {atm.serial_number}
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${statusConfig.color} rounded-xl border font-semibold text-sm`}>
                          <AtmStatusIcon className="w-4 h-4" />
                          <span>{atm.status || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">Заявка</div>
                        <div className="text-slate-700 font-semibold break-words">{atm.request || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">Модель</div>
                        <div className="text-slate-700 font-semibold break-words">{atm.model}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">Паллет</div>
                        <div>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 inline-block">
                            {atm.pallet || "—"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-medium mb-1">Принят</div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold text-xs">
                            {atm.accepted_at
                              ? new Date(atm.accepted_at).toLocaleDateString("ru-RU")
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => fetchHistory(atm.serial_number)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 active:scale-95 transition-all shadow-md font-semibold text-sm"
                      >
                        <History className="w-4 h-4" />
                        <span>История</span>
                      </button>
                      <button
                        onClick={() => openStatusModal(atm)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md font-semibold text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Изменить</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>

      {selectedAtm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeHistory();
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 truncate">
                    История банкомата
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{selectedAtm}</p>
                </div>
                <button
                  onClick={closeHistory}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {loadingHistory ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm sm:text-base text-slate-600">Загрузка истории...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((h, i) => {
                    const historyStatusConfig = getStatusConfig(h.status);
                    const HistoryIcon = historyStatusConfig.icon;

                    return (
                      <div
                        key={i}
                        className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl p-3 sm:p-4 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`p-2 ${historyStatusConfig.color} rounded-lg border flex-shrink-0`}>
                            <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <span className={`px-2.5 sm:px-3 py-1 ${historyStatusConfig.color} rounded-lg border font-bold text-xs sm:text-sm`}>
                                {h.status}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                <span className="break-words">
                                  {h.date_change
                                    ? new Date(h.date_change).toLocaleString("ru-RU")
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                <span className="font-medium break-words">{h.user__username || "—"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-3 sm:p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-3">
                    <History className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
                  </div>
                  <p className="text-sm sm:text-base text-slate-500 font-medium">История отсутствует</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {statusModalAtm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeStatusModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-visible">
            <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 truncate">
                    Изменить статус
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{statusModalAtm.serial_number}</p>
                </div>
                <button
                  onClick={closeStatusModal}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-3">
                Новый статус:
              </label>

              <div className="relative status-dropdown-modal mb-4 sm:mb-6">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 ${currentStatusConfig?.color || 'bg-slate-100 text-slate-700 border-slate-300'} rounded-xl border-2 shadow-sm hover:bg-opacity-80 transition-all font-medium justify-between text-sm sm:text-base`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {StatusIcon && <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                    <span className="truncate">{newStatus || "Выберите статус"}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden z-[60]">
                    {statusOptions.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = option.value === newStatus;
                      return (
                        <button
                          key={option.value}
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewStatus(option.value);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all text-sm sm:text-base ${
                            isSelected
                              ? `${option.color} border-l-4`
                              : 'hover:bg-slate-50 border-l-4 border-transparent'
                          }`}
                        >
                          <OptionIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-medium flex-1 min-w-0 truncate">{option.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={closeStatusModal}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 active:scale-95 transition-all font-semibold text-sm sm:text-base"
                >
                  Отмена
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={saving || !newStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Сохранение...</span>
                    </>
                  ) : (
                    "Сохранить"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
