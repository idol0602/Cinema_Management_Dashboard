import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  Info,
  Mail,
  Phone,
  Shield,
  UserIcon,
} from "lucide-react";
import type { User } from "@/types/user.type";

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị";
      case "STAFF":
        return "Nhân viên";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6" />
            {user.name}
          </DialogTitle>
          <DialogDescription>Chi tiết đầy đủ về người dùng</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base font-semibold">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Số Điện Thoại
                    </p>
                    <p className="text-base font-semibold">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày Tạo
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Vai Trò
                  </p>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "outline"}
                    className="mt-1"
                  >
                    {user.role === "ADMIN" && (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Trạng Thái
                  </p>
                  <Badge
                    variant={user.is_active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {user.is_active ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Thông Tin Bổ Sung</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• ID: {user.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
