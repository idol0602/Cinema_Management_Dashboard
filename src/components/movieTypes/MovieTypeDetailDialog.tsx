import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, Calendar, Info } from "lucide-react";
import type { MovieTypeType } from "@/types/movieType.type";
import { formatVietnamFullDateTime } from "@/utils/datetime";

interface MovieTypeDetailDialogProps {
  movieType: MovieTypeType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieTypeDetailDialog({
  movieType,
  open,
  onOpenChange,
}: MovieTypeDetailDialogProps) {
  if (!movieType) return null;

  const formatDate = formatVietnamFullDateTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Tag className="h-6 w-6" />
            {movieType.type}
          </DialogTitle>
          <DialogDescription>Chi tiết thể loại phim</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  ID Thể Loại
                </p>
                <p className="text-base font-semibold font-mono">
                  {movieType.id}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Tên Thể Loại
                </p>
                <Badge variant="secondary" className="mt-1 text-base px-3 py-1">
                  {movieType.type}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày Tạo
                </p>
                <p className="text-base font-semibold">
                  {formatDate(movieType.created_at)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Trạng Thái</p>
              <p className="text-xs text-muted-foreground">
                Trạng thái hiển thị trong hệ thống
              </p>
            </div>
            {movieType.is_active !== false ? (
              <Badge className="bg-green-500">Đang Hoạt Động</Badge>
            ) : (
              <Badge variant="destructive">Ngừng Hoạt Động</Badge>
            )}
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Thể loại phim này được sử dụng để phân loại các bộ phim trong hệ
              thống. Bạn có thể chỉnh sửa hoặc xóa thể loại này nếu cần.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
