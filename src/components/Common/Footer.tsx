import { Link } from "react-router-dom";
import { Film } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">
                Cinema Management
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              Hệ thống quản lý rạp chiếu phim chuyên nghiệp và hiện đại
            </p>
          </div>

          {/* Management Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Quản lý nội dung</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/movies"
                  className="hover:text-white transition-colors"
                >
                  Phim
                </Link>
              </li>
              <li>
                <Link
                  to="/movie-types"
                  className="hover:text-white transition-colors"
                >
                  Thể loại phim
                </Link>
              </li>
              <li>
                <Link
                  to="/show-times"
                  className="hover:text-white transition-colors"
                >
                  Suất chiếu
                </Link>
              </li>
              <li>
                <Link
                  to="/rooms"
                  className="hover:text-white transition-colors"
                >
                  Phòng chiếu
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Dịch vụ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/combos"
                  className="hover:text-white transition-colors"
                >
                  Combo
                </Link>
              </li>
              <li>
                <Link
                  to="/menu-items"
                  className="hover:text-white transition-colors"
                >
                  Menu Items
                </Link>
              </li>
              <li>
                <Link
                  to="/discounts"
                  className="hover:text-white transition-colors"
                >
                  Giảm giá
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="hover:text-white transition-colors"
                >
                  Sự kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* System Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Hệ thống</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/posts"
                  className="hover:text-white transition-colors"
                >
                  Bài viết
                </Link>
              </li>
              <li>
                <Link
                  to="/slides"
                  className="hover:text-white transition-colors"
                >
                  Slide Banner
                </Link>
              </li>
              <li>
                <Link
                  to="/users"
                  className="hover:text-white transition-colors"
                >
                  Người dùng
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Cinema Management System. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
