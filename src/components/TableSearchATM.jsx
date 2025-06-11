"use client"

import { Package, Hash } from "lucide-react"

export default function TableSearchATM({ data }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm p-3">
      <div className="flex items-center gap-3">
        {/* Серийный номер */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
            <Hash className="w-3 h-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 leading-none">Серийный номер</p>
            <p className="text-sm font-bold text-slate-800 font-mono truncate">{data.serial_number}</p>
          </div>
        </div>

        {/* Разделитель */}
        <div className="w-px h-8 bg-slate-200 flex-shrink-0"></div>

        {/* Модель */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <Package className="w-3 h-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 leading-none">Модель</p>
            <p className="text-sm font-bold text-slate-800 truncate">{data.model}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
