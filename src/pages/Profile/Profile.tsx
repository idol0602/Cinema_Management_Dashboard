import { useState } from "react";
import { User, Mail, Phone, Edit, Eye, EyeOff, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@/types/user.type";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "hidden password",
    role: user?.role || "CUSTOMER",
    points: user?.points || 0,
    is_active: user?.is_active || true,
    created_at: user?.created_at || "",
  });
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      CUSTOMER: "Khách hàng",
      STAFF: "Nhân viên",
      ADMIN: "Quản trị viên",
    };
    return roleMap[role] || role;
  };

  const handleChangeForm = (field: keyof UserType, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await updateProfile(formData as UserType);
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "hidden password",
      role: user?.role || "CUSTOMER",
      points: user?.points || 0,
      is_active: user?.is_active || true,
      created_at: user?.created_at || "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin và cài đặt tài khoản của bạn
          </p>
        </div>
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <User size={48} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.name || "Người dùng"}
              </h2>
              <p className="text-gray-500 mt-1">
                {getRoleLabel(formData.role || "CUSTOMER")}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Tham gia từ ngày {formatDate(formData.created_at as string)}
              </p>
            </div>
            <button
              onClick={() => {
                if (isEditMode) {
                  handleCancel();
                } else {
                  setIsEditMode(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              <Edit size={18} />
              {isEditMode ? "Hủy" : "Chỉnh sửa"}
            </button>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleChangeForm("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {formData.name || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChangeForm("email", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nhập email"
                  />
                ) : (
                  <p className="text-gray-900">
                    {formData.email || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Số điện thoại
                </label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleChangeForm("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="text-gray-900">
                    {formData.phone || "Chưa cập nhật"}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chức vụ
                </label>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {getRoleLabel(formData.role || "CUSTOMER")}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm thưởng
                </label>
                <p className="text-3xl font-bold text-purple-600">
                  {formData.points || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <input
                      type={"password"}
                      value={formData.password || ""}
                      onChange={(e) =>
                        handleChangeForm("password", e.target.value)
                      }
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900">••••••</p>
                )}
              </div>
            </div>
          </div>

          {isEditMode && (
            <div className="flex gap-4">
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
              >
                <Check size={18} />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-medium"
              >
                <X size={18} />
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <p className="text-gray-600 text-sm mb-2">Điểm thưởng tích lũy</p>
            <p className="text-4xl font-bold text-purple-600">
              {formData.points || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <p className="text-gray-600 text-sm mb-2">Trạng thái tài khoản</p>
            <div
              className={`inline-block px-4 py-2 rounded-lg font-medium ${
                formData.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {formData.is_active ? "✓ Hoạt động" : "✗ Không hoạt động"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
