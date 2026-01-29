import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Film,
  Clock,
  MapPin,
  Ticket,
  Eye,
  Calendar,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

import { showTimeService } from "@/services/showTime.service";

import type { ShowTimeType, ShowTimeDetailType, SeatDetail } from "@/types/showTime.type";

const SellPage = () => {
  // Data states
  const [showTimes, setShowTimes] = useState<ShowTimeType[]>([]);
  const [showTimeDetail, setShowTimeDetail] = useState<ShowTimeDetailType | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatDetail[]>([]);

  // Loading states
  const [loadingShowTimes, setLoadingShowTimes] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "detail" | "booking">("list");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const loadShowTimes = async () => {
    setLoadingShowTimes(true);
    try {
      // Lấy ngày hiện tại dạng YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      const response = await showTimeService.findAndPaginate({
        page: 1,
        limit: 1000,
        sortBy: "start_time:ASC",
        filter: {
          is_active: true,
          start_time: {
            $gte: `${today}T00:00:00Z`,
          },
          end_time: {
            $lte: `${today}T23:59:59Z`,
          },
        },
      });

      if (response.success) {
        setShowTimes(response.data as ShowTimeType[]);
      } else {
        toast.error("Không thể tải danh sách suất chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải suất chiếu");
      console.error(error);
    } finally {
      setLoadingShowTimes(false);
    }
  };

  const loadShowTimeDetails = async (id: string) => {
    setLoadingDetail(true);
    try {
      const response = await showTimeService.getShowTimeDetails(id);
      if (response.success) {
        setShowTimeDetail(response.data as ShowTimeDetailType);
        setViewMode("detail");
      } else {
        toast.error("Không thể tải chi tiết suất chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải chi tiết suất chiếu");
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadShowTimes();
  }, []);

  // Filter showTimes by search query
  const filteredShowTimes = useMemo(() => {
    if (!searchQuery.trim()) return showTimes;
    const query = searchQuery.toLowerCase();
    return showTimes.filter(
      (st) =>
        st.movies?.title?.toLowerCase().includes(query) ||
        st.rooms?.name?.toLowerCase().includes(query)
    );
  }, [showTimes, searchQuery]);

  // Format helpers
  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      let timePart = "";
      if (dateString.includes("T")) {
        timePart = dateString.split("T")[1]?.split("+")[0] || "";
      } else if (dateString.includes(" ")) {
        timePart = dateString.split(" ")[1]?.split("+")[0] || "";
      }
      if (timePart) {
        const [hour, minute] = timePart.split(":");
        return `${hour}:${minute}`;
      }
    } catch (error) {
      console.error("Error parsing time:", error);
    }
    return "N/A";
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Seat helpers
  const getSeatColor = (seat: SeatDetail, isSelected: boolean) => {
    if (!seat.is_active) return "bg-gray-300 text-gray-500 cursor-not-allowed";
    if (isSelected) return "bg-primary text-primary-foreground ring-2 ring-primary-foreground";
    
    const status = seat.show_time_seat?.status_seat;
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer border-green-300";
      case "HOLDING":
        return "bg-yellow-100 text-yellow-800 cursor-not-allowed border-yellow-300";
      case "BOOKED":
        return "bg-red-100 text-red-800 cursor-not-allowed border-red-300";
      case "FIXING":
        return "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300";
      default:
        // Seat without showTimeSeat - can be booked
        return "bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer border-green-300";
    }
  };

  const canSelectSeat = (seat: SeatDetail) => {
    if (!seat.is_active) return false;
    const status = seat.show_time_seat?.status_seat;
    return !status || status === "AVAILABLE";
  };

  const handleSeatClick = (seat: SeatDetail) => {
    if (!canSelectSeat(seat)) return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const isSeatSelected = (seat: SeatDetail) => {
    return selectedSeats.some((s) => s.id === seat.id);
  };

  // Group seats by row
  const groupedSeats = useMemo(() => {
    if (!showTimeDetail?.room?.seats) return {};
    const groups: Record<string, SeatDetail[]> = {};
    
    showTimeDetail.room.seats.forEach((seat) => {
      const row = seat.seat_number.charAt(0);
      if (!groups[row]) groups[row] = [];
      groups[row].push(seat);
    });

    // Sort seats within each row
    Object.keys(groups).forEach((row) => {
      groups[row].sort((a, b) => {
        const numA = parseInt(a.seat_number.slice(1)) || 0;
        const numB = parseInt(b.seat_number.slice(1)) || 0;
        return numA - numB;
      });
    });

    return groups;
  }, [showTimeDetail]);

  const sortedRows = useMemo(() => {
    return Object.keys(groupedSeats).sort();
  }, [groupedSeats]);

  const handleBackToList = () => {
    setViewMode("list");
    setShowTimeDetail(null);
    setSelectedSeats([]);
  };

  const handleOpenBooking = () => {
    setSelectedSeats([]);
    setViewMode("booking");
  };

  const handleConfirmBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế");
      return;
    }
    setBookingDialogOpen(true);
  };

  // Render ShowTime List
  const renderShowTimeList = () => (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên phim hoặc phòng chiếu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ShowTime Grid */}
      {loadingShowTimes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShowTimes.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">Không có suất chiếu nào trong hôm nay</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShowTimes.map((showTime) => (
            <Card
              key={showTime.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {/* Movie Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={showTime.movies?.thumbnail || showTime.movies?.image || "/placeholder.png"}
                  alt={showTime.movies?.title || "Movie"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white font-bold text-lg line-clamp-2">
                    {showTime.movies?.title || "N/A"}
                  </h3>
                </div>
                {/* View Icon */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => loadShowTimeDetails(showTime.id as string)}
                  disabled={loadingDetail}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Card Content */}
              <CardContent className="p-4 space-y-3">
                {/* Time Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatTime(showTime.start_time)} - {formatTime(showTime.end_time || "")}
                  </span>
                </div>

                {/* Room Info */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{showTime.rooms?.name || "N/A"}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(showTime.movies?.duration)}</span>
                </div>

                {/* Day Type Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={
                      showTime.day_type === "WEEKEND"
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }
                  >
                    {showTime.day_type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadShowTimeDetails(showTime.id as string)}
                    disabled={loadingDetail}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render ShowTime Detail
  const renderShowTimeDetail = () => {
    if (!showTimeDetail) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBackToList}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Movie Info */}
          <Card className="lg:col-span-1">
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={showTimeDetail.movie?.image || showTimeDetail.movie?.thumbnail || "/placeholder.png"}
                alt={showTimeDetail.movie?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl font-bold">{showTimeDetail.movie?.title}</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{showTimeDetail.movie?.movie_type?.type || "N/A"}</Badge>
                  <Badge variant="outline">⭐ {showTimeDetail.movie?.rating || 0}</Badge>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-4 w-4" />
                  <span>{formatDuration(showTimeDetail.movie?.duration)}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{showTimeDetail.movie?.release_date}</span>
                </div>

                <p className="text-muted-foreground line-clamp-3">
                  {showTimeDetail.movie?.description}
                </p>

                <div className="pt-2 border-t">
                  <p><strong>Đạo diễn:</strong> {showTimeDetail.movie?.director}</p>
                  <p><strong>Quốc gia:</strong> {showTimeDetail.movie?.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ShowTime & Room Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Thông tin suất chiếu
              </CardTitle>
              <CardDescription>
                Chi tiết về suất chiếu và phòng chiếu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ShowTime Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Giờ bắt đầu</p>
                  <p className="font-bold text-lg">{formatTime(showTimeDetail.start_time)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Giờ kết thúc</p>
                  <p className="font-bold text-lg">{formatTime(showTimeDetail.end_time)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Loại ngày</p>
                  <Badge
                    className={
                      showTimeDetail.day_type === "WEEKEND"
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }
                  >
                    {showTimeDetail.day_type}
                  </Badge>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                  <Badge variant={showTimeDetail.is_active ? "default" : "destructive"}>
                    {showTimeDetail.is_active ? "Hoạt động" : "Ngừng"}
                  </Badge>
                </div>
              </div>

              {/* Room Info */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Thông tin phòng chiếu
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tên phòng</p>
                    <p className="font-medium">{showTimeDetail.room?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vị trí</p>
                    <p className="font-medium">{showTimeDetail.room?.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Định dạng</p>
                    <Badge variant="secondary">{showTimeDetail.room?.format?.name}</Badge>
                  </div>
                </div>
              </div>

              {/* Seat Summary */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Tổng quan ghế ngồi</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 border border-green-300 rounded" />
                    <span className="text-sm">Còn trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded" />
                    <span className="text-sm">Đang giữ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 border border-red-300 rounded" />
                    <span className="text-sm">Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded" />
                    <span className="text-sm">Bảo trì</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tổng số ghế: {showTimeDetail.room?.seats?.length || 0}
                </p>
              </div>

              {/* Book Button */}
              <Button className="w-full" size="lg" onClick={handleOpenBooking}>
                <Ticket className="h-5 w-5 mr-2" />
                Đặt vé ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Render Booking View
  const renderBookingView = () => {
    if (!showTimeDetail) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setViewMode("detail")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại chi tiết
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seat Map */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Chọn ghế ngồi
              </CardTitle>
              <CardDescription>
                {showTimeDetail.movie?.title} - {showTimeDetail.room?.name} - {formatTime(showTimeDetail.start_time)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Screen */}
              <div className="mb-8 text-center">
                <div className="w-3/4 mx-auto py-2 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-full text-center text-sm text-gray-600 font-medium">
                  MÀN HÌNH
                </div>
              </div>

              {/* Seat Grid */}
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2 p-4">
                  {sortedRows.map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-8 text-center font-bold text-muted-foreground">
                        {row}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {groupedSeats[row].map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!canSelectSeat(seat)}
                            className={`
                              w-10 h-10 rounded-md border text-xs font-medium
                              transition-all duration-200
                              ${getSeatColor(seat, isSeatSelected(seat))}
                              ${seat.seat_type?.name === "VIP" ? "ring-1 ring-amber-400" : ""}
                            `}
                            title={`${seat.seat_number} - ${seat.seat_type?.name || "STANDARD"}`}
                          >
                            {seat.seat_number.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 border border-green-300 rounded-md" />
                    <span className="text-sm">Còn trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-md" />
                    <span className="text-sm">Đang chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 border border-yellow-300 rounded-md" />
                    <span className="text-sm">Đang giữ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 border border-red-300 rounded-md" />
                    <span className="text-sm">Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 border border-green-300 ring-1 ring-amber-400 rounded-md" />
                    <span className="text-sm">VIP</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Thông tin đặt vé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Movie Info */}
              <div className="space-y-2">
                <img
                  src={showTimeDetail.movie?.thumbnail || "/placeholder.png"}
                  alt={showTimeDetail.movie?.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <h3 className="font-semibold line-clamp-2">{showTimeDetail.movie?.title}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {showTimeDetail.room?.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatTime(showTimeDetail.start_time)}
                  </p>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Ghế đã chọn ({selectedSeats.length})</h4>
                {selectedSeats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa chọn ghế nào</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((seat) => (
                      <Badge key={seat.id} variant="secondary">
                        {seat.seat_number}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length === 0}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Xác nhận ({selectedSeats.length} ghế)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Booking Confirmation Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận đặt vé</DialogTitle>
              <DialogDescription>
                Bạn đang đặt {selectedSeats.length} ghế cho phim {showTimeDetail.movie?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Phim:</strong> {showTimeDetail.movie?.title}</p>
                <p><strong>Phòng:</strong> {showTimeDetail.room?.name}</p>
                <p><strong>Giờ chiếu:</strong> {formatTime(showTimeDetail.start_time)}</p>
                <p><strong>Ghế:</strong> {selectedSeats.map(s => s.seat_number).join(", ")}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => {
                toast.success("Đặt vé thành công! (Demo)");
                setBookingDialogOpen(false);
                setSelectedSeats([]);
                setViewMode("list");
                setShowTimeDetail(null);
              }}>
                Xác nhận đặt vé
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            Bán Vé
          </CardTitle>
          <CardDescription>
            Chọn suất chiếu và đặt vé cho khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === "list" && renderShowTimeList()}
          {viewMode === "detail" && renderShowTimeDetail()}
          {viewMode === "booking" && renderBookingView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellPage;
