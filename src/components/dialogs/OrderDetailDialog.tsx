import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Film,
  Ticket,
  MapPin,
  Clock,
  UtensilsCrossed,
  Package,
  Percent,
  Sparkles,
  Receipt,
  Calendar,
} from "lucide-react";
import type { OrderDetails, PaymentStatus } from "@/types/order.type";
import { formatVietnamFullDateTime, formatVietnamTime } from "@/utils/datetime";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  orderDetails: OrderDetails | null;
  titleIcon?: React.ReactNode;
  titleText?: string;
  actionButton?: React.ReactNode;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  open,
  onOpenChange,
  loading,
  orderDetails,
  titleIcon = <Receipt className="h-5 w-5" />,
  titleText = "Chi Tiết Đơn Hàng",
  actionButton,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return formatVietnamFullDateTime(dateString);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentStatusBadge = (status?: PaymentStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Chờ thanh toán</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Thất bại</Badge>;
      case "CANCELED":
        return <Badge variant="outline">Đã hủy</Badge>;
      case "REFUND_PENDING":
        return <Badge className="bg-yellow-500">Chờ hoàn tiền</Badge>;
      case "REFUNDED":
        return <Badge className="bg-blue-500">Đã hoàn tiền</Badge>;
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>;
    }
  };

  const isRefundInfo =
    orderDetails?.order.payment_status === "REFUND_PENDING" ||
    orderDetails?.order.payment_status === "REFUNDED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {titleIcon}
              {titleText}
            </span>
            {actionButton && <div className="ml-auto">{actionButton}</div>}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                <p className="font-mono font-semibold text-sm break-all">
                  {orderDetails.order.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                {getPaymentStatusBadge(orderDetails.order.payment_status as PaymentStatus)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                <p className="font-semibold">{orderDetails.order.payment_method || "Tại quầy"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRefundInfo ? "Số tiền hoàn" : "Tổng tiền"}
                </p>
                <p className={`font-semibold text-lg ${isRefundInfo ? 'text-red-600' : 'text-primary'}`}>
                  {formatCurrency(orderDetails.order.total_price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thuế VAT dịch vụ (10%)</p>
                <p className="font-semibold text-orange-500">
                  {formatCurrency(orderDetails.order.service_vat)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày đặt</p>
                <p className="font-semibold">{formatDate(orderDetails.order.created_at)}</p>
              </div>
              {orderDetails.order.requested_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Ngày yêu cầu hoàn</p>
                  <p className="font-semibold text-amber-600">
                    {formatDate(orderDetails.order.requested_at)}
                  </p>
                </div>
              )}
              {orderDetails.order.trans_id && (
                <div className="col-span-full">
                  <p className="text-sm text-muted-foreground">Mã giao dịch</p>
                  <p className="font-mono font-semibold">{orderDetails.order.trans_id}</p>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-semibold">{orderDetails.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-sm break-all">{orderDetails.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="font-semibold">{orderDetails.user.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Film className="h-4 w-4" />
                Thông Tin Phim
              </h3>
              <div className="flex gap-4">
                {orderDetails.movie.thumbnail && (
                  <img
                    src={orderDetails.movie.thumbnail}
                    alt={orderDetails.movie.title}
                    className="w-24 h-32 object-cover rounded shadow-md"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-lg">{orderDetails.movie.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Đạo diễn:</span> {orderDetails.movie.director}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Thể loại:</span> {orderDetails.movie.movie_types.map((type) => {
                      return (
                        <Badge variant="secondary" key={type.id} className="mr-2">{type.type}</Badge>
                      )
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Thời lượng:</span> {orderDetails.movie.duration} phút
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Quốc gia:</span> {orderDetails.movie.country}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground font-medium">Đánh giá:</span>
                    <Badge variant="secondary">{orderDetails.movie.rating?.toFixed(1) || "N/A"}/10</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info */}
            {orderDetails.event && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Sự Kiện Áp Dụng
                </h3>
                <div className="flex gap-4">
                  {orderDetails.event.image && (
                    <img
                      src={orderDetails.event.image}
                      alt={orderDetails.event.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-purple-600">{orderDetails.event.name}</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.event.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{orderDetails.event.event_type?.name}</Badge>
                      <Badge variant="secondary">
                        {formatDate(orderDetails.event.start_date)} - {formatDate(orderDetails.event.end_date)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets */}
            {orderDetails.tickets && orderDetails.tickets.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Ticket className="h-4 w-4" />
                  Vé ({orderDetails.tickets.length} vé)
                </h3>
                <div className="space-y-3">
                  {orderDetails.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-muted/50 rounded-lg gap-4"
                    >
                      <div className="flex items-start gap-4">
                        {ticket.qr_code && (
                          <div className="w-16 h-16 bg-white flex items-center justify-center rounded border shrink-0">
                            <img
                              src={ticket.qr_code}
                              alt="QR Code"
                              className="w-14 h-14 object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-sm px-3 py-1">
                              Ghế {ticket.showtime_seat.seat.seat_number}
                            </Badge>
                            <Badge variant="outline">
                              {ticket.showtime_seat.seat.seat_type.name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Phòng: {ticket.showtime.room.name} ({ticket.showtime.room.format.name})
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Suất chiếu: {formatVietnamTime(ticket.showtime.start_time)} {ticket.showtime.end_time ? `- ${formatVietnamTime(ticket.showtime.end_time)}` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ngày chiếu: {formatDate(ticket.showtime.start_time)}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Loại ngày: {ticket.showtime.day_type === 'WEEKDAY' ? 'Ngày thường' : 'Cuối tuần'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs" title={ticket.showtime.room.location}>
                            📍 {ticket.showtime.room.location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Mã vé: {ticket.id?.slice(-12) || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-semibold text-primary text-lg">
                          {formatCurrency(ticket.ticket_price.price)}
                        </p>
                        <Badge variant={ticket.checked_in ? "default" : "outline"}>
                          {ticket.checked_in ? "Đã check-in" : "Chưa check-in"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items */}
            {orderDetails.menu_items && orderDetails.menu_items.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="h-4 w-4" />
                  Đồ Ăn/Uống ({orderDetails.menu_items.length} món)
                </h3>
                <div className="space-y-2">
                  {orderDetails.menu_items.map((menuItem) => (
                    <div
                      key={menuItem.id}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        {menuItem.item.image && (
                          <img
                            src={menuItem.item.image}
                            alt={menuItem.item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{menuItem.item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {menuItem.quantity} x {formatCurrency(menuItem.unit_price)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(menuItem.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Combos */}
            {orderDetails.combos && orderDetails.combos.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4" />
                  Combo ({orderDetails.combos.length})
                </h3>
                <div className="space-y-2">
                  {orderDetails.combos.map((comboItem) => (
                    <div
                      key={comboItem.id}
                      className="p-3 bg-muted/50 rounded"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">{comboItem.combo.name}</p>
                        <p className="font-semibold text-primary">
                          {formatCurrency(comboItem.combo.total_price)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Bao gồm: {comboItem.combo.items?.map((item) => 
                          `${item.menu_item.name} x${item.quantity}`
                        ).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discount */}
            {orderDetails.discount && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Percent className="h-4 w-4 text-green-500" />
                  Mã Giảm Giá
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-green-600">{orderDetails.discount.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {orderDetails.discount.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Có hiệu lực: {formatDate(orderDetails.discount.valid_from)} - {formatDate(orderDetails.discount.valid_to)}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-lg px-4 py-2">
                    -{orderDetails.discount.discount_percent}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-primary/10">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Receipt className="h-4 w-4" />
                Tổng Kết Đơn Hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tiền vé ({orderDetails.tickets?.length || 0} vé):</span>
                  <span>{formatCurrency(
                    orderDetails.tickets?.reduce((sum, t) => sum + t.ticket_price.price, 0) || 0
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền đồ ăn/uống ({orderDetails.menu_items?.reduce((sum, m) => sum + m.quantity, 0) || 0} món):</span>
                  <span>{formatCurrency(
                    orderDetails.menu_items?.reduce((sum, m) => sum + m.total_price, 0) || 0
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền combo ({orderDetails.combos?.length || 0} phần):</span>
                  <span>{formatCurrency(
                    orderDetails.combos?.reduce((sum, c) => sum + c.combo.total_price, 0) || 0
                  )}</span>
                </div>
                <div className="flex justify-between text-orange-500">
                  <span>Thuế VAT dịch vụ:</span>
                  <span>{formatCurrency(orderDetails.order.service_vat)}</span>
                </div>
                {orderDetails.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({orderDetails.discount.discount_percent}%):</span>
                    <span>-{formatCurrency(
                      ((orderDetails.order.total_price + (orderDetails.discount.discount_percent * orderDetails.order.total_price / (100 - orderDetails.discount.discount_percent))) * orderDetails.discount.discount_percent) / 100
                    )}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>TỔNG CỘNG:</span>
                  <span className={isRefundInfo ? "text-red-600" : "text-primary"}>
                    {formatCurrency(orderDetails.order.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
