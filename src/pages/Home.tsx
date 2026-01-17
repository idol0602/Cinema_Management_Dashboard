function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center px-6 max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <img
            src="/logo.png"
            alt="Cinema Logo"
            className="w-[80%] h-[80%] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Welcome message */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Chào mừng
        </h1>
        <p className="text-2xl md:text-3xl text-purple-200 font-semibold">
          Đến với hệ thống quản lý rạp chiếu phim
        </p>
      </div>
    </div>
  );
}

export default Home;
