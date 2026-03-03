import { useState, useEffect } from "react";
import { orderService } from "@/services/order.service";
import { momoService } from "@/services/payment/momo.service";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Undo2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  User,
  Film,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import type { OrderType, OrderDetails, PaymentStatus } from "@/types/order.type";
import type { PaginationMeta } from "@/types/pagination.type";
import { orderPaginationConfig } from "@/config/paginate/order.config";
import { formatVietnamFullDateTime } from "@/utils/datetime";
import OrderDetailDialog from "@/components/dialogs/OrderDetailDialog";

const RefundList = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchColumn, setSearchColumn] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [orderColumn, setOrderColumn] = useState("");
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

  // Refund states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<OrderType | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [startTimeForRefund, setStartTimeForRefund] = useState<string>("");

  const findAndPaginate = async (
    page = 1,
    limit = orderPaginationConfig.defaultLimit,
    sortBy = orderPaginationConfig.defaultSortBy[0][0] +
      ":" +
      orderPaginationConfig.defaultSortBy[0][1],
    search: string | undefined = undefined,
    searchBy: string | undefined = undefined,
  ) => {
    setLoading(true);
    try {
      const response = await orderService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter: { payment_status: "REFUND_PENDING" },
      });

      if (response.success && response.data) {
        setOrders(response.data as OrderType[]);
        if (response.meta) {
          setMeta(response.meta);
        }
      } else {
        toast.error("Không thể tải danh sách yêu cầu hoàn tiền");
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

    findAndPaginate(
      currentPage,
      orderPaginationConfig.defaultLimit,
      sortBy,
      searchQuery || undefined,
      searchColumn || undefined,
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      handleSearch();
    }
  };

  // View order details
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

  // Refund click - fetch details to get startTime
  const handleRefundClick = async (order: OrderType) => {
    try {
      const response = await orderService.getOrderDetails(order.id as string);
      if (response.success && response.data) {
        const details = response.data as OrderDetails;
        const startTime =
          details.tickets.length > 0
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

  // Refund from detail dialog
  const handleRefundFromDetails = () => {
    if (selectedOrderDetails) {
      const order: OrderType = {
        id: selectedOrderDetails.order.id,
        user_id: selectedOrderDetails.order.user_id,
        movie_id: selectedOrderDetails.order.movie_id,
        discount_id: selectedOrderDetails.order.discount_id as string,
        service_vat: selectedOrderDetails.order.service_vat,
        payment_status: selectedOrderDetails.order.payment_status as PaymentStatus || "REFUND_PENDING",
        payment_method: selectedOrderDetails.order.payment_method,
        trans_id: selectedOrderDetails.order.trans_id as string,
        total_price: selectedOrderDetails.order.total_price,
        created_at: selectedOrderDetails.order.created_at,
        requested_at: selectedOrderDetails.order.requested_at as string,
      };
      const startTime =
        selectedOrderDetails.tickets.length > 0
          ? selectedOrderDetails.tickets[0].showtime.start_time
          : "";
      setStartTimeForRefund(startTime);
      setOrderToRefund(order);
      setDetailDialogOpen(false);
      setConfirmDialogOpen(true);
    }
  };

  // Confirm refund
  const handleConfirmRefund = async () => {
    if (!orderToRefund) return;

    setIsRefunding(true);
    try {
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
        handleSearch();
      } else {
        toast.error(response.error || "Hoàn tiền thất bại");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi hoàn tiền");
    } finally {
      setIsRefunding(false);
    }
  };

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Undo2 className="h-6 w-6" />
                Quản Lý Hoàn Tiền
              </CardTitle>
              <CardDescription>
                Danh sách đơn hàng đang chờ hoàn tiền (REFUND_PENDING)
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => { setCurrentPage(1); handleSearch(); }}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
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
                { value: "ASC", label: "tăng dần" },
                { value: "DESC", label: "giảm dần" },
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
              <Undo2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không có đơn hàng nào đang chờ hoàn tiền
              </p>
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
                      <TableHead className="text-right">Số Tiền Hoàn</TableHead>
                      <TableHead>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Ngày Gửi Yêu Cầu
                      </TableHead>
                      <TableHead className="text-center">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {(meta.currentPage - 1) * meta.itemsPerPage + index + 1}
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
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(order.total_price)}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.requested_at)}
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
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleRefundClick(order)}
                            >
                              <Undo2 className="h-4 w-4 mr-1" />
                              Hoàn tiền
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
                    meta.totalItems,
                  )}{" "}
                  của {meta.totalItems} đơn hàng
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                          Math.abs(page - currentPage) <= 1,
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
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
                      setCurrentPage((prev) => Math.min(meta.totalPages, prev + 1))
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
      <OrderDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        loading={detailLoading}
        orderDetails={selectedOrderDetails}
        titleText="Chi Tiết Đơn Hàng Hoàn Tiền"
        actionButton={
          selectedOrderDetails?.order.payment_status === "REFUND_PENDING" && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRefundFromDetails}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Hoàn tiền
            </Button>
          )
        }
      />

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
                      <span className="font-mono font-semibold">
                        {orderToRefund.id}
                      </span>
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
            <TableHead className="text-right">Số Tiền Hoàn</TableHead>
            <TableHead>Ngày Gửi Yêu Cầu</TableHead>
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
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RefundList;
