import api from "../api/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Download,
  Upload,
  ArrowLeft,
  Loader2,
  FileSpreadsheet,
  Search,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function Flow() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pattern, setPattern] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [nameFlow, setNameFlow] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const loadFlows = async () => {
    try {
      const response = await api.get("/flow_list/");
      setPattern(response.data[0].file);
      setFlows(response.data.slice(1));
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleFileUpload = async () => {
    if (!file) {
      alert("Выберите файл!");
      return;
    }

    if (!nameFlow.trim()) {
      alert("Введите название потока!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", nameFlow);

    setUploading(true);
    try {
      await api.post(`/upload_flow/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Поток успешно загружен!");
      setShowModal(false);
      setFile(null);
      setNameFlow("");
      loadFlows();
    } catch (err) {
      alert("Ошибка загрузки файла");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const isFlowCompleted = (flow) => {
    const statuses = flow.statuses;
    return (
      statuses.new === 0 &&
      statuses.received === 0 &&
      statuses.paint === 0 &&
      statuses.waiting_payment === 0 &&
      statuses.paid === flow.total
    );
  };

  const filteredFlows = flows
    .filter((flow) =>
      flow.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aCompleted = isFlowCompleted(a);
      const bCompleted = isFlowCompleted(b);
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      return 0;
    });

  if (loading) {
    return <LoadingSpinner message="Загрузка потоков..." />;
  }

  return (
    <div className="pb-safe-bottom">
      <div className="bg-white border-b border-slate-200 safe-top">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 p-2 md:px-3 md:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline font-medium">Назад</span>
              </button>
              <div className="hidden md:block h-8 w-px bg-slate-200"></div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900">Потоки</h1>
            </div>

            <div className="flex items-center gap-2">
              {pattern && (
                <a
                  href={pattern}
                  download="Шаблон_поток.xlsx"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Шаблон</span>
                </a>
              )}

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm md:text-base"
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium">Загрузить</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск потоков..."
              className="w-full pl-10 md:pl-11 pr-4 py-2 md:py-3 text-sm md:text-base bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {filteredFlows.length === 0 && searchQuery && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-slate-500">Потоки не найдены</p>
          </div>
        )}

        {filteredFlows.length === 0 && !searchQuery && flows.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 md:p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-slate-300" />
            <p className="text-sm md:text-base text-slate-500 mb-4">Нет доступных потоков</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm md:text-base"
            >
              <Upload className="w-4 h-4" />
              Загрузить первый поток
            </button>
          </div>
        )}

        <div className="space-y-2 md:space-y-3">
          {filteredFlows.map((flow) => {
            const completed = isFlowCompleted(flow);
            const statuses = flow.statuses;

            return (
              <div
                key={flow.id}
                onClick={() => navigate(`/flow_detail/${flow.id}`)}
                className={`group bg-white border rounded-lg cursor-pointer transition-all ${
                  completed
                    ? "border-slate-200 opacity-60 hover:opacity-100"
                    : "border-slate-200 hover:border-slate-300 active:scale-[0.99]"
                }`}
              >
                <div className="p-3 md:p-4">
                  <div className="flex items-start md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 truncate">
                        {flow.name}
                      </h3>
                      {completed && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          Завершён
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Прогресс</div>
                        <div className="text-lg md:text-xl font-bold text-slate-900">
                          {flow.total > 0 ? Math.round((statuses.paid / flow.total) * 100) : 0}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Всего</div>
                        <div className="text-lg md:text-xl font-bold text-slate-900">{flow.total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 md:mt-3 h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${flow.total > 0 ? (statuses.paid / flow.total) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <div className="hidden md:block mt-3 max-h-0 overflow-hidden opacity-0 group-hover:max-h-96 group-hover:opacity-100 transition-all duration-300">
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          <span className="text-xs font-medium text-slate-600">Не поступал</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{statuses.new}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full transition-all"
                          style={{ width: `${flow.total > 0 ? (statuses.new / flow.total) * 100 : 0}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-medium text-slate-600">Получен</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{statuses.received}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${flow.total > 0 ? (statuses.received / flow.total) * 100 : 0}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <span className="text-xs font-medium text-slate-600">Окрашивается</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{statuses.paint}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                          style={{ width: `${flow.total > 0 ? (statuses.paint / flow.total) * 100 : 0}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                          <span className="text-xs font-medium text-slate-600">Ожидает оплаты</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{statuses.waiting_payment}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all"
                          style={{ width: `${flow.total > 0 ? (statuses.waiting_payment / flow.total) * 100 : 0}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-medium text-slate-600">Оплачен</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{statuses.paid}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                          style={{ width: `${flow.total > 0 ? (statuses.paid / flow.total) * 100 : 0}%` }}
                        ></div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500 italic">Наведите для подробностей</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-top safe-bottom">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
              <h2 className="text-base md:text-lg font-semibold text-slate-900">Загрузить Excel-файл</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFile(null);
                  setNameFlow("");
                }}
                className="p-1 hover:bg-slate-100 rounded transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Название потока
                </label>
                <input
                  type="text"
                  value={nameFlow}
                  onChange={(e) => setNameFlow(e.target.value)}
                  placeholder="Введите название..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Excel файл
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">
                      {file ? file.name : "Выберите файл"}
                    </span>
                  </label>
                </div>
              </div>

              {!nameFlow.trim() && file && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Укажите название потока
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 md:px-6 py-3 md:py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={handleFileUpload}
                disabled={uploading || !file || !nameFlow.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm md:text-base"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Загрузить
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFile(null);
                  setNameFlow("");
                }}
                disabled={uploading}
                className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all font-medium text-sm md:text-base"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
