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
import { Separator } from "@/components/ui/separator";
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
  Percent,
  ShoppingCart,
  Tag,
  Sparkles,
} from "lucide-react";

import { showTimeService } from "@/services/showTime.service";
import { comboService } from "@/services/combo.service";
import { menuItemService } from "@/services/menuItem.service";
import { eventService } from "@/services/event.service";
import { showTimeSeatService } from "@/services/showTimeSeat.service";
import { ticketPriceService } from "@/services/ticketPrice.service";
import { orderService } from "@/services/order.service";
import { discountService } from "@/services/discount.service";
import { useAuth } from "@/hooks/useAuth";
import type { ShowTimeDetailType, SeatDetail } from "@/types/showTime.type";
import type { MenuItemType } from "@/types/menuItem.type";
import type { EventType } from "@/types/event.type";
import type { ComboType } from "@/types/combo.type";
import type { TicketPriceType } from "@/types/ticketPrice.type";
import type { DiscountType } from "@/types/discount.type";
import type { OrderType, CreateOrderType } from "@/types/order.type";
import { ComboDetailDialog } from "@/components/combos/ComboDetailDialog";
import { MenuItemDetailDialog } from "@/components/menuItems/MenuItemDetailDialog";
import EventDetailDialog from "@/components/events/EventDetailDialog";

// Import shared seat type colors
import { getSeatTypeColor, seatStatusColors } from "@/config/seatTypeColors";

interface TimeRemainData {
  userId: string;
  heldAt: string;
  expiresAt: string;
}

interface EventWithDiscount extends EventType {
  discount?: DiscountType | null;
}

