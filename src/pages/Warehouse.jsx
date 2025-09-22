import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  History,
  X,
  Check,
  Calendar,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
  Loader
} from 'lucide-react';
import api from "../api/axios";

export default function Warehouse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [newPlace, setNewPlace] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editPlace, setEditPlace] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Храним, какие места раскрыты для истории
  const [expandedHistory, setExpandedHistory] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    api.get("/warehouse/")
      .then((res) => {
        setItems(res.data.slots);
      })
      .catch((err) => console.error("Ошибка загрузки:", err))
      .finally(() => setLoading(false));
  };

  const toggleHistory = (id) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const addItem = () => {
    if (!newPlace) return;
    api.post("/warehouse/add/", {
      place_number: newPlace,
      description: newDesc,
    })
      .then(() => {
        setNewPlace("");
        setNewDesc("");
        setShowAddForm(false);
        fetchItems();
      })
      .catch((err) => console.error("Ошибка добавления:", err));
  };

  const deleteItem = (id) => {
    api.delete(`/warehouse/${id}/delete/`)
      .then(() => fetchItems())
      .catch((err) => console.error("Ошибка удаления:", err));
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditPlace(item.place_number);
    setEditDesc(item.description);
  };

  const saveEdit = () => {
    api.put(`/warehouse/${editId}/`, {
      place_number: editPlace,
      description: editDesc,
    })
      .then(() => {
        setEditId(null);
        fetchItems();
      })
      .catch((err) => console.error("Ошибка изменения:", err));
  };

  const filteredItems = items.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.place_number.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">📦 Склад</h1>
            <p className="text-sm text-gray-500">{filteredItems.length} позиций</p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по месту или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Загрузка...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {items.length === 0 ? "Склад пуст" : "Товары не найдены"}
            </h3>
            <p className="text-gray-500">
              {items.length === 0 ? "Добавьте первый товар" : "Попробуйте изменить параметры поиска"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Место {item.place_number}</h3>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 line-clamp-2">{item.description}</p>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(item.date_added).toLocaleString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleHistory(item.id)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                  >
                    <History className="h-4 w-4" />
                    <span className="text-sm">История</span>
                    {expandedHistory[item.id] ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* History Section */}
                {expandedHistory[item.id] && item.history && item.history.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {item.history.map((h, index) => (
                        <div key={h.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="font-medium text-gray-900">{h.action}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600 flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {h.user || "неизвестно"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{h.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(h.date_added).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Добавить оборудование</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Место</label>
                  <input
                    type="number"
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    placeholder="Место"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Описание"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Отмена
                </button>
                <button
                  onClick={addItem}
                  disabled={!newPlace}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Редактировать товар</h2>
                <button
                  onClick={() => setEditId(null)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Место</label>
                  <input
                    type="number"
                    value={editPlace}
                    onChange={(e) => setEditPlace(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Отмена
                </button>
                <button
                  onClick={saveEdit}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  <Check className="h-4 w-4" />
                  <span>Сохранить</span>
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}