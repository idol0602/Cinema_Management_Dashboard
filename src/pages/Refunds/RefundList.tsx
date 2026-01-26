import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

// Mock data for refund pending orders
interface RefundOrder {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  movie: {
    title: string;
    image: string;
  };
  showTime: {
    date: string;
    time: string;
    room: string;
  };
  seats: string[];
  totalPrice: number;
  serviceVat: number;
  paymentMethod: string;
  transId: string;
  createdAt: string;
  requestedAt: string;
}

const mockRefundOrders: RefundOrder[] = [
  {
    id: "ORD-2024-001",
    user: {
      id: "USR-001",
      name: "Nguyễn Văn An",
      email: "nguyenvanan@gmail.com",
      phone: "0901234567",
    },
    movie: {
      title: "Avengers: Endgame",
      image: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    },
    showTime: {
      date: "2024-01-26",
      time: "19:30",
      room: "Phòng 3 - IMAX",
    },
    seats: ["A1", "A2", "A3"],
    totalPrice: 450000,
    serviceVat: 45000,
    paymentMethod: "VNPAY",
    transId: "VNP14238576",
    createdAt: "2024-01-24T10:30:00",
    requestedAt: "2024-01-25T15:20:00",
  },
  {
    id: "ORD-2024-002",
    user: {
      id: "USR-002",
      name: "Trần Thị Bình",
      email: "tranthbinh@gmail.com",
      phone: "0912345678",
    },
    movie: {
      title: "Spider-Man: No Way Home",
      image: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    },
    showTime: {
      date: "2024-01-27",
      time: "14:00",
      room: "Phòng 1 - 2D",
    },
    seats: ["C5", "C6"],
    totalPrice: 180000,
    serviceVat: 18000,
    paymentMethod: "MOMO",
    transId: "MOMO78923456",
    createdAt: "2024-01-23T08:15:00",
    requestedAt: "2024-01-24T20:45:00",
  },
  {
    id: "ORD-2024-003",
    user: {
      id: "USR-003",
      name: "Lê Minh Cường",
      email: "leminhcuong@gmail.com",
      phone: "0923456789",
    },
    movie: {
      title: "Oppenheimer",
      image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    },
    showTime: {
      date: "2024-01-28",
      time: "20:00",
      room: "Phòng 2 - 4DX",
    },
    seats: ["B3", "B4", "B5", "B6"],
    totalPrice: 640000,
    serviceVat: 64000,
    paymentMethod: "VNPAY",
    transId: "VNP98765432",
    createdAt: "2024-01-22T16:45:00",
    requestedAt: "2024-01-23T09:30:00",
  },
  {
    id: "ORD-2024-004",
    user: {
      id: "USR-004",
      name: "Phạm Thu Hà",
      email: "phamthuha@gmail.com",
      phone: "0934567890",
    },
    movie: {
      title: "Dune: Part Two",
      image: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    },
    showTime: {
      date: "2024-01-29",
      time: "17:15",
      room: "Phòng 5 - IMAX",
    },
    seats: ["D7", "D8"],
    totalPrice: 360000,
    serviceVat: 36000,
    paymentMethod: "ZALOPAY",
    transId: "ZLP45678901",
    createdAt: "2024-01-25T11:00:00",
    requestedAt: "2024-01-26T08:00:00",
  },
];

const RefundList = () => {
  const [orders] = useState<RefundOrder[]>(mockRefundOrders);
  const [selectedOrder, setSelectedOrder] = useState<RefundOrder | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<RefundOrder | null>(null);

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

  const handleViewDetail = (order: RefundOrder) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleRefundClick = (order: RefundOrder) => {
    setOrderToRefund(order);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRefund = () => {
    if (orderToRefund) {
      // TODO: Implement actual refund logic here
      toast.success(`Đã hoàn tiền thành công cho đơn hàng ${orderToRefund.id}`);
      setConfirmDialogOpen(false);
      setOrderToRefund(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Undo2 className="h-6 w-6" />
                Quản Lý Hoàn Tiền
              </CardTitle>
              <CardDescription>
                Danh sách các đơn hàng đang chờ hoàn tiền (REFUND_PENDING)
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => toast.info("Đang tải lại...")}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Đơn chờ xử lý</p>
                    <p className="text-2xl font-bold text-amber-700">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Tổng tiền hoàn</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(orders.reduce((sum, o) => sum + o.totalPrice, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">VAT hoàn lại</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(orders.reduce((sum, o) => sum + o.serviceVat, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Undo2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không có đơn hàng nào cần hoàn tiền
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Mã Đơn</TableHead>
                    <TableHead>Khách Hàng</TableHead>
                    <TableHead>Phim</TableHead>
                    <TableHead>Suất Chiếu</TableHead>
                    <TableHead className="text-right">Số Tiền</TableHead>
                    <TableHead>Ngày Yêu Cầu</TableHead>
                    <TableHead className="text-center">Trạng Thái</TableHead>
                    <TableHead className="text-center">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {order.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{order.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={order.movie.image}
                            alt={order.movie.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <span className="font-medium max-w-[150px] truncate">
                            {order.movie.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            {formatDate(order.showTime.date)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.showTime.time} - {order.showTime.room}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(order.totalPrice)}
                      </TableCell>
                      <TableCell>{formatDateTime(order.requestedAt)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          REFUND_PENDING
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(order)}
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
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Chi Tiết Đơn Hàng
            </DialogTitle>
            <DialogDescription>
              Mã đơn hàng: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" />
                  Thông Tin Khách Hàng
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedOrder.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.user.phone}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Movie & ShowTime Info */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Film className="h-4 w-4" />
                  Thông Tin Vé
                </h4>
                <div className="flex gap-4">
                  <img
                    src={selectedOrder.movie.image}
                    alt={selectedOrder.movie.title}
                    className="w-24 h-36 object-cover rounded-lg shadow"
                  />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-lg">{selectedOrder.movie.title}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedOrder.showTime.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.showTime.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.showTime.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Armchair className="h-4 w-4 text-muted-foreground" />
                      <div className="flex gap-1 flex-wrap">
                        {selectedOrder.seats.map((seat) => (
                          <Badge key={seat} variant="secondary">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4" />
                  Thông Tin Thanh Toán
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phương thức:</span>
                    <Badge variant="outline">{selectedOrder.paymentMethod}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch:</span>
                    <span className="font-mono">{selectedOrder.transId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày đặt:</span>
                    <span>{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày yêu cầu hoàn:</span>
                    <span>{formatDateTime(selectedOrder.requestedAt)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT dịch vụ:</span>
                    <span>{formatCurrency(selectedOrder.serviceVat)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng tiền hoàn:</span>
                    <span className="text-red-600">
                      {formatCurrency(selectedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
            {selectedOrder && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleRefundClick(selectedOrder);
                }}
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
                      <span className="text-muted-foreground">Khách hàng:</span>
                      <span className="font-semibold">{orderToRefund.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền hoàn:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(orderToRefund.totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phương thức:</span>
                      <Badge variant="outline">{orderToRefund.paymentMethod}</Badge>
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
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmRefund}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Xác nhận hoàn tiền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RefundList;
