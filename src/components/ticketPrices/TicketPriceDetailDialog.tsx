import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, X } from "lucide-react";
import type { TicketPriceType } from "@/types/ticketPrice.type";
import type { FormatType } from "@/types/format.type";
import type { SeatTypeDetailType } from "@/types/seatTypeDetail.type";

interface TicketPriceDetailDialogProps {
  ticketPrice?: TicketPriceType;
  formats: FormatType[];
  seatTypes: SeatTypeDetailType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketPriceDetailDialog({
  ticketPrice,
  formats,
  seatTypes,
  open,
  onOpenChange,
}: TicketPriceDetailDialogProps) {
  if (!ticketPrice) return null;

  // Get format name
  const formatName =
    formats.find((f) => f.id === ticketPrice.format_id)?.name ||
    formats.find((f) => f.id === ticketPrice.format_id)?.type ||
    ticketPrice.format_id;

  // Get seat type name
  const seatTypeName =
    seatTypes.find((s) => s.id === ticketPrice.seat_type_id)?.name ||
    ticketPrice.seat_type_id;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getDayTypeName = (dayType: string) => {
    return dayType === "WEEKDAY" ? "Ngày thường" : "Cuối tuần";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Chi Tiết Giá Vé
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về giá vé
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format */}
          <div className="border-b pb-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Định Dạng
            </div>
            <div className="text-base">{formatName}</div>
          </div>

          {/* Seat Type */}
          <div className="border-b pb-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Loại Ghế
            </div>
            <div className="text-base">{seatTypeName}</div>
          </div>

          {/* Day Type */}
          <div className="border-b pb-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Loại Ngày
            </div>
            <Badge
              className={
                ticketPrice.day_type === "WEEKDAY"
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }
            >
              {getDayTypeName(ticketPrice.day_type)}
            </Badge>
          </div>

          {/* Price */}
          <div className="border-b pb-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Giá Vé
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(ticketPrice.price)}
            </div>
          </div>

          {/* Status */}
          <div className="border-b pb-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Trạng Thái
            </div>
            {ticketPrice.is_active !== false ? (
              <Badge variant="default" className="bg-green-500">
                Hoạt động
              </Badge>
            ) : (
              <Badge variant="destructive">Ngừng</Badge>
            )}
          </div>

          {/* Created At */}
          {ticketPrice.created_at && (
            <div className="pb-3">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Ngày Tạo
              </div>
              <div className="text-sm">
                {new Date(ticketPrice.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
