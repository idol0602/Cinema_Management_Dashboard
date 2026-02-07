import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Calendar, Percent } from "lucide-react";
import type { DiscountType } from "@/types/discount.type";
import { formatDateToVietnamese } from "@/utils/datetime";

interface DiscountDetailDialogProps {
  discount: DiscountType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DiscountDetailDialog({
  discount,
  open,
  onOpenChange,
}: DiscountDetailDialogProps) {
  if (!discount) return null;

  const formatDate = formatDateToVietnamese;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chi Tiết Giảm Giá</DialogTitle>
          <DialogDescription>Thông tin chi tiết về giảm giá</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="text-base font-semibold font-mono">{discount.id}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tên Giảm Giá
              </p>
              <Badge variant="secondary" className="mt-1 text-base px-3 py-1">
                {discount.name}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Mô Tả</p>
              <p className="text-base mt-1">{discount.description || "N/A"}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Phần Trăm Giảm Giá
              </p>
              <Badge className="mt-1 text-base">
                {discount.discount_percent}%
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ngày Bắt Đầu
              </p>
              <p className="text-base font-semibold mt-1">
                {formatDate(discount.valid_from)}
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
                {formatDate(discount.valid_to)}
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
                variant={discount.is_active ? "default" : "secondary"}
                className="mt-1"
              >
                {discount.is_active ? "Hoạt động" : "Vô hiệu"}
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
                {formatDate(discount.created_at)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
