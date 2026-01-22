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
  UtensilsCrossed,
  Calendar,
  DollarSign,
  Package,
  Info,
  Tag,
} from "lucide-react";
import type { MenuItemType } from "@/types/menuItem.type";

interface MenuItemDetailDialogProps {
  menuItem: MenuItemType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemDetailDialog({
  menuItem,
  open,
  onOpenChange,
}: MenuItemDetailDialogProps) {
  if (!menuItem) return null;

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getItemTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      FOOD: "default",
      DRINK: "secondary",
      GIFT: "outline",
    };
    const labels: Record<string, string> = {
      FOOD: "Đồ ăn",
      DRINK: "Đồ uống",
      GIFT: "Quà tặng",
    };
    return (
      <Badge variant={variants[type] || "default"} className="text-base">
        {labels[type] || type}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UtensilsCrossed className="h-6 w-6" />
            {menuItem.name}
          </DialogTitle>
          <DialogDescription>
            Chi tiết đầy đủ về món ăn/đồ uống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          {menuItem.image && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Hình Ảnh
              </h3>
              <img
                src={menuItem.image}
                alt={menuItem.name}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Loại Món
                  </p>
                  <div className="mt-1">
                    {getItemTypeBadge(menuItem.item_type)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Giá
                  </p>
                  <p className="text-base font-semibold">
                    {formatPrice(menuItem.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tồn Kho
                  </p>
                  <Badge
                    variant={
                      menuItem.num_instock && menuItem.num_instock > 0
                        ? "default"
                        : "destructive"
                    }
                    className="mt-1"
                  >
                    {menuItem.num_instock} sản phẩm
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
                    {formatDate(menuItem.created_at)}
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
                    variant={menuItem.is_active ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {menuItem.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {menuItem.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Mô Tả
                </h3>
                <p className="text-base leading-relaxed">
                  {menuItem.description}
                </p>
              </div>
            </>
          )}

          <Separator />
        </div>
      </DialogContent>
    </Dialog>
  );
}
