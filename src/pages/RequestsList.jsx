import { useEffect, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Package,
  Building2,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  CreditCard,
  User,
  RefreshCw
} from "lucide-react";
import api from "../api/axios";

export default function RequestsList() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Фильтры
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Загружаем заявки
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/requests-list/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке заявок:", err);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Применяем фильтры
  useEffect(() => {
    let filtered = [...requests];

    // Поиск
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.request_id.toString().includes(searchTerm)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Фильтр по проекту
    if (projectFilter !== "all") {
      filtered = filtered.filter(req => req.project === projectFilter);
    }

    // Фильтр по дате
    if (dateFilter !== "all") {
      const today = new Date();
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.date_received);
        const diffTime = Math.abs(today - reqDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            return diffDays <= 1;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, projectFilter, dateFilter]);

  // Получаем уникальные значения для фильтров
  const uniqueProjects = [...new Set(requests.map(req => req.project))];
  const uniqueStatuses = [...new Set(requests.map(req => req.status))];

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'создана':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'в работе':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'выполнена':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'отменена':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'на согласование(покрасочная)':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Функция для получения иконки статуса
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'создана':
        return <FileText className="w-3 h-3" />;
      case 'в работе':
        return <Clock className="w-3 h-3" />;
      case 'выполнена':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'отменена':
        return <XCircle className="w-3 h-3" />;
      case 'на согласование(покрасочная)':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProjectFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Список заявок</h1>
              <p className="text-gray-600">Управление и отслеживание заявок</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium border border-gray-200 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
              <p className="text-sm text-gray-600">из {requests.length} заявок</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по проекту, устройству или ID заявки..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
              showFilters 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Фильтры</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Все статусы</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Проект</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Все проекты</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Период</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Все время</option>
                <option value="today">Сегодня</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
              >
                Очистить фильтры
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium">Загрузка заявок...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-200">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Ошибка загрузки</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {requests.length === 0 ? 'Нет заявок' : 'Заявки не найдены'}
          </h3>
          <p className="text-gray-600">
            {requests.length === 0
              ? 'Заявки появятся здесь после создания'
              : 'Попробуйте изменить параметры поиска или фильтры'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Результаты поиска</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredRequests.length} заявок
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span>ID</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span>Проект</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>Устройство</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>Количество</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Дата создания</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Дедлайн</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-gray-500" />
                      <span>Статус</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((req, index) => (
                  <tr key={req.request_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="font-mono text-gray-900 font-medium">#{req.request_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{req.project}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{req.device}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 font-medium">{req.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{req.date_received}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{req.deadline || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                        {getStatusIcon(req.status)}
                        <span className="ml-2">{req.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {filteredRequests.map((req, index) => (
              <div key={req.request_id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="font-mono text-gray-900 font-semibold">#{req.request_id}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                    {getStatusIcon(req.status)}
                    <span className="ml-1">{req.status}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Проект</p>
                      <p className="text-gray-900 font-semibold">{req.project}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Устройство</p>
                        <p className="text-sm font-medium text-gray-900">{req.device}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Количество</p>
                        <p className="text-sm font-medium text-gray-900">{req.quantity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Создана</p>
                        <p className="text-sm text-gray-700">{req.date_received}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Дедлайн</p>
                        <p className="text-sm text-gray-700">{req.deadline || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}