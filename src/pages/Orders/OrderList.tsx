import { useState, useEffect } from "react";
import { orderService } from "@/services/order.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  User,
  Film,
  Ticket,
  UtensilsCrossed,
  Package,
  Percent,
  Printer,
  MapPin,
  Clock,
  Sparkles,
  Receipt,
} from "lucide-react";
import type { OrderType, OrderDetails, PaymentStatus } from "@/types/order.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { orderPaginationConfig } from "@/config/paginate/order.config";
import { formatVietnamFullDateTime, formatVietnamTime } from "@/utils/datetime";
import InvoiceDialog from "@/components/invoices/InvoiceDialog";

const OrderList = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    itemsPerPage: orderPaginationConfig.defaultLimit,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
  });

  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Invoice dialog states
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const paymentStatusOptions = [
    { value: "PENDING", label: "Chờ thanh toán" },
    { value: "COMPLETED", label: "Đã thanh toán" },
    { value: "FAILED", label: "Thất bại" },
    { value: "CANCELED", label: "Đã hủy" },
    { value: "REFUND_PENDING", label: "Chờ hoàn tiền" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
  ];

  const findAndPaginate = async (
    page = 1,
    limit = orderPaginationConfig.defaultLimit,
    sortBy = orderPaginationConfig.defaultSortBy[0][0] +
      ":" +
      orderPaginationConfig.defaultSortBy[0][1],
    search = undefined,
    searchBy = undefined,
    filter = {}
  ) => {
    setLoading(true);
    try {
      const response = await orderService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        setOrders(response.data as OrderType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]);

  const handleSearch = () => {
    let sortBy =
      orderPaginationConfig.defaultSortBy[0][0] +
      ":" +
      orderPaginationConfig.defaultSortBy[0][1];
    if (sortColumn && orderColumn) {
      sortBy = `${sortColumn}:${orderColumn}`;
    } else if (sortColumn) {
      sortBy = `${sortColumn}:DESC`;
    }

    const filter: Record<string, any> = {};
    if (paymentStatusFilter) {
      filter.payment_status = paymentStatusFilter;
    }

    findAndPaginate(
      currentPage,
      orderPaginationConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
      Object.keys(filter).length > 0 ? filter : undefined
    );
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  // Handle view order details
  const handleView = async (order: OrderType) => {
    if (!order.id) return;
    
    setDetailDialogOpen(true);
    setDetailLoading(true);
    
    try {
      const response = await orderService.getOrderDetails(order.id);
      if (response.success && response.data) {
        setSelectedOrderDetails(response.data as OrderDetails);
      } else {
        toast.error("Không thể tải chi tiết đơn hàng");
        setDetailDialogOpen(false);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải chi tiết đơn hàng");
      console.error(error);
      setDetailDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Format date - using datetime utility for timezone conversion
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return formatVietnamFullDateTime(dateString);
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get payment status badge
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Quản Lý Đơn Hàng
              </CardTitle>
              <CardDescription>
                Quản lý danh sách đơn hàng và thông tin chi tiết
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Combobox
              datas={paymentStatusOptions}
              placeholder="Trạng thái thanh toán"
              onChange={setPaymentStatusFilter}
              value={paymentStatusFilter}
            ></Combobox>
            <Combobox
              datas={orderPaginationConfig.searchableColumns}
              placeholder="Tìm theo"
              onChange={setSearchColumn}
              value={searchColumn}
            ></Combobox>
            <Combobox
              datas={orderPaginationConfig.sortableColumns}
              placeholder="Sắp xếp theo"
              onChange={setSortColumn}
              value={sortColumn}
            ></Combobox>
            <Combobox
              datas={[
                {
                  value: "ASC",
                  label: "tăng dần",
                },
                {
                  value: "DESC",
                  label: "giảm dần",
                },
              ]}
              placeholder="Thứ tự"
              onChange={setOrderColumn}
              value={orderColumn}
            ></Combobox>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Mã Đơn Hàng</TableHead>
                      <TableHead className="w-[60px]">Poster</TableHead>
                      <TableHead>
                        <Film className="h-4 w-4 inline mr-1" />
                        Phim
                      </TableHead>
                      <TableHead>
                        <User className="h-4 w-4 inline mr-1" />
                        Khách Hàng
                      </TableHead>
                      <TableHead>
                        <CreditCard className="h-4 w-4 inline mr-1" />
                        Phương Thức
                      </TableHead>
                      <TableHead className="text-right">Tổng Tiền</TableHead>
                      <TableHead className="text-center">Trạng Thái</TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Ngày Tạo
                      </TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage +
                            index +
                            1}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {order.id?.slice(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.movies?.thumbnail ? (
                            <img
                              src={order.movies.thumbnail}
                              alt={order.movies?.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                              <Film className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-semibold truncate">
                              {order.movies?.title || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.movies?.duration ? `${order.movies.duration} phút` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[180px]">
                            <p className="font-semibold truncate">
                              {order.users?.name || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {order.users?.email || ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.payment_method || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total_price)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getPaymentStatusBadge(order.payment_status)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(order)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(order)}
                              title="In vé"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(meta.currentPage - 1) * meta.itemsPerPage + 1} -{" "}
                  {Math.min(
                    meta.currentPage * meta.itemsPerPage,
                    meta.totalItems
                  )}{" "}
                  của {meta.totalItems} đơn hàng
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === meta.totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(meta.totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage === meta.totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Chi Tiết Đơn Hàng
              </span>
              {selectedOrderDetails && (
                <Button
                  onClick={() => setInvoiceDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In Vé
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : selectedOrderDetails ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-mono font-semibold text-sm break-all">{selectedOrderDetails.order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  {getPaymentStatusBadge(selectedOrderDetails.order.payment_status as PaymentStatus)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                  <p className="font-semibold">{selectedOrderDetails.order.payment_method || "Tại quầy"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền</p>
                  <p className="font-semibold text-lg text-primary">
                    {formatCurrency(selectedOrderDetails.order.total_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thuế VAT dịch vụ (10%)</p>
                  <p className="font-semibold text-orange-500">
                    {formatCurrency(selectedOrderDetails.order.service_vat)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đặt</p>
                  <p className="font-semibold">{formatDate(selectedOrderDetails.order.created_at)}</p>
                </div>
                {selectedOrderDetails.order.trans_id && (
                  <div className="col-span-full">
                    <p className="text-sm text-muted-foreground">Mã giao dịch</p>
                    <p className="font-mono font-semibold">{selectedOrderDetails.order.trans_id}</p>
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
                    <p className="font-semibold">{selectedOrderDetails.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-sm break-all">{selectedOrderDetails.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-semibold">{selectedOrderDetails.user.phone || "N/A"}</p>
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
                  {selectedOrderDetails.movie.thumbnail && (
                    <img
                      src={selectedOrderDetails.movie.thumbnail}
                      alt={selectedOrderDetails.movie.title}
                      className="w-24 h-32 object-cover rounded shadow-md"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-lg">{selectedOrderDetails.movie.title}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Đạo diễn:</span> {selectedOrderDetails.movie.director}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Thể loại:</span> {selectedOrderDetails.movie.movie_types.map((type) => {
                        return (
                          <Badge variant="secondary" key={type.id} className="mr-2">{type.type}</Badge>
                        )
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Thời lượng:</span> {selectedOrderDetails.movie.duration} phút
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Quốc gia:</span> {selectedOrderDetails.movie.country}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground font-medium">Đánh giá:</span>
                      <Badge variant="secondary">{selectedOrderDetails.movie.rating?.toFixed(1)}/10</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              {selectedOrderDetails.event && (
                <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Sự Kiện Áp Dụng
                  </h3>
                  <div className="flex gap-4">
                    {selectedOrderDetails.event.image && (
                      <img
                        src={selectedOrderDetails.event.image}
                        alt={selectedOrderDetails.event.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-purple-600">{selectedOrderDetails.event.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrderDetails.event.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{selectedOrderDetails.event.event_type?.name}</Badge>
                        <Badge variant="secondary">
                          {formatDate(selectedOrderDetails.event.start_date)} - {formatDate(selectedOrderDetails.event.end_date)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tickets */}
              {selectedOrderDetails.tickets && selectedOrderDetails.tickets.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Ticket className="h-4 w-4" />
                    Vé ({selectedOrderDetails.tickets.length} vé)
                  </h3>
                  <div className="space-y-3">
                    {selectedOrderDetails.tickets.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-muted/50 rounded-lg gap-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* QR Code */}
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
                              Suất chiếu: {formatVietnamTime(ticket.showtime.start_time)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Mã vé: {ticket.id?.slice(-12) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
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
              {selectedOrderDetails.menu_items && selectedOrderDetails.menu_items.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <UtensilsCrossed className="h-4 w-4" />
                    Đồ Ăn/Uống ({selectedOrderDetails.menu_items.length} món)
                  </h3>
                  <div className="space-y-2">
                    {selectedOrderDetails.menu_items.map((menuItem) => (
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
              {selectedOrderDetails.combos && selectedOrderDetails.combos.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4" />
                    Combo ({selectedOrderDetails.combos.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrderDetails.combos.map((comboItem) => (
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
              {selectedOrderDetails.discount && (
                <div className="border rounded-lg p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Percent className="h-4 w-4 text-green-500" />
                    Mã Giảm Giá
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-600">{selectedOrderDetails.discount.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrderDetails.discount.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Có hiệu lực: {formatDate(selectedOrderDetails.discount.valid_from)} - {formatDate(selectedOrderDetails.discount.valid_to)}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-lg px-4 py-2">
                      -{selectedOrderDetails.discount.discount_percent}%
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiền vé ({selectedOrderDetails.tickets?.length || 0} vé):</span>
                    <span>{formatCurrency(
                      selectedOrderDetails.tickets?.reduce((sum, t) => sum + (t.ticket_price?.price || 0), 0) || 0
                    )}</span>
                  </div>
                  {selectedOrderDetails.menu_items && selectedOrderDetails.menu_items.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Đồ ăn/uống:</span>
                      <span>{formatCurrency(
                        selectedOrderDetails.menu_items.reduce((sum, m) => sum + (m.total_price || 0), 0)
                      )}</span>
                    </div>
                  )}
                  {selectedOrderDetails.combos && selectedOrderDetails.combos.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Combo:</span>
                      <span>{formatCurrency(
                        selectedOrderDetails.combos.reduce((sum, c) => sum + (c.combo?.total_price || 0), 0)
                      )}</span>
                    </div>
                  )}
                  {selectedOrderDetails.discount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá ({selectedOrderDetails.discount.discount_percent}%):</span>
                      <span>-{formatCurrency(
                        (selectedOrderDetails.order.total_price - selectedOrderDetails.order.service_vat) * 
                        (selectedOrderDetails.discount.discount_percent / (100 - selectedOrderDetails.discount.discount_percent))
                      )}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Phí dịch vụ (10% VAT):</span>
                    <span>+{formatCurrency(selectedOrderDetails.order.service_vat)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tổng thanh toán:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedOrderDetails.order.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      {selectedOrderDetails && (
        <InvoiceDialog
          open={invoiceDialogOpen}
          onOpenChange={setInvoiceDialogOpen}
          invoiceData={{
            order: {
              id: selectedOrderDetails.order.id,
              total_price: selectedOrderDetails.order.total_price,
              service_vat: selectedOrderDetails.order.service_vat,
              created_at: selectedOrderDetails.order.created_at,
            },
            tickets: selectedOrderDetails.tickets?.map((ticket) => ({
              ...ticket,
              qr_code: ticket.qr_code || "",
            })) || [],
          }}
          movieInfo={{
            title: selectedOrderDetails.movie.title,
            thumbnail: selectedOrderDetails.movie.thumbnail,
            duration: selectedOrderDetails.movie.duration,
          }}
          showTimeInfo={{
            start_time: selectedOrderDetails.tickets?.[0]?.showtime?.start_time || "",
            room_name: selectedOrderDetails.tickets?.[0]?.showtime?.room?.name || "",
            room_format: selectedOrderDetails.tickets?.[0]?.showtime?.room?.format?.name || "",
            day_type: selectedOrderDetails.tickets?.[0]?.showtime?.day_type || "WEEKDAY",
          }}
          seatDetails={selectedOrderDetails.tickets?.map((ticket) => ({
            seat_number: ticket.showtime_seat?.seat?.seat_number || "",
            seat_type: ticket.showtime_seat?.seat?.seat_type?.name || "Standard",
            price: ticket.ticket_price?.price || 0,
          })) || []}
          comboDetails={selectedOrderDetails.combos?.map((comboItem) => ({
            name: comboItem.combo.name,
            price: comboItem.combo.total_price,
            items: comboItem.combo.items?.map((item) => ({
              name: item.menu_item.name,
              quantity: item.quantity,
            })) || [],
          })) || []}
          menuItemDetails={selectedOrderDetails.menu_items?.map((menuItem) => ({
            name: menuItem.item.name,
            quantity: menuItem.quantity,
            unit_price: menuItem.unit_price,
            total_price: menuItem.total_price,
          })) || []}
          totals={{
            subtotal: (() => {
              const ticketTotal = selectedOrderDetails.tickets?.reduce((sum, t) => sum + (t.ticket_price?.price || 0), 0) || 0;
              const menuTotal = selectedOrderDetails.menu_items?.reduce((sum, m) => sum + (m.total_price || 0), 0) || 0;
              const comboTotal = selectedOrderDetails.combos?.reduce((sum, c) => sum + (c.combo?.total_price || 0), 0) || 0;
              return ticketTotal + menuTotal + comboTotal;
            })(),
            discountPercent: selectedOrderDetails.discount?.discount_percent || 0,
            discountAmount: selectedOrderDetails.discount ? 
              (selectedOrderDetails.order.total_price - selectedOrderDetails.order.service_vat) * 
              (selectedOrderDetails.discount.discount_percent / (100 - selectedOrderDetails.discount.discount_percent)) : 0,
            serviceVat: selectedOrderDetails.order.service_vat,
            total: selectedOrderDetails.order.total_price,
          }}
          eventName={selectedOrderDetails.event?.name}
        />
      )}
    </div>
  );
};

const TableSkeleton = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Mã Đơn Hàng</TableHead>
            <TableHead className="w-[60px]">Poster</TableHead>
            <TableHead>Phim</TableHead>
            <TableHead>Khách Hàng</TableHead>
            <TableHead>Phương Thức</TableHead>
            <TableHead className="text-right">Tổng Tiền</TableHead>
            <TableHead className="text-center">Trạng Thái</TableHead>
            <TableHead>Ngày Tạo</TableHead>
            <TableHead className="text-center">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-14 w-10 rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24 mx-auto rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderList;
