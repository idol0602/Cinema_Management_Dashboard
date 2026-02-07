import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, User, Info } from "lucide-react";
import type { PostType } from "@/types/post.type";
import { formatVietnamFullDateTime } from "@/utils/datetime";

interface PostDetailDialogProps {
  post: PostType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
}: PostDetailDialogProps) {
  if (!post) return null;

  const formatDate = formatVietnamFullDateTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6" />
            {post.title}
          </DialogTitle>
          <DialogDescription>Chi tiết đầy đủ về bài viết</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          {post.image && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Hình Ảnh
              </h3>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Người Tạo
                  </p>
                  <Badge variant="outline" className="mt-1">
                    User #{post.user_id}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày Tạo
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Trạng Thái
                  </p>
                  <Badge
                    variant={post.is_active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {post.is_active ? "Hiển thị" : "Ẩn"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Nội Dung
            </h3>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Thông Tin Bổ Sung</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• ID: {post.id}</p>
              {post.updated_at && (
                <p>• Cập nhật lần cuối: {formatDate(post.updated_at)}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
