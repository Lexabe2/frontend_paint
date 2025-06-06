export default function TableSearchATM({ data }) {
  return (
    <div className="border-t pt-4 mt-4 text-sm">
      <div className="mb-2">
        <strong>Серийный номер:</strong> {data.serial_number}
      </div>
      <div className="mb-2">
        <strong>Модель:</strong> {data.model}
      </div>
      <div className="mb-2">
        <strong>Дата приёмки:</strong> {data.accepted_at}
      </div>
    </div>
  )
}
