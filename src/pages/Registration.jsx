"use client"
import CreatedRequestsTable from "../components/CreatedRequestsTable"

export default function Registration() {
  return (
    <div className="min-h-screen from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Заявки</h1>
          <p className="text-slate-600 text-lg">Список заявок готовых у принятию</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6">
            <CreatedRequestsTable />
          </div>
        </div>
      </div>
    </div>
  )
}
