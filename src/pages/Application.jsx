"use client"
import React from 'react';
import { useState } from "react"
// import api from '../api/axios'; // Закомментировано для демонстрации

// Мок API для демонстрации
const api = {
  post: async (url, data, config) => {
    // Симуляция API запроса
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      data: {
        id: Date.now(),
        ...data,
      },
    }
  },
}

export default function AddRequestPage() {
  const [requests, setRequests] = useState([])
  const [project, setProject] = useState("")
  const [device, setDevice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [dateReceived, setDateReceived] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddRequest = async () => {
    if (!device || !quantity || !dateReceived || !deadline || !project) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    // Валидация дат
    if (new Date(deadline) <= new Date(dateReceived)) {
      setError("Срок выполнения должен быть позже даты поступления")
      return
    }

    setIsLoading(true)
    setError("")

    const newRequest = {
      project,
      device,
      quantity,
      date_received: dateReceived,
      deadline,
    }

    try {
      const res = await api.post("/requests/", newRequest, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      setRequests([...requests, res.data])

      // Очистка формы
      setDevice("")
      setQuantity("")
      setDateReceived("")
      setDeadline("")
      setProject("")
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error)
      setError("Произошла ошибка при добавлении заявки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Система управления заявками</h1>

      <div className="space-y-4 border p-4 rounded shadow">
        <h2 className="text-xl font-semibold">Добавить заявку</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div>
          <label className="block mb-1 font-medium">Название проекта</label>
          <input
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Название устройства</label>
          <input
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Количество</label>
          <input
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Дата поступления</label>
          <input
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="date"
            value={dateReceived}
            onChange={(e) => setDateReceived(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Сроки</label>
          <input
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddRequest}
          disabled={isLoading}
        >
          {isLoading ? "Добавление..." : "Добавить"}
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Список заявок 1</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Заявки отсутствуют</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="border p-4 rounded shadow bg-gray-50">
              <p>
                <strong>Номер:</strong> {req.id}
              </p>
              <p>
                <strong>Проект:</strong> {req.project}
              </p>
              <p>
                <strong>Устройство:</strong> {req.device}
              </p>
              <p>
                <strong>Количество:</strong> {req.quantity}
              </p>
              <p>
                <strong>Дата поступления:</strong> {req.date_received}
              </p>
              <p>
                <strong>Сроки:</strong> {req.deadline}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
