import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios.js";
import {
  Package,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  BarChart3,
  Warehouse,
  Activity
} from "lucide-react";

export default function WarehouseInfo() {
  const [DataReq, setDataReq] = useState([]);
  const [DataATM, setDataATM] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get("/dashboard/?source=warehouse");
      setDataReq(response.data.data || []);
      setDataATM(response.data.atm_counts || []);
    } catch (error) {
      console.error("Ошибка при получении дашборда:", error);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('создан') || statusLower.includes('новая')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (statusLower.includes('принят') || statusLower.includes('выполнен')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (statusLower.includes('ожидан') || statusLower.includes('процесс')) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    if (statusLower.includes('отклонен') || statusLower.includes('ошибка')) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <Activity className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('создан') || statusLower.includes('новая')) {
      return 'from-blue-500 to-cyan-500';
    }
    if (statusLower.includes('принят') || statusLower.includes('выполнен')) {
      return 'from-green-500 to-emerald-500';
    }
    if (statusLower.includes('ожидан') || statusLower.includes('процесс')) {
      return 'from-yellow-500 to-orange-500';
    }
    if (statusLower.includes('отклонен') || statusLower.includes('ошибка')) {
      return 'from-red-500 to-pink-500';
    }
    return 'from-gray-500 to-slate-500';
  };

  const getTotalRequests = () => {
    return DataReq.reduce((sum, item) => sum + (item.count || 0), 0);
  };

  const getTotalATMs = () => {
    return DataATM.reduce((sum, item) => sum + (item.count || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Загрузка данных склада...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full text-center"
        >
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Попробовать снова</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Warehouse className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Склад
              </h1>
              <p className="text-gray-600 mt-1">Обзор заявок и устройств</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Обновить</span>
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Всего заявок</h2>
              </div>
              <div className="text-3xl font-bold text-blue-600">{getTotalRequests()}</div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Активные заявки в системе</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Всего устройств</h2>
              </div>
              <div className="text-3xl font-bold text-green-600">{getTotalATMs()}</div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BarChart3 className="w-4 h-4" />
              <span>Устройства на складе</span>
            </div>
          </motion.div>
        </div>

        {/* Requests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Заявки по статусам</h2>
                <p className="text-gray-600">Распределение заявок по текущим статусам</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {DataReq.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Заявок пока нет</h3>
                    <p className="text-gray-500">Заявки появятся здесь после создания</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {DataReq.map((item, index) => (
                    <motion.div
                      key={item.status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(item.status)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(item.status)}
                            <span className="text-sm font-medium text-gray-600">{item.status}</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{item.count}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getTotalRequests() > 0 ? (item.count / getTotalRequests()) * 100 : 0}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(item.status)}`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {getTotalRequests() > 0 ? Math.round((item.count / getTotalRequests()) * 100) : 0}% от общего числа
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* ATM Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Устройства по статусам</h2>
                <p className="text-gray-600">Распределение устройств по текущим статусам</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {DataATM.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Устройств пока нет</h3>
                    <p className="text-gray-500">Устройства появятся здесь после добавления</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {DataATM.map((item, index) => (
                    <motion.div
                      key={item.status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(item.status)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(item.status)}
                            <span className="text-sm font-medium text-gray-600">{item.status}</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{item.count}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getTotalATMs() > 0 ? (item.count / getTotalATMs()) * 100 : 0}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(item.status)}`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {getTotalATMs() > 0 ? Math.round((item.count / getTotalATMs()) * 100) : 0}% от общего числа
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}