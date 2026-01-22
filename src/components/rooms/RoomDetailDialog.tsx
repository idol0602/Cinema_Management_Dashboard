import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DoorOpen, Calendar, MapPin, Film, Info } from "lucide-react";
import type { RoomType } from "@/types/room.type";
import type { FormatType } from "@/types/format.type";

interface RoomDetailDialogProps {
  room: RoomType | null;
  open: boolean;
  formats?: FormatType[];
  onOpenChange: (open: boolean) => void;
}

export function RoomDetailDialog({
  room,
  open,
  formats = [],
  onOpenChange,
}: RoomDetailDialogProps) {
  if (!room) return null;

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

  const getFormatName = (formatId: string) => {
    const format = formats.find((f) => f.id === formatId);
    return format?.name || "N/A";
  };

  const getFormatBadge = (formatId: string) => {
    const formatName = getFormatName(formatId);
    const variants: Record<string, any> = {
      "2D": "default",
      "3D": "secondary",
      IMAX: "destructive",
    };
    return (
      <Badge variant={variants[formatName] || "default"} className="text-base">
        {formatName}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <DoorOpen className="h-6 w-6" />
            {room.name}
          </DialogTitle>
          <DialogDescription>Chi tiết đầy đủ về phòng chiếu</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Định Dạng
                  </p>
                  <div className="mt-1">{getFormatBadge(room.format_id)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Vị Trí
                  </p>
                  <p className="text-base font-semibold">
                    {room.location || "Chưa cập nhật"}
                  </p>
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
                    {formatDate(room.created_at)}
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
                    variant={room.is_active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {room.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />
        </div>
      </DialogContent>
    </Dialog>
  );
}
