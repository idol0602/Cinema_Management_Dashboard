import { useEffect, useState } from "react";
import { User, Mail, Phone, Edit, Eye, EyeOff, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@/types/user.type";
import { roleService } from "../../services/role.service";
import type { RoleType } from "@/types/role.type";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "hidden password",
    role: user?.role || "CUSTOMER",
    is_active: user?.is_active || true,
    created_at: user?.created_at || "",
  });
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getRoleLabel = (roleId: string) => {
    const roleName = roles.find((r) => r.id === roleId)?.name || "Khách hàng";
    return roleName;
  };

  const handleChangeForm = (field: keyof UserType, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      setRoles(response.data as RoleType[]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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
      is_active: user?.is_active || true,
      created_at: user?.created_at || "",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin và cài đặt tài khoản của bạn
          </p>
        </div>
        {/* Profile Card */}
        <div className="bg-card rounded-lg shadow-md p-8 mb-8 border border-border">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground shadow-lg text-4xl font-bold uppercase">
              {formData.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {formData.name || "Người dùng"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {formData.role || "Khách hàng"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
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
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition font-medium"
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Họ và tên
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleChangeForm("name", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-background text-foreground"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <p className="text-foreground font-medium">
                    {formData.name || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email
                </label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChangeForm("email", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-background text-foreground"
                    placeholder="Nhập email"
                  />
                ) : (
                  <p className="text-foreground">
                    {formData.email || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Số điện thoại
                </label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleChangeForm("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-background text-foreground"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="text-foreground">
                    {formData.phone || "Chưa cập nhật"}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chức vụ
                </label>
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {formData.role || "Khách hàng"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                      className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-background text-foreground"
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : (
                  <p className="text-foreground">••••••</p>
                )}
              </div>
            </div>
          </div>

          {isEditMode && (
            <div className="flex gap-4">
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 disabled:bg-muted text-accent-foreground rounded-lg transition font-medium"
              >
                <Check size={18} />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/70 text-muted-foreground rounded-lg transition font-medium"
              >
                <X size={18} />
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition border border-border">
            <p className="text-muted-foreground text-sm mb-2">
              Trạng thái tài khoản
            </p>
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
