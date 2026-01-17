import { Home as HomeIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 drop-shadow-lg">
            404
          </h1>
        </div>

        {/* Error message */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Trang không tìm thấy
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-4">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        {/* Error illustration text */}
        <div className="my-12">
          <p className="text-6xl">🎬</p>
          <p className="text-gray-400 text-sm mt-3">
            Có vẻ như chiếc ghế này đã bị đặt...
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>

        {/* Additional info */}
        <p className="text-gray-400 text-sm mt-8">
          Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default NotFound;
