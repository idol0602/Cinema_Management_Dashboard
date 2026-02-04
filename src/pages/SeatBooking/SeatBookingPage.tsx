import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  MapPin,
  Ticket,
  ArrowLeft,
  Timer,
  XCircle,
  Lock,
  CheckCircle,
  Film,
  UtensilsCrossed,
  Gift,
  Calendar,
  Plus,
  Minus,
  Eye,
  CreditCard,
} from "lucide-react";

import { showTimeService } from "@/services/showTime.service";
import { comboService } from "@/services/combo.service";
import { menuItemService } from "@/services/menuItem.service";
import { eventService } from "@/services/event.service";
import { showTimeSeatService } from "@/services/showTimeSeat.service";
import type { ShowTimeDetailType, SeatDetail } from "@/types/showTime.type";
import type { MenuItemType } from "@/types/menuItem.type";
import type { EventType } from "@/types/event.type";
import type { ComboType } from "@/types/combo.type";
import { ComboDetailDialog } from "@/components/combos/ComboDetailDialog";
import { MenuItemDetailDialog } from "@/components/menuItems/MenuItemDetailDialog";
import EventDetailDialog from "@/components/events/EventDetailDialog";

interface TimeRemainData {
  userId: string;
  heldAt: string;
  expiresAt: string;
}

// Seat type color configuration
const seatTypeColors: Record<
  string,
  { bg: string; border: string; name: string; legendBg: string }
> = {
  STANDARD: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    name: "Standard",
    legendBg: "bg-blue-200 border-blue-400",
  },
  VIP: {
    bg: "bg-amber-50",
    border: "border-amber-400",
    name: "VIP",
    legendBg: "bg-amber-200 border-amber-400",
  },
  COUPLE: {
    bg: "bg-pink-50",
    border: "border-pink-400",
    name: "Couple",
    legendBg: "bg-pink-200 border-pink-400",
  },
  SWEETBOX: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    name: "Sweet Box",
    legendBg: "bg-purple-200 border-purple-400",
  },
  DELUXE: {
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    name: "Deluxe",
    legendBg: "bg-emerald-200 border-emerald-400",
  },
  PREMIUM: {
    bg: "bg-cyan-50",
    border: "border-cyan-400",
    name: "Premium",
    legendBg: "bg-cyan-200 border-cyan-400",
  },
  IMAX: {
    bg: "bg-indigo-50",
    border: "border-indigo-400",
    name: "IMAX",
    legendBg: "bg-indigo-200 border-indigo-400",
  },
  DBOX: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    name: "D-BOX",
    legendBg: "bg-orange-200 border-orange-400",
  },
};

