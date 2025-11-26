export default function LoadingSpinner({ message = "Загрузка..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin-slow"></div>
        </div>

        <div className="w-24 h-24 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="absolute mt-40">
        <p className="text-slate-700 font-semibold text-lg tracking-wide animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
