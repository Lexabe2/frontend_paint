import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

const CreatedRequestsTable = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCreatedRequests = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await api.get("/requests-list/?status=Создан")
        setRequests(res.data)
      } catch (err) {
        console.error("Ошибка при загрузке заявок:", err)
        setError("Все заявки приняты")
      } finally {
        setLoading(false)
      }
    }

    fetchCreatedRequests()
  }, [])

  const handleApprove = async (requestId) => {
    setUpdating((prev) => ({ ...prev, [requestId]: true }))

    try {
      // переходим на другую страницу
      navigate(`/requests/${requestId}/receive`)
    } catch (error) {
      console.error("Ошибка при оприходовании заявки:", error)
      alert("Не удалось оприходовать заявку")
    } finally {
      setUpdating((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  if (loading) return <p>Загрузка...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>
  if (requests.length === 0) return <p>Нет заявок со статусом "Создан"</p>

  return (
    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Проект</th>
          <th>Устройство</th>
          <th>Количество</th>
          <th>Дата получения</th>
          <th>Дедлайн</th>
          <th>Статус</th>
          <th>Действие</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((req) => (
          <tr key={req.request_id}>
            <td>{req.request_id}</td>
            <td>{req.project}</td>
            <td>{req.device}</td>
            <td>{req.quantity}</td>
            <td>{req.date_received}</td>
            <td>{req.deadline}</td>
            <td>{req.status}</td>
            <td>
              <button
                onClick={() => handleApprove(req.request_id)}
                disabled={updating[req.request_id]}
              >
                {updating[req.request_id] ? "Переход..." : "Оприходовать"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CreatedRequestsTable
