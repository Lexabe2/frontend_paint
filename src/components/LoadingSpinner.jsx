export default function LoadingSpinner({ message = "Загрузка..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>

          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin"></div>

          <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-purple-400 animate-spin-reverse"></div>

          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin-slow"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg animate-pulse-scale shadow-lg shadow-blue-500/50"></div>
              <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg blur-md animate-pulse"></div>
            </div>
          </div>

          <div className="absolute -inset-4">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-orbit shadow-lg shadow-blue-400/50"></div>
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-purple-400 rounded-full animate-orbit-delayed shadow-lg shadow-purple-400/50"></div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-orbit-slow shadow-lg shadow-cyan-400/50"></div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-white font-bold text-2xl tracking-wider animate-pulse-text">
            {message}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce-dot"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-dot animation-delay-200"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-dot animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
