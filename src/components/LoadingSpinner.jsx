export default function LoadingSpinner({ message = "Загрузка..." }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>

          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-600 animate-spin"></div>

          <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-slate-400 animate-spin-reverse"></div>

          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-slate-600 animate-spin-slow"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-700 rounded-lg animate-pulse-scale shadow-lg shadow-blue-500/30"></div>
              <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-700 rounded-lg blur-md animate-pulse opacity-50"></div>
            </div>
          </div>

          <div className="absolute -inset-4">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full animate-orbit shadow-md shadow-blue-500/40"></div>
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-slate-600 rounded-full animate-orbit-delayed shadow-md shadow-slate-600/40"></div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-slate-500 rounded-full animate-orbit-slow shadow-md shadow-slate-500/40"></div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-slate-800 font-bold text-2xl tracking-wider animate-pulse-text">
            {message}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce-dot"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce-dot animation-delay-200"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce-dot animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