const SeatBookingPage = () => {
  const { showTimeId } = useParams<{ showTimeId: string }>();
  const navigate = useNavigate();

  // ShowTime data
  const [showTimeDetail, setShowTimeDetail] =
    useState<ShowTimeDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  // Combos
  const [combos, setCombos] = useState<ComboType[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<ComboType[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [comboSearch, setComboSearch] = useState("");

  // Menu Items
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState<
    { item: MenuItemType; quantity: number }[]
  >([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [menuItemSearch, setMenuItemSearch] = useState("");

  // Events
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventSearch, setEventSearch] = useState("");

  // Seat Hold
  const [selectedSeats, setSelectedSeats] = useState<SeatDetail[]>([]);
  const [isHolding, setIsHolding] = useState(false);
  const [heldSeatIds, setHeldSeatIds] = useState<string[]>([]);
  const [holdCountdown, setHoldCountdown] = useState(0);
  const [holdLoading, setHoldLoading] = useState(false);
  const [timeRemain, setTimeRemain] = useState<TimeRemainData | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const HOLD_TTL_SECONDS = 600;

  // Dialog states
  const [selectedComboDetail, setSelectedComboDetail] = useState<any>(null);
  const [comboDetailDialogOpen, setComboDetailDialogOpen] = useState(false);
  const [selectedMenuItemDetail, setSelectedMenuItemDetail] =
    useState<MenuItemType | null>(null);
  const [menuItemDetailDialogOpen, setMenuItemDetailDialogOpen] =
    useState(false);
  const [selectedEventDetail, setSelectedEventDetail] =
    useState<EventType | null>(null);
  const [eventDetailDialogOpen, setEventDetailDialogOpen] = useState(false);

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Load Combos
  const loadCombos = async () => {
    setLoadingCombos(true);
    try {
      const response = await comboService.findAndPaginate({
        page: 1,
        limit: 100,
        sortBy: "name:ASC",
        filter: { is_active: true },
      });
      if (response.success) setCombos(response.data as ComboType[]);
    } catch (error) {
      console.error("Error loading combos:", error);
    } finally {
      setLoadingCombos(false);
    }
  };

  // Load Menu Items
  const loadMenuItems = async () => {
    setLoadingMenuItems(true);
    try {
      const response = await menuItemService.findAndPaginate({
        page: 1,
        limit: 100,
        sortBy: "name:ASC",
        filter: { is_active: true },
      });
      if (response.success) setMenuItems(response.data as MenuItemType[]);
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  // Load Events
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await eventService.findAndPaginate({
        page: 1,
        limit: 100,
        sortBy: "name:ASC",
        filter: { is_in_combo: false, is_active: true },
      });
      if (response.success) setEvents(response.data as EventType[]);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Load combo details
  const loadComboDetails = async (comboId: string): Promise<any> => {
    try {
      const response = await comboService.getDetails(comboId);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error("Error loading combo details:", error);
    }
    return null;
  };

  // Load user's held seats
  const loadUserHeldSeats = async () => {
    try {
      const response = await showTimeSeatService.getAllHeldSeatsByUserId();
      if (response.success && response.data && response.data.length > 0) {
        // Find held seats that belong to current showTime
        const currentShowTimeHeldSeats = response.data.filter((hold: any) => {
          // Check if this seat belongs to current showtime by checking seats in showTimeDetail
          return showTimeDetail?.room?.seats?.some(
            (seat) => seat.show_time_seat?.id === hold.showTimeSeatId,
          );
        });

        if (currentShowTimeHeldSeats.length > 0) {
          // Get seat details from showTimeDetail
          const seatsToRestore = currentShowTimeHeldSeats
            .map((hold: any) =>
              showTimeDetail?.room?.seats?.find(
                (seat) => seat.show_time_seat?.id === hold.showTimeSeatId,
              ),
            )
            .filter(Boolean) as SeatDetail[];

          if (seatsToRestore.length > 0) {
            const seatIds = seatsToRestore
              .map((s) => s.show_time_seat?.id)
              .filter(Boolean) as string[];

            setHeldSeatIds(seatIds);
            setSelectedSeats(seatsToRestore);
            setIsHolding(true);

            // Restore countdown from first held seat
            const firstHold = currentShowTimeHeldSeats[0];
            const expiresAt = new Date(firstHold.expiresAt);
            const now = new Date();
            const remainingSeconds = Math.max(
              0,
              Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
            );

            if (remainingSeconds > 0) {
              startCountdown(remainingSeconds);
              setTimeRemain(firstHold);
            } else {
              // Hold has expired, cancel it
              setIsHolding(false);
              setHeldSeatIds([]);
              setSelectedSeats([]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading user held seats:", error);
    }
  };

  useEffect(() => {
    const loadShowTimeDetail = async () => {
      if (!showTimeId) return;
      setLoading(true);
      try {
        const response = await showTimeService.getShowTimeDetails(showTimeId);
        if (response.success && response.data) {
          const data = response.data as ShowTimeDetailType;
          setShowTimeDetail(data);
          // Load additional data
          loadCombos();
          loadMenuItems();
          loadEvents();

          // Check for seats with HOLDING status and restore countdown
          const holdingSeatsResponse =
            await showTimeSeatService.getAllHeldSeatsByUserId();
          if (
            holdingSeatsResponse.success &&
            Array.isArray(holdingSeatsResponse.data) &&
            holdingSeatsResponse.data.length > 0
          ) {
            const firstHoldingSeatId =
              holdingSeatsResponse.data[0].show_time_seat?.id;
            if (firstHoldingSeatId) {
              // Restore hold state
              const holdingSeatIds = holdingSeatsResponse.data
                .map((s) => s.show_time_seat?.id)
                .filter(Boolean) as string[];
              setHeldSeatIds(holdingSeatIds);
              setSelectedSeats(holdingSeatsResponse.data);

              // Restore countdown from server
              await loadHoldInfoAndRestoreCountdown(firstHoldingSeatId);
            }
          }
        } else {
          toast.error("Không thể tải thông tin suất chiếu");
          navigate(-1);
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadShowTimeDetail();
  }, [showTimeId, navigate]);

  // Load user's held seats on component mount (after showTimeDetail is set)
  useEffect(() => {
    if (showTimeDetail) {
      loadUserHeldSeats();
    }
  }, [showTimeDetail?.id]);

  // Load combo details for dialog
  const loadComboDetailsForDialog = async (id: string) => {
    const details = await loadComboDetails(id);
    if (details) {
      setSelectedComboDetail(details);
      setComboDetailDialogOpen(true);
    } else {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Filtered data
  const filteredCombos = useMemo(() => {
    return combos.filter((c) =>
      c.name.toLowerCase().includes(comboSearch.toLowerCase()),
    );
  }, [combos, comboSearch]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((m) =>
      m.name.toLowerCase().includes(menuItemSearch.toLowerCase()),
    );
  }, [menuItems, menuItemSearch]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) =>
      e.name.toLowerCase().includes(eventSearch.toLowerCase()),
    );
  }, [events, eventSearch]);

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Start countdown timer
  const startCountdown = useCallback((seconds: number) => {
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    setHoldCountdown(seconds);
    countdownIntervalRef.current = setInterval(() => {
      setHoldCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current)
            clearInterval(countdownIntervalRef.current);
          setIsHolding(false);
          setHeldSeatIds([]);
          toast.warning("Thời gian giữ ghế đã hết.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Hold seats
  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế");
      return;
    }
    setHoldLoading(true);
    try {
      const seatIds = selectedSeats
        .map((s) => s.show_time_seat?.id)
        .filter(Boolean) as string[];
      const response = await showTimeSeatService.bulkHoldSeats(
        seatIds,
        HOLD_TTL_SECONDS,
      );
      if (response.success) {
        setIsHolding(true);
        setHeldSeatIds(seatIds);
        startCountdown(HOLD_TTL_SECONDS);
        toast.success(`Đã giữ ${selectedSeats.length} ghế trong 10 phút`);
      } else {
        toast.error(response.error || "Không thể giữ ghế");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
      console.error(error);
    } finally {
      setHoldLoading(false);
    }
  };

  // Cancel hold
  const handleCancelHold = async () => {
    if (heldSeatIds.length === 0) return;
    setHoldLoading(true);
    try {
      const response =
        await showTimeSeatService.bulkCancelHoldSeats(heldSeatIds);
      if (response.success) {
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);
        setIsHolding(false);
        setHeldSeatIds([]);
        setHoldCountdown(0);
        setSelectedSeats([]);
        toast.success("Đã hủy giữ ghế");
      } else {
        toast.error(response.error || "Không thể hủy");
      }
    } catch (error) {
      toast.error("Có lỗi");
      console.error(error);
    } finally {
      setHoldLoading(false);
    }
  };

  // Load hold info and restore countdown
  const loadHoldInfoAndRestoreCountdown = async (seatId: string) => {
    try {
      const response = await showTimeSeatService.getHoldInfo(seatId);
      if (response.success && response.data) {
        const data = response.data as TimeRemainData;
        setTimeRemain(data);
        const expiresAt = new Date(data.expiresAt);
        const now = new Date();
        const remainingSeconds = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
        );
        if (remainingSeconds > 0) {
          setIsHolding(true);
          startCountdown(remainingSeconds);
          return remainingSeconds;
        }
      }
    } catch (error) {
      console.error("Error loading hold info:", error);
    }
    return 0;
  };

  // Handle combo toggle with movie validation
  const handleComboToggle = async (combo: ComboType) => {
    // Check if already selected - if so, just remove it
    if (selectedCombos.some((c) => c.id === combo.id)) {
      setSelectedCombos((prev) => prev.filter((c) => c.id !== combo.id));
      return;
    }

    // If is_event_combo = true, validate movie.id
    if (combo.is_event_combo) {
      const details = await loadComboDetails(combo.id!);
      if (details?.combo_movies?.length > 0) {
        const comboMovieIds = details.combo_movies.map(
          (cm: any) => cm.movie?.id,
        );
        if (!comboMovieIds.includes(showTimeDetail?.movie?.id)) {
          toast.error(
            `Combo "${combo.name}" không áp dụng cho phim "${showTimeDetail?.movie?.title || "hiện tại"}"`,
          );
          return;
        }
      }
    }
    // If is_event_combo = false, always allow
    setSelectedCombos((prev) => [...prev, combo]);
  };

  // Handle menu item quantity change
  const handleMenuItemQuantityChange = (item: MenuItemType, delta: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((m) => m.item.id === item.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((m) => m.item.id !== item.id);
        return prev.map((m) =>
          m.item.id === item.id ? { ...m, quantity: newQty } : m,
        );
      }
      if (delta > 0) return [...prev, { item, quantity: 1 }];
      return prev;
    });
  };

  // Handle event select
  const handleEventSelect = (event: EventType) => {
    setSelectedEvent((prev) => (prev?.id === event.id ? null : event));
  };

  // Format helpers
  const formatTime = (time: string) => (time ? time.substring(0, 5) : "");
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Seat grouping
  const groupedSeats = useMemo(() => {
    if (!showTimeDetail?.room?.seats) return {};
    const groups: Record<string, SeatDetail[]> = {};
    showTimeDetail.room.seats.forEach((seat) => {
      const row = seat.seat_number.charAt(0);
      if (!groups[row]) groups[row] = [];
      groups[row].push(seat);
    });
    Object.keys(groups).forEach((row) => {
      groups[row].sort(
        (a, b) =>
          (parseInt(a.seat_number.slice(1)) || 0) -
          (parseInt(b.seat_number.slice(1)) || 0),
      );
    });
    return groups;
  }, [showTimeDetail]);

  const sortedRows = useMemo(
    () => Object.keys(groupedSeats).sort(),
    [groupedSeats],
  );

  const uniqueSeatTypes = useMemo(() => {
    if (!showTimeDetail?.room?.seats) return [];
    const types = new Set<string>();
    showTimeDetail.room.seats.forEach((s) =>
      types.add(s.seat_type?.type || s.seat_type?.name || "STANDARD"),
    );
    return Array.from(types).map((t) => ({
      type: t,
      ...(seatTypeColors[t] || seatTypeColors.STANDARD),
    }));
  }, [showTimeDetail]);

  const canSelectSeat = (seat: SeatDetail) => {
    if (isHolding) return false;
    if (!seat.is_active) return false;
    const status = seat.show_time_seat?.status_seat;
    return !status || status === "AVAILABLE";
  };

  const isSeatSelected = (seat: SeatDetail) =>
    selectedSeats.some((s) => s.id === seat.id);

  const handleSeatClick = (seat: SeatDetail) => {
    if (!canSelectSeat(seat)) return;
    setSelectedSeats((prev) =>
      prev.find((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    );
  };

  const getSeatColor = (seat: SeatDetail, isSelected: boolean) => {
    const status = seat.show_time_seat?.status_seat;
    const seatType = seat.seat_type?.type || seat.seat_type?.name || "STANDARD";
    const typeColors = seatTypeColors[seatType] || seatTypeColors.STANDARD;

    // Maintenance/inactive seat
    if (!seat.is_active || status === "FIXING") {
      return "bg-gray-200 border-2 border-gray-400 opacity-60 cursor-not-allowed relative";
    }
    // Selected seat
    if (isSelected) {
      return "bg-primary border-2 border-primary text-primary-foreground shadow-lg scale-105 cursor-pointer ring-2 ring-offset-1 ring-primary";
    }
    // Status-based colors
    switch (status) {
      case "BOOKED":
        return "bg-gray-500 border-2 border-gray-700 text-white cursor-not-allowed";
      case "HOLDING":
        return `${typeColors.bg} border-2 border-dashed ${typeColors.border} cursor-not-allowed opacity-80`;
      default: // AVAILABLE
        return `${typeColors.bg} ${typeColors.border} border-2 hover:scale-105 cursor-pointer transition-transform`;
    }
  };

  // Calculate total
  const calculateTotal = () => {
    const seatTotal = selectedSeats.reduce(
      (sum, s) => sum + (s.show_time_seat?.price || s.seat_type?.price || 0),
      0,
    );
    const comboTotal = selectedCombos.reduce(
      (sum, c) => sum + (c.total_price || 0),
      0,
    );
    const menuTotal = selectedMenuItems.reduce(
      (sum, m) => sum + m.item.price * m.quantity,
      0,
    );
    return seatTotal + comboTotal + menuTotal;
  };

  const handleBack = async () => {
    if (isHolding && heldSeatIds.length > 0) await handleCancelHold();
    navigate(-1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px]" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-[500px]" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!showTimeDetail) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">
          Không tìm thấy thông tin suất chiếu
        </p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={holdLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        {isHolding && holdCountdown > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-lg">
            <Timer className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs text-amber-600 font-medium">
                Thời gian giữ ghế
              </p>
              <p
                className={`text-xl font-bold ${holdCountdown <= 60 ? "text-red-500 animate-pulse" : "text-amber-600"}`}
              >
                {formatCountdown(holdCountdown)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Movie Info */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <div className="h-40 overflow-hidden rounded-t-lg">
              <img
                src={
                  showTimeDetail.movie?.image ||
                  showTimeDetail.movie?.thumbnail ||
                  "/placeholder.png"
                }
                alt={showTimeDetail.movie?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3 space-y-2">
              <h2 className="font-bold text-sm line-clamp-2">
                {showTimeDetail.movie?.title}
              </h2>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  {showTimeDetail.movie?.duration} phút
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {showTimeDetail.room?.name}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(showTimeDetail.start_time)}
                </div>
              </div>
              <Badge
                className={`text-xs ${showTimeDetail.day_type === "WEEKEND" ? "bg-purple-500" : "bg-blue-500"}`}
              >
                {showTimeDetail.day_type}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Center: Seat Map + Extras */}
        <div className="lg:col-span-7 space-y-4">
          {/* Seat Map */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Sơ đồ ghế
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="mb-6 text-center">
                <div className="w-2/3 mx-auto py-2 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-full text-xs font-semibold">
                  MÀN HÌNH
                </div>
              </div>
              <ScrollArea className="max-h-[280px]">
                <div className="flex flex-col items-center space-y-1">
                  {sortedRows.map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-1 justify-center"
                    >
                      <span className="w-5 text-center font-bold text-muted-foreground text-xs">
                        {row}
                      </span>
                      <div className="flex gap-0.5">
                        {groupedSeats[row].map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!canSelectSeat(seat)}
                            className={`w-7 h-7 rounded border text-blue-800 font-medium transition-all ${getSeatColor(seat, isSeatSelected(seat))}`}
                            title={`${seat.seat_number} - ${seat.seat_type?.name || "STANDARD"}`}
                          >
                            {seat.seat_number.slice(1)}
                          </button>
                        ))}
                      </div>
                      <span className="w-5 text-center font-bold text-muted-foreground text-xs">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {/* Legend */}
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Seat Types */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Loại ghế:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueSeatTypes.map((st) => (
                      <div key={st.type} className="flex items-center gap-1.5">
                        <div
                          className={`w-5 h-5 ${st.legendBg} border-2 rounded`}
                        />
                        <span className="text-xs">{st.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Seat Statuses */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    Trạng thái:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-100 border-2 border-gray-400 rounded" />
                      <span className="text-xs">Còn trống</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-primary rounded shadow-md ring-1 ring-primary ring-offset-1" />
                      <span className="text-xs">Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-100 border-2 border-dashed border-gray-500 rounded" />
                      <span className="text-xs">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-500 border-2 border-gray-700 rounded" />
                      <span className="text-xs">Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-gray-200 border-2 border-gray-400 rounded opacity-60 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-500 rotate-45" />
                        </div>
                      </div>
                      <span className="text-xs">Bảo trì</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combos, Menu Items, Events - LARGER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Combos */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Combo
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <Input
                  placeholder="Tìm combo..."
                  value={comboSearch}
                  onChange={(e) => setComboSearch(e.target.value)}
                  className="h-8"
                />
                <ScrollArea className="h-48">
                  {loadingCombos ? (
                    <Skeleton className="h-24" />
                  ) : filteredCombos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Không có combo
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredCombos.map((combo) => (
                        <div
                          key={combo.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer ${selectedCombos.some((c) => c.id === combo.id) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                          onClick={() => handleComboToggle(combo)}
                        >
                          <Checkbox
                            checked={selectedCombos.some(
                              (c) => c.id === combo.id,
                            )}
                            className="h-4 w-4"
                          />
                          {combo.image && (
                            <img
                              src={combo.image}
                              alt={combo.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {combo.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(combo.total_price)}
                            </p>
                            {combo.is_event_combo && (
                              <Badge
                                variant="outline"
                                className="text-xs mt-0.5"
                              >
                                Event
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadComboDetailsForDialog(combo.id!);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Món lẻ
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <Input
                  placeholder="Tìm món..."
                  value={menuItemSearch}
                  onChange={(e) => setMenuItemSearch(e.target.value)}
                  className="h-8"
                />
                <ScrollArea className="h-48">
                  {loadingMenuItems ? (
                    <Skeleton className="h-24" />
                  ) : filteredMenuItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Không có món
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredMenuItems.map((item) => {
                        const selected = selectedMenuItems.find(
                          (m) => m.item.id === item.id,
                        );
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded ${selected ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setSelectedMenuItemDetail(item);
                                setMenuItemDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleMenuItemQuantityChange(item, -1)
                                }
                                disabled={!selected}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">
                                {selected?.quantity || 0}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleMenuItemQuantityChange(item, 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <Input
                  placeholder="Tìm sự kiện..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="h-8"
                />
                <ScrollArea className="h-48">
                  {loadingEvents ? (
                    <Skeleton className="h-24" />
                  ) : filteredEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Không có sự kiện
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer ${selectedEvent?.id === event.id ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                          onClick={() => handleEventSelect(event)}
                        >
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {event.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventDetail(event);
                              setEventDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {selectedEvent?.id === event.id && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="lg:col-span-3">
          <Card className="sticky top-4">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Tóm tắt đặt vé</span>
                <Badge variant="secondary">{selectedSeats.length} ghế</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Selected Seats */}
              {selectedSeats.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Ghế:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <Badge key={s.id} variant="outline" className="text-xs">
                        {s.seat_number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Combos */}
              {selectedCombos.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Combo:</p>
                  {selectedCombos.map((c) => (
                    <div key={c.id} className="flex justify-between text-xs">
                      <span className="truncate">{c.name}</span>
                      <span>{formatPrice(c.total_price)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Menu Items */}
              {selectedMenuItems.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Món lẻ:</p>
                  {selectedMenuItems.map((m) => (
                    <div
                      key={m.item.id}
                      className="flex justify-between text-xs"
                    >
                      <span className="truncate">
                        {m.item.name} x{m.quantity}
                      </span>
                      <span>{formatPrice(m.item.price * m.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Event */}
              {selectedEvent && (
                <div>
                  <p className="text-xs font-medium mb-1">Sự kiện:</p>
                  <p className="text-xs truncate">{selectedEvent.name}</p>
                </div>
              )}

              {/* Total */}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!isHolding ? (
                  <Button
                    className="w-full"
                    onClick={handleHoldSeats}
                    disabled={selectedSeats.length === 0 || holdLoading}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {holdLoading ? "Đang xử lý..." : "Giữ ghế (10 phút)"}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setConfirmDialogOpen(true)}
                      disabled={holdLoading}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thanh toán
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelHold}
                      disabled={holdLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {holdLoading ? "Đang hủy..." : "Hủy giữ ghế"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ComboDetailDialog
        combo={selectedComboDetail}
        open={comboDetailDialogOpen}
        onOpenChange={setComboDetailDialogOpen}
      />
      <MenuItemDetailDialog
        menuItem={selectedMenuItemDetail}
        open={menuItemDetailDialogOpen}
        onOpenChange={setMenuItemDetailDialogOpen}
      />
      <EventDetailDialog
        event={selectedEventDetail}
        open={eventDetailDialogOpen}
        onOpenChange={setEventDetailDialogOpen}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt vé</DialogTitle>
            <DialogDescription>
              Kiểm tra lại thông tin trước khi thanh toán
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="flex items-center gap-3">
              <img
                src={showTimeDetail.movie?.thumbnail || "/placeholder.png"}
                alt={showTimeDetail.movie?.title}
                className="w-14 h-20 object-cover rounded"
              />
              <div>
                <p className="font-semibold">{showTimeDetail.movie?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {showTimeDetail.room?.name} •{" "}
                  {formatTime(showTimeDetail.start_time)}
                </p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium">
                Ghế: {selectedSeats.map((s) => s.seat_number).join(", ")}
              </p>
              {selectedCombos.length > 0 && (
                <p className="text-sm">
                  Combo: {selectedCombos.map((c) => c.name).join(", ")}
                </p>
              )}
              {selectedMenuItems.length > 0 && (
                <p className="text-sm">
                  Món:{" "}
                  {selectedMenuItems
                    .map((m) => `${m.item.name} x${m.quantity}`)
                    .join(", ")}
                </p>
              )}
              {selectedEvent && (
                <p className="text-sm">Sự kiện: {selectedEvent.name}</p>
              )}
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-medium">Tổng tiền:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(calculateTotal())}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                toast.success("Đặt vé thành công!");
                setConfirmDialogOpen(false);
                navigate(-1);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatBookingPage;
