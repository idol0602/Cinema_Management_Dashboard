import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, Calendar, Info, PlayCircle } from "lucide-react";
import type { SlideType } from "@/types/slide.type";

interface SlideDetailDialogProps {
  slide: SlideType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlideDetailDialog({
  slide,
  open,
  onOpenChange,
}: SlideDetailDialogProps) {
  if (!slide) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ImageIcon className="h-6 w-6" />
            {slide.title || "Chi tiết Slide"}
          </DialogTitle>
          <DialogDescription>Chi tiết đầy đủ về slide</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          {slide.image && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Hình Ảnh
              </h3>
              <img
                src={slide.image}
                alt={slide.title || "Slide"}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          <Separator />

          {/* Title & Content */}
          {slide.title && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Tiêu Đề
              </h3>
              <p className="text-base font-semibold">{slide.title}</p>
            </div>
          )}

          {slide.content && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Nội Dung
                </h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {slide.content}
                </p>
              </div>
            </>
          )}

          {/* Trailer Link */}
          {slide.trailer && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Trailer
                </h3>
                <a
                  href={slide.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <PlayCircle className="h-5 w-5" />
                  Xem Trailer
                </a>
              </div>
            </>
          )}

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Ngày Tạo
                  </p>
                  <p className="text-base font-semibold">
                    {formatDate(slide.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Trạng Thái
                  </p>
                  <Badge
                    variant={slide.is_active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {slide.is_active ? "Đang hiển thị" : "Đã ẩn"}
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
              <p>• ID: {slide.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
