import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ShowTimeType } from "@/types/showTime.type";
import { parseVietnamDateTime, formatDateToVietnamese } from "@/utils/datetime";

interface ShowTimeDetailDialogProps {
  showTime: ShowTimeType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShowTimeDetailDialog({
  showTime,
  open,
  onOpenChange,
}: ShowTimeDetailDialogProps) {
  if (!showTime) return null;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDayTypeBadge = (dayType?: string) => {
    if (!dayType) return <Badge variant="outline">N/A</Badge>;

    if (dayType.toLowerCase() === "weekend") {
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          {dayType}
        </Badge>
      );
    } else if (dayType.toLowerCase() === "weekday") {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          {dayType}
        </Badge>
      );
    }
    return <Badge variant="outline">{dayType}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi Tiết Suất Chiếu</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết của suất chiếu
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Movie Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Poster
              </h3>
              <img
                src={showTime.movies.thumbnail || ""}
                alt={showTime.movies.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Tên Phim
              </h3>
              <p className="text-base font-semibold">{showTime.movies.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Mô Tả
              </h3>
              <p className="text-sm text-muted-foreground">
                {showTime.movies.description || "N/A"}
              </p>
            </div>
          </div>

          {/* Show Time Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Phòng Chiếu
              </h3>
              <p className="text-base font-semibold">{showTime.rooms.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Ngày Chiếu
              </h3>
              <p className="text-base font-semibold">
                {parseVietnamDateTime(showTime.start_time).date}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Giờ Chiếu
              </h3>
              <p className="text-base font-semibold">
                {parseVietnamDateTime(showTime.start_time).time}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Loại Ngày
              </h3>
              {getDayTypeBadge(showTime.day_type)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Ngày Phát Hành
              </h3>
              <p className="text-sm">
                {formatDateToVietnamese(showTime.movies.release_date)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Thời Lượng
              </h3>
              <p className="text-sm">
                {formatDuration(showTime.movies.duration)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Trạng Thái
              </h3>
              {showTime.is_active !== false ? (
                <Badge variant="default" className="bg-green-500">
                  Hoạt động
                </Badge>
              ) : (
                <Badge variant="destructive">Ngừng</Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
