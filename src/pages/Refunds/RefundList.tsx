import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  RefreshCcw,
  Undo2,
  Receipt,
  User,
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Film,
  Armchair,
  Mail,
  Phone,
  DollarSign,
  Search,
  Loader2,
  Popcorn,
  Package,
  Ticket,
  Percent,
  PartyPopper,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { momoService } from "@/services/payment/momo.service";
import type { OrderType, PaymentStatus, OrderDetails } from "@/types/order.type";

const RefundList = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<OrderType | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [startTimeForRefund, setStartTimeForRefund] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await orderService.findAndPaginate({
        page,
        limit: 10,
        filter: {
          payment_status: "REFUND_PENDING",
        }
      });
      if (response.success) {
        setOrders(response.data || []);
        if (response.meta) {
          setCurrentPage(response.meta.currentPage);
          setTotalPages(response.meta.totalPages);
          setTotalItems(response.meta.totalItems);
        }
      } else {
        toast.error(response.error || "Không thể tải danh sách đơn hàng");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = async (orderId: string) => {
    setIsLoadingDetails(true);
    setDetailDialogOpen(true);
    try {
      const response = await orderService.getOrderDetails(orderId);
      if (response.success && response.data) {
        setOrderDetails(response.data as OrderDetails);
      } else {
        toast.error(response.error || "Không thể tải chi tiết đơn hàng");
        setDetailDialogOpen(false);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải chi tiết");
      setDetailDialogOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Vui lòng nhập mã đơn hàng");
      return;
    }

    setIsSearching(true);
    try {
      const response = await orderService.getOrderDetails(searchId.trim());
      if (response.success && response.data) {
        setOrderDetails(response.data as OrderDetails);
        setDetailDialogOpen(true);
      } else {
        toast.error(response.error || "Không tìm thấy đơn hàng");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    fetchOrders(currentPage);
    toast.info("Đang tải lại danh sách...");
  };

  const handleRefundClick = async (order: OrderType) => {
    // Fetch order details để lấy startTime từ showtime
    try {
      const response = await orderService.getOrderDetails(order.id as string);
      if (response.success && response.data) {
        const details = response.data as OrderDetails;
        const startTime = details.tickets.length > 0 
          ? details.tickets[0].showtime.start_time 
          : "";
        setStartTimeForRefund(startTime);
        setOrderToRefund(order);
        setConfirmDialogOpen(true);
      } else {
        toast.error("Không thể tải thông tin đơn hàng");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleRefundFromDetails = () => {
    if (orderDetails) {
      // Tạo OrderType từ OrderDetails
      const order: OrderType = {
        id: orderDetails.order.id,
        user_id: orderDetails.order.user_id,
        movie_id: orderDetails.order.movie_id,
        discount_id: orderDetails.order.discount_id as string,
        service_vat: orderDetails.order.service_vat,
        payment_status: orderDetails.order.payment_status as PaymentStatus || "REFUND_PENDING",
        payment_method: orderDetails.order.payment_method,
        trans_id: orderDetails.order.trans_id as string,
        total_price: orderDetails.order.total_price,
        created_at: orderDetails.order.created_at,
        requested_at: orderDetails.order.requested_at as string,
      };
      // Lấy startTime từ ticket đầu tiên
      const startTime = orderDetails.tickets.length > 0 
        ? orderDetails.tickets[0].showtime.start_time 
        : "";
      setStartTimeForRefund(startTime);
      setOrderToRefund(order);
      setDetailDialogOpen(false);
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmRefund = async () => {
    if (!orderToRefund) return;
    
    setIsRefunding(true);
    try {
      // Gọi API refund MoMo
      const response = await momoService.refundPayment({
        orderId: orderToRefund.id as string,
        transId: orderToRefund.trans_id as string,
        amount: orderToRefund.total_price as number,
        startTime: startTimeForRefund,
        paymentMethod: orderToRefund.payment_method || "MOMO",
        paymentStatus: orderToRefund.payment_status || "REFUND_PENDING",
      });

      if (response.success) {
        toast.success(`Hoàn tiền thành công cho đơn hàng ${orderToRefund.id}`);
        setConfirmDialogOpen(false);
        setOrderToRefund(null);
        setStartTimeForRefund("");
        fetchOrders(currentPage);
      } else {
        toast.error(response.error || "Hoàn tiền thất bại");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi hoàn tiền");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Danh Sách Đã Hoàn Tiền
              </CardTitle>
              <CardDescription>
                Các đơn hàng đã được hoàn tiền thành công
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Section */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhanh theo mã đơn hàng..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Tìm kiếm
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Tổng đơn đã hoàn</p>
                    <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Tổng tiền đã hoàn</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(orders.reduce((sum, o) => sum + (o.total_price || 0), 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Trang hiện tại</p>
                    <p className="text-2xl font-bold text-purple-700">{currentPage} / {totalPages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                Chưa có đơn hàng nào được hoàn tiền
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Mã Đơn</TableHead>
                      <TableHead>Phương Thức</TableHead>
                      <TableHead className="text-right">Số Tiền</TableHead>
                      <TableHead>Ngày Đặt</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {order.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.payment_method}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {formatCurrency(order.total_price || 0)}
                        </TableCell>
                        <TableCell>{formatDateTime(order.created_at as string)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={"bg-amber-50 text-amber-700 border-amber-300"}>{"Chờ hoàn tiền"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(order.id as string)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.payment_status === "REFUND_PENDING" && (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleRefundClick(order)}
                              >
                                <Undo2 className="h-4 w-4 mr-1" />
                                Hoàn tiền
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {orders.length} / {totalItems} đơn hàng
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => fetchOrders(currentPage - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => fetchOrders(currentPage + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Chi Tiết Đơn Hàng
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Mã đơn hàng: <span className="font-mono font-semibold">{orderDetails?.order.id}</span>
              {orderDetails && <Badge variant="outline" className={"bg-amber-50 text-amber-700 border-amber-300"}>{"Chờ hoàn tiền"}</Badge>}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
            {isLoadingDetails ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : orderDetails ? (
              <div className="space-y-6 py-4">
                {/* User Info */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" />
                    Thông Tin Khách Hàng
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{orderDetails.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{orderDetails.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{orderDetails.user.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Movie & ShowTime Info */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Film className="h-4 w-4" />
                    Thông Tin Phim
                  </h4>
                  <div className="flex gap-4">
                    <img
                      src={orderDetails.movie.image}
                      alt={orderDetails.movie.title}
                      className="w-28 h-40 object-cover rounded-lg shadow"
                    />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-lg">{orderDetails.movie.title}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{orderDetails.movie.movie_type.type}</Badge>
                        <span className="text-muted-foreground">|</span>
                        <span>{orderDetails.movie.duration} phút</span>
                        <span className="text-muted-foreground">|</span>
                        <span>⭐ {orderDetails.movie.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Đạo diễn: {orderDetails.movie.director}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quốc gia: {orderDetails.movie.country}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tickets Info */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Ticket className="h-4 w-4" />
                    Thông Tin Vé ({orderDetails.tickets.length} vé)
                  </h4>
                  {orderDetails.tickets.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                      {/* Showtime Info (same for all tickets) */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(orderDetails.tickets[0].showtime.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatTime(orderDetails.tickets[0].showtime.start_time)} - {formatTime(orderDetails.tickets[0].showtime.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{orderDetails.tickets[0].showtime.room.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Film className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{orderDetails.tickets[0].showtime.room.format.name}</Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Seats */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Ghế đã đặt:</p>
                        <div className="flex flex-wrap gap-2">
                          {orderDetails.tickets.map((ticket) => (
                            <div key={ticket.id} className="flex items-center gap-1">
                              <Badge variant="secondary" className="px-3 py-1">
                                <Armchair className="h-3 w-3 mr-1" />
                                {ticket.showtime_seat.seat.seat_number}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({ticket.showtime_seat.seat.seat_type.name} - {formatCurrency(ticket.ticket_price.price)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                {orderDetails.menu_items.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Popcorn className="h-4 w-4" />
                        Đồ Ăn / Thức Uống
                      </h4>
                      <div className="space-y-2">
                        {orderDetails.menu_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.item.image}
                                alt={item.item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{item.item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} x {formatCurrency(item.unit_price)}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Combos */}
                {orderDetails.combos.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4" />
                        Combo
                      </h4>
                      <div className="space-y-3">
                        {orderDetails.combos.map((comboItem) => (
                          <div key={comboItem.id} className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold">{comboItem.combo.name}</p>
                              <span className="font-semibold text-primary">
                                {formatCurrency(comboItem.combo.total_price)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{comboItem.combo.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {comboItem.combo.items.map((item) => (
                                <Badge key={item.id} variant="outline" className="text-xs">
                                  {item.quantity}x {item.menu_item.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Discount & Event */}
                {orderDetails.discount && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Percent className="h-4 w-4" />
                        Mã Giảm Giá
                      </h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-green-700">{orderDetails.discount.name}</p>
                          <Badge className="bg-green-600">-{orderDetails.discount.discount_percent}%</Badge>
                        </div>
                        <p className="text-sm text-green-600">{orderDetails.discount.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Hiệu lực: {formatDate(orderDetails.discount.valid_from)} - {formatDate(orderDetails.discount.valid_to)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {orderDetails.event && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <PartyPopper className="h-4 w-4" />
                        Sự Kiện
                      </h4>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{orderDetails.event.event_type.name}</Badge>
                          <p className="font-semibold text-purple-700">{orderDetails.event.name}</p>
                        </div>
                        <p className="text-sm text-purple-600">{orderDetails.event.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Thời gian: {formatDate(orderDetails.event.start_date)} - {formatDate(orderDetails.event.end_date)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Payment Summary */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4" />
                    Thông Tin Thanh Toán
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phương thức:</span>
                      <Badge variant="outline">{orderDetails.order.payment_method}</Badge>
                    </div>
                    {orderDetails.order.trans_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã giao dịch:</span>
                        <span className="font-mono">{orderDetails.order.trans_id}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày đặt:</span>
                      <span>{formatDateTime(orderDetails.order.created_at)}</span>
                    </div>
                    {orderDetails.order.requested_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày yêu cầu hoàn:</span>
                        <span>{formatDateTime(orderDetails.order.requested_at)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT dịch vụ ({orderDetails.order.service_vat}%):</span>
                      <span>{formatCurrency(orderDetails.order.total_price * orderDetails.order.service_vat / 100)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng tiền đã hoàn:</span>
                      <span className="text-blue-600">
                        {formatCurrency(orderDetails.order.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </ScrollArea>

          <DialogFooter className="p-6 pt-0 border-t mt-4">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
            {orderDetails?.order.payment_status === "REFUND_PENDING" && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleRefundFromDetails}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Hoàn tiền
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Refund Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-amber-500" />
              Xác Nhận Hoàn Tiền
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này?</p>
                {orderToRefund && (
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã đơn:</span>
                      <span className="font-mono font-semibold">{orderToRefund.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền hoàn:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(orderToRefund.total_price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phương thức:</span>
                      <Badge variant="outline">{orderToRefund.payment_method}</Badge>
                    </div>
                  </div>
                )}
                <p className="text-amber-600 text-sm">
                  ⚠️ Hành động này không thể hoàn tác sau khi xác nhận.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRefunding}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmRefund}
              disabled={isRefunding}
            >
              {isRefunding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4 mr-2" />
              )}
              Xác nhận hoàn tiền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RefundList;
