import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Calendar, Image } from "lucide-react";
import type { EventType } from "@/types/event.type";

interface EventDetailDialogProps {
  event: EventType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventDetailDialog({
  event,
  open,
  onOpenChange,
}: EventDetailDialogProps) {
  if (!event) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi Tiết Sự Kiện</DialogTitle>
          <DialogDescription>Thông tin chi tiết về sự kiện</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-base font-semibold font-mono">{event.id}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tên Sự Kiện
              </p>
              <Badge variant="secondary" className="mt-1 text-base px-3 py-1">
                {event.name}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Mô Tả</p>
              <p className="text-base mt-1">{event.description || "N/A"}</p>
            </div>
          </div>

          <Separator />

          {event.image && (
            <>
              <div className="flex items-start gap-3">
                <Image className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Hình Ảnh
                  </p>
                  <img
                    src={event.image}
                    alt={event.name}
                    className="mt-2 rounded-lg max-h-48 object-cover"
                  />
                </div>
              </div>

              <Separator />
            </>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ngày Bắt Đầu
              </p>
              <p className="text-base font-semibold mt-1">
                {formatDate(event.start_date)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ngày Kết Thúc
              </p>
              <p className="text-base font-semibold mt-1">
                {formatDate(event.end_date)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Trạng Thái
              </p>
              <Badge
                variant={event.is_active ? "default" : "secondary"}
                className="mt-1"
              >
                {event.is_active ? "Hoạt động" : "Vô hiệu"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ngày Tạo
              </p>
              <p className="text-base font-semibold mt-1">
                {formatDate(event.created_at)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