const SeatBookingPage = () => {
  const { showTimeId } = useParams<{ showTimeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ShowTime data
  const [showTimeDetail, setShowTimeDetail] =
    useState<ShowTimeDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  // Order state
  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [orderCreating, setOrderCreating] = useState(false);

  // Ticket Prices
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [ticketPrices, setTicketPrices] = useState<TicketPriceType[]>([]);

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

  // Events & Discounts
  const [events, setEvents] = useState<EventWithDiscount[]>([]);
  const [discounts, setDiscounts] = useState<DiscountType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDiscount | null>(
    null,
  );
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
    useState<EventWithDiscount | null>(null);
  const [eventDetailDialogOpen, setEventDetailDialogOpen] = useState(false);

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Create Order on page load
  const createPendingOrder = async (movieId: string) => {
    if (!user?.id || currentOrder) return;

    setOrderCreating(true);
    try {
      const orderData: CreateOrderType = {
        user_id: user.id,
        movie_id: movieId,
        payment_status: "PENDING",
        total_price: 0,
      };

      const response = await orderService.create(orderData);
      if (response.success && response.data) {
        setCurrentOrder(response.data as OrderType);
        console.log("✅ Created pending order:", response.data);
      } else {
        console.error("❌ Failed to create order:", response.error);
      }
    } catch (error) {
      console.error("❌ Error creating order:", error);
    } finally {
      setOrderCreating(false);
    }
  };

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

  // Load Discounts
  const loadDiscounts = async () => {
    try {
      const response = await discountService.getAll();
      if (response.success && response.data) {
        setDiscounts(response.data as DiscountType[]);
        return response.data as DiscountType[];
      }
    } catch (error) {
      console.error("Error loading discounts:", error);
    }
    return [];
  };

  // Load Events with Discounts
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const [eventResponse, loadedDiscounts] = await Promise.all([
        eventService.findAndPaginate({
          page: 1,
          limit: 100,
          sortBy: "name:ASC",
          filter: { is_in_combo: false, is_active: true },
        }),
        loadDiscounts(),
      ]);

      if (eventResponse.success) {
        const eventsData = eventResponse.data as EventType[];
        // Attach discount to each event
        const eventsWithDiscount: EventWithDiscount[] = eventsData.map(
          (event) => ({
            ...event,
            discount:
              loadedDiscounts.find(
                (d: DiscountType) => d.event_id === event.id && d.is_active,
              ) || null,
          }),
        );
        setEvents(eventsWithDiscount);
      }
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

  // Load ticket prices
  const loadPrices = async () => {
    try {
      const response = await ticketPriceService.getAll();
      if (response.success && response.data) {
        const priceMap: Map<string, number> = new Map();
        const ticketPricesData = response.data as TicketPriceType[];
        setTicketPrices(ticketPricesData);
        ticketPricesData.forEach((tp) => {
          priceMap.set(
            `${tp.format_id}-${tp.seat_type_id}-${tp.day_type}`,
            tp.price!,
          );
        });
        setPrices(priceMap);
      }
    } catch (error) {
      console.error("Error loading ticket prices:", error);
    }
  };

  // Load user's held seats
  const loadUserHeldSeats = async () => {
    try {
      const response = await showTimeSeatService.getAllHeldSeatsByUserId();
      if (response.success && response.data && response.data.length > 0) {
        const currentShowTimeHeldSeats = response.data.filter((hold: any) => {
          return showTimeDetail?.room?.seats?.some(
            (seat) => seat.show_time_seat?.id === hold.showTimeSeatId,
          );
        });

        if (currentShowTimeHeldSeats.length > 0) {
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

          // Create pending order
          if (data.movie?.id) {
            createPendingOrder(data.movie.id);
          }

          // Load additional data
          loadCombos();
          loadMenuItems();
          loadEvents();
          loadPrices();

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
              const holdingSeatIds = holdingSeatsResponse.data
                .map((s) => s.show_time_seat?.id)
                .filter(Boolean) as string[];
              setHeldSeatIds(holdingSeatIds);
              setSelectedSeats(holdingSeatsResponse.data);

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

  // Get Price
  const getPrice = (
    formatId: string,
    seatTypeId: string,
    dayType: string,
  ): number => {
    return prices.get(`${formatId}-${seatTypeId}-${dayType}`) || 0;
  };

  // Get ticket price ID
  const getTicketPriceId = (
    formatId: string,
    seatTypeId: string,
    dayType: string,
  ): string | undefined => {
    const tp = ticketPrices.find(
      (t) =>
        t.format_id === formatId &&
        t.seat_type_id === seatTypeId &&
        t.day_type === dayType,
    );
    return tp?.id;
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
    if (selectedCombos.some((c) => c.id === combo.id)) {
      setSelectedCombos((prev) => prev.filter((c) => c.id !== combo.id));
      return;
    }

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
  const handleEventSelect = (event: EventWithDiscount) => {
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
      ...getSeatTypeColor(t),
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

  const getSeatColorClass = (seat: SeatDetail, isSelected: boolean) => {
    const status = seat.show_time_seat?.status_seat;
    const seatType = seat.seat_type?.type || seat.seat_type?.name || "STANDARD";
    const typeColors = getSeatTypeColor(seatType);

    if (!seat.is_active || status === "FIXING") {
      return seatStatusColors.FIXING.class;
    }
    if (isSelected) {
      return seatStatusColors.SELECTED.class;
    }
    switch (status) {
      case "BOOKED":
        return seatStatusColors.BOOKED.class;
      case "HOLDING":
        return `${typeColors.bg} ${seatStatusColors.HOLDING.class} ${typeColors.border}`;
      default:
        return `${typeColors.bg} ${typeColors.border} border-2 ${seatStatusColors.AVAILABLE.class}`;
    }
  };

  // Calculate totals with discount
  const calculatedTotals = useMemo(() => {
    const seatTotal = selectedSeats.reduce(
      (sum, s) =>
        sum +
        getPrice(
          showTimeDetail?.room?.format?.id as string,
          s.seat_type?.id as string,
          showTimeDetail?.day_type as string,
        ),
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

    const subtotal = seatTotal + comboTotal + menuTotal;

    // Apply discount if event is selected and has discount
    let discountPercent = 0;
    let discountAmount = 0;
    if (selectedEvent?.discount && selectedEvent.discount.is_active) {
      discountPercent = selectedEvent.discount.discount_percent || 0;
      discountAmount = Math.round((subtotal * discountPercent) / 100);
    }

    const total = subtotal - discountAmount;

    return {
      seatTotal,
      comboTotal,
      menuTotal,
      subtotal,
      discountPercent,
      discountAmount,
      total,
    };
  }, [
    selectedSeats,
    selectedCombos,
    selectedMenuItems,
    selectedEvent,
    showTimeDetail,
    prices,
  ]);

  // Generate order data for logging
  const generateOrderData = () => {
    const order = {
      id: currentOrder?.id,
      user_id: user?.id,
      movie_id: showTimeDetail?.movie?.id,
      discount_id: selectedEvent?.discount?.id || null,
      total_price: calculatedTotals.total,
      payment_status: "PENDING",
      showtime_id: showTimeId,
    };

    const tickets = selectedSeats.map((seat) => ({
      ticket_price_id: getTicketPriceId(
        showTimeDetail?.room?.format?.id as string,
        seat.seat_type?.id as string,
        showTimeDetail?.day_type as string,
      ),
      order_id: currentOrder?.id,
      showtime_seat_id: seat.show_time_seat?.id,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type?.name,
      price: getPrice(
        showTimeDetail?.room?.format?.id as string,
        seat.seat_type?.id as string,
        showTimeDetail?.day_type as string,
      ),
    }));

    const comboItemInTickets = selectedCombos.map((combo) => ({
      order_id: currentOrder?.id,
      combo_id: combo.id,
      combo_name: combo.name,
      total_price: combo.total_price,
    }));

    const menuItemInTickets = selectedMenuItems.map((m) => ({
      order_id: currentOrder?.id,
      item_id: m.item.id,
      item_name: m.item.name,
      quantity: m.quantity,
      unit_price: m.item.price,
      total_price: m.item.price * m.quantity,
    }));

    return { order, tickets, comboItemInTickets, menuItemInTickets };
  };

  // Handle payment
  const handlePayment = () => {
    const orderData = generateOrderData();

    console.log("=".repeat(60));
    console.log("📋 ORDER DETAILS");
    console.log("=".repeat(60));
    console.log("\n🎫 ORDER:");
    console.log(JSON.stringify(orderData.order, null, 2));

    console.log("\n🎟️ TICKETS:");
    console.log(JSON.stringify(orderData.tickets, null, 2));

    console.log("\n🍿 COMBO ITEMS IN TICKET:");
    console.log(JSON.stringify(orderData.comboItemInTickets, null, 2));

    console.log("\n🍕 MENU ITEMS IN TICKET:");
    console.log(JSON.stringify(orderData.menuItemInTickets, null, 2));

    console.log("\n💰 TOTAL SUMMARY:");
    console.log({
      seatTotal: formatPrice(calculatedTotals.seatTotal),
      comboTotal: formatPrice(calculatedTotals.comboTotal),
      menuTotal: formatPrice(calculatedTotals.menuTotal),
      subtotal: formatPrice(calculatedTotals.subtotal),
      discountPercent: `${calculatedTotals.discountPercent}%`,
      discountAmount: formatPrice(calculatedTotals.discountAmount),
      finalTotal: formatPrice(calculatedTotals.total),
    });
    console.log("=".repeat(60));

    toast.success("Đặt vé thành công! Kiểm tra console để xem chi tiết.");
    setConfirmDialogOpen(false);
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
      <div className="flex items-center justify-between bg-card rounded-lg p-3 shadow-sm">
        <Button variant="ghost" onClick={handleBack} disabled={holdLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center gap-4">
          {currentOrder && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-300"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Order #{currentOrder.id?.slice(-8)}
            </Badge>
          )}

          {isHolding && holdCountdown > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 rounded-lg shadow-sm">
              <Timer className="h-5 w-5 text-amber-600 animate-pulse" />
              <div>
                <p className="text-xs text-amber-600 font-medium">
                  Thời gian giữ ghế
                </p>
                <p
                  className={`text-xl font-bold font-mono ${holdCountdown <= 60 ? "text-red-500 animate-pulse" : "text-amber-600"}`}
                >
                  {formatCountdown(holdCountdown)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Movie Info */}
        <div className="lg:col-span-3">
          <Card className="sticky top-4 shadow-lg mb-4">
            <CardHeader className="py-3 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Tóm tắt đặt vé
                </span>
                <Badge variant="secondary" className="bg-primary/20">
                  {selectedSeats.length} ghế
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Selected Seats */}
              {selectedSeats.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Ticket className="h-3 w-3" />
                    Ghế đã chọn:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <Badge
                        key={s.id}
                        variant="outline"
                        className="text-xs font-medium"
                      >
                        {s.seat_number}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-right">
                    {formatPrice(calculatedTotals.seatTotal)}
                  </p>
                </div>
              )}

              {/* Selected Combos */}
              {selectedCombos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <UtensilsCrossed className="h-3 w-3" />
                    Combo:
                  </p>
                  {selectedCombos.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        {c.name}
                      </span>
                      <span className="font-medium">
                        {formatPrice(c.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Menu Items */}
              {selectedMenuItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Món lẻ:
                  </p>
                  {selectedMenuItems.map((m) => (
                    <div
                      key={m.item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {m.item.name} x{m.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(m.item.price * m.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Event */}
              {selectedEvent && (
                <div className="space-y-1 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Sự kiện áp dụng:
                  </p>
                  <p className="text-sm font-medium">{selectedEvent.name}</p>
                  {selectedEvent.discount &&
                    selectedEvent.discount.is_active && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Tag className="h-3 w-3" />
                        <span className="text-xs font-bold">
                          Giảm {selectedEvent.discount.discount_percent}%
                        </span>
                      </div>
                    )}
                </div>
              )}

              <Separator />

              {/* Total Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{formatPrice(calculatedTotals.subtotal)}</span>
                </div>

                {calculatedTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Giảm giá ({calculatedTotals.discountPercent}%):
                    </span>
                    <span>-{formatPrice(calculatedTotals.discountAmount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(calculatedTotals.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!isHolding ? (
                  <Button
                    className="w-full h-11 text-base"
                    onClick={handleHoldSeats}
                    disabled={selectedSeats.length === 0 || holdLoading}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {holdLoading ? "Đang xử lý..." : "Giữ ghế (10 phút)"}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full h-11 text-base bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
          <Card className="overflow-hidden shadow-lg">
            <div className="h-48 overflow-hidden">
              <img
                src={
                  showTimeDetail.movie?.image ||
                  showTimeDetail.movie?.thumbnail ||
                  "/placeholder.png"
                }
                alt={showTimeDetail.movie?.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <h2 className="font-bold text-base line-clamp-2 leading-tight">
                {showTimeDetail.movie?.title}
              </h2>
              <Separator />
              <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <span>{showTimeDetail.movie?.duration} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{showTimeDetail.room?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    {formatTime(showTimeDetail.start_time)}
                  </span>
                </div>
              </div>
              <Badge
                className={`w-full justify-center text-sm py-1 ${showTimeDetail.day_type === "WEEKEND" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`}
              >
                {showTimeDetail.day_type === "WEEKEND"
                  ? "Cuối tuần"
                  : "Ngày thường"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Center: Seat Map + Extras */}
        <div className="lg:col-span-9 space-y-4">
          {/* Seat Map */}
          <Card className="shadow-lg">
            <CardHeader className="py-3 px-4 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                Sơ đồ ghế - {showTimeDetail.room?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="mb-6 text-center perspective-1000">
                <div className="w-3/4 mx-auto py-3 bg-gradient-to-b from-gray-400 via-gray-300 to-gray-100 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 rounded-t-[100%] text-sm font-bold tracking-widest shadow-lg transform rotateX-10">
                  MÀN HÌNH
                </div>
                <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="flex flex-col items-center space-y-1 py-2">
                  {sortedRows.map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-2 justify-center"
                    >
                      <span className="w-6 text-center font-bold text-muted-foreground text-sm">
                        {row}
                      </span>
                      <div className="flex gap-1">
                        {groupedSeats[row].map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!canSelectSeat(seat)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${getSeatColorClass(seat, isSeatSelected(seat))}`}
                            title={`${seat.seat_number} - ${seat.seat_type?.name || "STANDARD"} - ${formatPrice(getPrice(showTimeDetail?.room?.format?.id as string, seat.seat_type?.id as string, showTimeDetail?.day_type as string))}`}
                          >
                            {seat.seat_number.slice(1)}
                          </button>
                        ))}
                      </div>
                      <span className="w-6 text-center font-bold text-muted-foreground text-sm">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Loại ghế:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueSeatTypes.map((st) => (
                      <div
                        key={st.type}
                        className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded-md"
                      >
                        <div
                          className={`w-6 h-6 ${st.legendBg} border-2 rounded-lg shadow-sm`}
                        />
                        <span className="text-xs font-medium">{st.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">
                    Trạng thái:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 border-2 border-gray-400 rounded-lg" />
                      <span className="text-xs">Còn trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-lg shadow-md ring-2 ring-primary ring-offset-1" />
                      <span className="text-xs">Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 border-2 border-dashed border-gray-500 rounded-lg" />
                      <span className="text-xs">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-500 border-2 border-gray-700 rounded-lg" />
                      <span className="text-xs">Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded-lg opacity-60 relative">
                        <XCircle className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                      <span className="text-xs">Bảo trì</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combos, Menu Items, Events */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Combos */}
            <Card className="shadow-md">
              <CardHeader className="py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                  Combo
                  {selectedCombos.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {selectedCombos.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <Input
                  placeholder="Tìm combo..."
                  value={comboSearch}
                  onChange={(e) => setComboSearch(e.target.value)}
                  className="h-9"
                />
                <ScrollArea className="h-52">
                  {loadingCombos ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                  ) : filteredCombos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Không có combo
                    </p>
                  ) : (
                    <div className="space-y-2 pr-2">
                      {filteredCombos.map((combo) => {
                        const isSelected = selectedCombos.some(
                          (c) => c.id === combo.id,
                        );
                        return (
                          <div
                            key={combo.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-2 border-primary shadow-sm" : "hover:bg-muted border-2 border-transparent"}`}
                            onClick={() => handleComboToggle(combo)}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4"
                            />
                            {combo.image && (
                              <img
                                src={combo.image}
                                alt={combo.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {combo.name}
                              </p>
                              <p className="text-sm font-bold text-primary">
                                {formatPrice(combo.total_price)}
                              </p>
                              {combo.is_event_combo && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                                >
                                  Event
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadComboDetailsForDialog(combo.id!);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Menu Items - Fixed layout */}
            <Card className="shadow-md col-2">
              <CardHeader className="py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gift className="h-4 w-[60%] text-green-500" />
                  Món lẻ
                  {selectedMenuItems.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {selectedMenuItems.reduce(
                        (sum, m) => sum + m.quantity,
                        0,
                      )}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <Input
                  placeholder="Tìm món..."
                  value={menuItemSearch}
                  onChange={(e) => setMenuItemSearch(e.target.value)}
                  className="h-9"
                />
                <ScrollArea className="h-52">
                  {loadingMenuItems ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Không có món
                    </p>
                  ) : (
                    <div className="space-y-2 pr-2">
                      {filteredMenuItems.map((item) => {
                        const selected = selectedMenuItems.find(
                          (m) => m.item.id === item.id,
                        );
                        return (
                          <div
                            key={item.id}
                            className={`p-2 rounded-lg transition-all ${selected ? "bg-primary/10 border-2 border-primary shadow-sm" : "hover:bg-muted border-2 border-transparent"}`}
                          >
                            <div className="flex items-center gap-2">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-md shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.name}
                                </p>
                                <p className="text-sm font-bold text-primary">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => {
                                  setSelectedMenuItemDetail(item);
                                  setMenuItemDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Quantity Controls - Separate row */}
                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleMenuItemQuantityChange(item, -1)
                                }
                                disabled={!selected}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-10 text-center text-sm font-bold bg-muted rounded px-2 py-1">
                                {selected?.quantity || 0}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleMenuItemQuantityChange(item, 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
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
            <Card className="shadow-md">
              <CardHeader className="py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  Sự kiện
                  {selectedEvent && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-green-100 text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã chọn
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <Input
                  placeholder="Tìm sự kiện..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="h-9"
                />
                <ScrollArea className="h-52">
                  {loadingEvents ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Không có sự kiện
                    </p>
                  ) : (
                    <div className="space-y-2 pr-2">
                      {filteredEvents.map((event) => {
                        const isSelected = selectedEvent?.id === event.id;
                        return (
                          <div
                            key={event.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-2 border-primary shadow-sm" : "hover:bg-muted border-2 border-transparent"}`}
                            onClick={() => handleEventSelect(event)}
                          >
                            {event.image && (
                              <img
                                src={event.image}
                                alt={event.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {event.name}
                              </p>
                              {event.discount && event.discount.is_active && (
                                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs mt-1">
                                  <Percent className="h-3 w-3 mr-1" />
                                  Giảm {event.discount.discount_percent}%
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEventDetail(event);
                                setEventDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Booking Summary */}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Xác nhận đặt vé
            </DialogTitle>
            <DialogDescription>
              Kiểm tra lại thông tin trước khi thanh toán
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <img
                src={showTimeDetail.movie?.thumbnail || "/placeholder.png"}
                alt={showTimeDetail.movie?.title}
                className="w-16 h-24 object-cover rounded-md shadow"
              />
              <div>
                <p className="font-bold text-lg">
                  {showTimeDetail.movie?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {showTimeDetail.room?.name} •{" "}
                  {formatTime(showTimeDetail.start_time)}
                </p>
                <Badge className="mt-1">
                  {showTimeDetail.day_type === "WEEKEND"
                    ? "Cuối tuần"
                    : "Ngày thường"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ghế:</span>
                <span className="font-medium">
                  {selectedSeats.map((s) => s.seat_number).join(", ")}
                </span>
              </div>

              {selectedCombos.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Combo:</span>
                  <span className="font-medium">
                    {selectedCombos.map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}

              {selectedMenuItems.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Món lẻ:</span>
                  <span className="font-medium">
                    {selectedMenuItems
                      .map((m) => `${m.item.name} x${m.quantity}`)
                      .join(", ")}
                  </span>
                </div>
              )}

              {selectedEvent && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sự kiện:</span>
                  <span className="font-medium">{selectedEvent.name}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatPrice(calculatedTotals.subtotal)}</span>
              </div>

              {calculatedTotals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá ({calculatedTotals.discountPercent}%):</span>
                  <span>-{formatPrice(calculatedTotals.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-bold text-lg">Tổng tiền:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(calculatedTotals.total)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePayment}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatBookingPage;
