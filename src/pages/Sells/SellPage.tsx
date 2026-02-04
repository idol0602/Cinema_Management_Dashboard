import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
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
  Package,
  UtensilsCrossed,
  Gift,
  CreditCard,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Timer,
  XCircle,
  Lock,
} from "lucide-react";

import { showTimeService } from "@/services/showTime.service";
import { comboService } from "@/services/combo.service";
import { menuItemService } from "@/services/menuItem.service";
import { eventService } from "@/services/event.service";
import { showTimeSeatService } from "@/services/showTimeSeat.service";

import type { ShowTimeType, ShowTimeDetailType, SeatDetail } from "@/types/showTime.type";
import type { ComboType } from "@/types/combo.type";
import type { MenuItemType } from "@/types/menuItem.type";
import type { EventType } from "@/types/event.type";
import { ComboDetailDialog } from "@/components/combos/ComboDetailDialog";
import { MenuItemDetailDialog } from "@/components/menuItems/MenuItemDetailDialog";
import EventDetailDialog from "@/components/events/EventDetailDialog";

const SellPage = () => {
  const navigate = useNavigate();
  
  // Data states
  const [showTimes, setShowTimes] = useState<ShowTimeType[]>([]);
  const [showTimeDetail, setShowTimeDetail] = useState<ShowTimeDetailType | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatDetail[]>([]);

  // Event Combos (is_event_combo = true)
  const [eventCombos, setEventCombos] = useState<ComboType[]>([]);
  const [eventComboSearch, setEventComboSearch] = useState("");
  const [eventComboPage, setEventComboPage] = useState(1);
  const [eventComboMeta, setEventComboMeta] = useState<{ totalPages: number; total: number }>({ totalPages: 1, total: 0 });
  const [loadingEventCombos, setLoadingEventCombos] = useState(true);
  const [selectedEventComboDetail, setSelectedEventComboDetail] = useState<any>(null);
  const [eventComboDialogOpen, setEventComboDialogOpen] = useState(false);
  const [eventCombosWithDetails, setEventCombosWithDetails] = useState<any[]>([]); // Store combo details for matching
  const [selectedEventComboForBooking, setSelectedEventComboForBooking] = useState<any>(null); // Selected combo for booking

  // Food/Drink Combos (is_event_combo = false)
  const [foodCombos, setFoodCombos] = useState<ComboType[]>([]);
  const [foodComboSearch, setFoodComboSearch] = useState("");
  const [selectedFoodCombos, setSelectedFoodCombos] = useState<ComboType[]>([]);
  const [loadingFoodCombos, setLoadingFoodCombos] = useState(false);

  // Menu Items
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [menuItemSearch, setMenuItemSearch] = useState("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<{ item: MenuItemType; quantity: number }[]>([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);

  // Events (is_in_combo = false)
  const [events, setEvents] = useState<EventType[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Detail dialog states
  const [selectedMenuItemDetail, setSelectedMenuItemDetail] = useState<MenuItemType | null>(null);
  const [menuItemDetailDialogOpen, setMenuItemDetailDialogOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventType | null>(null);
  const [eventDetailDialogOpen, setEventDetailDialogOpen] = useState(false);
  const [selectedFoodComboDetail, setSelectedFoodComboDetail] = useState<any>(null);
  const [foodComboDetailDialogOpen, setFoodComboDetailDialogOpen] = useState(false);

  // Loading states
  const [loadingShowTimes, setLoadingShowTimes] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "detail" | "booking">("list");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  // Seat Hold states
  const [isHolding, setIsHolding] = useState(false);
  const [heldSeatIds, setHeldSeatIds] = useState<string[]>([]);
  const [holdCountdown, setHoldCountdown] = useState(0); // seconds remaining
  const [holdLoading, setHoldLoading] = useState(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HOLD_TTL_SECONDS = 600; // 10 minutes

  // Load Event Combos (is_event_combo = true)
  const loadEventCombos = async (page: number = 1, search: string = "") => {
    setLoadingEventCombos(true);
    try {
      const response = await comboService.findAndPaginate({
        page,
        limit: 6,
        sortBy: "created_at:DESC",
        filter: {
          is_event_combo: true,
          is_active: true,
          ...(search ? { name: { $ilike: `%${search}%` } } : {}),
        },
      });
      if (response.success) {
        const combos = response.data as ComboType[];
        setEventCombos(combos);
        setEventComboMeta({
          totalPages: response.meta?.totalPages || 1,
          total: response.meta?.totalItems || 0,
        });
        
        // Load details for each combo for matching
        const detailsPromises = combos.map(async (combo) => {
          const detailRes = await comboService.getDetails(combo.id!);
          return detailRes.success ? detailRes.data : null;
        });
        const details = await Promise.all(detailsPromises);
        setEventCombosWithDetails(details.filter(d => d !== null));
      }
    } catch (error) {
      console.error("Error loading event combos:", error);
    } finally {
      setLoadingEventCombos(false);
    }
  };

  // Load Event Combo Details
  const loadEventComboDetails = async (id: string) => {
    try {
      const response = await comboService.getDetails(id);
      if (response.success) {
        setSelectedEventComboDetail(response.data);
        setEventComboDialogOpen(true);
      } else {
        toast.error("Không thể tải chi tiết combo");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải chi tiết combo");
    }
  };

  // Load Food Combo Details
  const loadFoodComboDetails = async (id: string) => {
    try {
      const response = await comboService.getDetails(id);
      if (response.success) {
        setSelectedFoodComboDetail(response.data);
        setFoodComboDetailDialogOpen(true);
      } else {
        toast.error("Không thể tải chi tiết combo");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải chi tiết combo");
    }
  };

  // Load Food/Drink Combos (is_event_combo = false)
  const loadFoodCombos = async () => {
    setLoadingFoodCombos(true);
    try {
      const response = await comboService.findAndPaginate({
        page: 1,
        limit: 100,
        sortBy: "name:ASC",
        filter: {
          is_event_combo: false,
          is_active: true,
        },
      });
      if (response.success) {
        setFoodCombos(response.data as ComboType[]);
      }
    } catch (error) {
      console.error("Error loading food combos:", error);
    } finally {
      setLoadingFoodCombos(false);
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
        filter: {
          is_active: true,
        },
      });
      if (response.success) {
        setMenuItems(response.data as MenuItemType[]);
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  // Load Events (is_in_combo = false)
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await eventService.findAndPaginate({
        page: 1,
        limit: 100,
        sortBy: "name:ASC",
        filter: {
          is_in_combo: false,
          is_active: true,
        },
      });
      if (response.success) {
        setEvents(response.data as EventType[]);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadShowTimes = async () => {
    setLoadingShowTimes(true);
    try {
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
    loadEventCombos();
  }, []);

  useEffect(() => {
    loadEventCombos(eventComboPage, eventComboSearch);
  }, [eventComboPage]);

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

  // Filter food combos by search
  const filteredFoodCombos = useMemo(() => {
    if (!foodComboSearch.trim()) return foodCombos;
    return foodCombos.filter((c) =>
      c.name.toLowerCase().includes(foodComboSearch.toLowerCase())
    );
  }, [foodCombos, foodComboSearch]);

  // Filter menu items by search
  const filteredMenuItems = useMemo(() => {
    if (!menuItemSearch.trim()) return menuItems;
    return menuItems.filter((m) =>
      m.name.toLowerCase().includes(menuItemSearch.toLowerCase())
    );
  }, [menuItems, menuItemSearch]);

  // Filter events by search
  const filteredEvents = useMemo(() => {
    if (!eventSearch.trim()) return events;
    return events.filter((e) =>
      e.name.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [events, eventSearch]);

  // Get applicable combos for current showtime (matching movie name)
  const applicableCombos = useMemo(() => {
    if (!showTimeDetail?.movie?.title || eventCombosWithDetails.length === 0) return [];
    const movieTitle = showTimeDetail.movie.title.toLowerCase();
    
    return eventCombosWithDetails.filter((comboDetail: any) => {
      // Check if combo has movie with matching title
      if (comboDetail?.combo_movies && Array.isArray(comboDetail.combo_movies)) {
        return comboDetail.combo_movies.some((cm: any) => 
          cm.movie?.title?.toLowerCase() === movieTitle
        );
      }
      return false;
    });
  }, [showTimeDetail, eventCombosWithDetails]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Seat helpers - Scalable colors for seat types + 4 statuses
  // Color palette for different seat types - easily extendable
  // Pre-defined Tailwind classes for each color and status combination
  const seatTypeColors: Record<string, { 
    name: string; 
    available: string;
    holding: string;
    booked: string;
    legendBg: string;
  }> = {
    STANDARD: {
      name: "Thường",
      available: "bg-blue-100 hover:bg-blue-200 text-blue-800 cursor-pointer border-blue-400 border-2",
      holding: "bg-blue-200 text-blue-900 cursor-not-allowed border-blue-500 border-2 border-dashed",
      booked: "bg-blue-500 text-white cursor-not-allowed border-blue-700 border-2",
      legendBg: "bg-blue-100 border-blue-400",
    },
    VIP: {
      name: "VIP",
      available: "bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer border-amber-400 border-2",
      holding: "bg-amber-200 text-amber-900 cursor-not-allowed border-amber-500 border-2 border-dashed",
      booked: "bg-amber-500 text-white cursor-not-allowed border-amber-700 border-2",
      legendBg: "bg-amber-100 border-amber-400",
    },
    COUPLE: {
      name: "Đôi",
      available: "bg-pink-100 hover:bg-pink-200 text-pink-800 cursor-pointer border-pink-400 border-2",
      holding: "bg-pink-200 text-pink-900 cursor-not-allowed border-pink-500 border-2 border-dashed",
      booked: "bg-pink-500 text-white cursor-not-allowed border-pink-700 border-2",
      legendBg: "bg-pink-100 border-pink-400",
    },
    SWEETBOX: {
      name: "Sweet Box",
      available: "bg-purple-100 hover:bg-purple-200 text-purple-800 cursor-pointer border-purple-400 border-2",
      holding: "bg-purple-200 text-purple-900 cursor-not-allowed border-purple-500 border-2 border-dashed",
      booked: "bg-purple-500 text-white cursor-not-allowed border-purple-700 border-2",
      legendBg: "bg-purple-100 border-purple-400",
    },
    DELUXE: {
      name: "Deluxe",
      available: "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer border-emerald-400 border-2",
      holding: "bg-emerald-200 text-emerald-900 cursor-not-allowed border-emerald-500 border-2 border-dashed",
      booked: "bg-emerald-500 text-white cursor-not-allowed border-emerald-700 border-2",
      legendBg: "bg-emerald-100 border-emerald-400",
    },
    PREMIUM: {
      name: "Premium",
      available: "bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer border-rose-400 border-2",
      holding: "bg-rose-200 text-rose-900 cursor-not-allowed border-rose-500 border-2 border-dashed",
      booked: "bg-rose-500 text-white cursor-not-allowed border-rose-700 border-2",
      legendBg: "bg-rose-100 border-rose-400",
    },
    IMAX: {
      name: "IMAX",
      available: "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 cursor-pointer border-cyan-400 border-2",
      holding: "bg-cyan-200 text-cyan-900 cursor-not-allowed border-cyan-500 border-2 border-dashed",
      booked: "bg-cyan-500 text-white cursor-not-allowed border-cyan-700 border-2",
      legendBg: "bg-cyan-100 border-cyan-400",
    },
    DBOX: {
      name: "D-Box",
      available: "bg-orange-100 hover:bg-orange-200 text-orange-800 cursor-pointer border-orange-400 border-2",
      holding: "bg-orange-200 text-orange-900 cursor-not-allowed border-orange-500 border-2 border-dashed",
      booked: "bg-orange-500 text-white cursor-not-allowed border-orange-700 border-2",
      legendBg: "bg-orange-100 border-orange-400",
    },
  };

  // Get color classes based on seat type and status
  const getSeatColor = (seat: SeatDetail, isSelected: boolean) => {
    if (!seat.is_active) return "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 border-2 opacity-50";
    if (isSelected) return "bg-primary text-primary-foreground ring-2 ring-offset-1 ring-primary cursor-pointer shadow-lg";
    
    const status = seat.show_time_seat?.status_seat || "AVAILABLE";
    const seatType = seat.seat_type?.name?.toUpperCase() || "STANDARD";
    const colorSet = seatTypeColors[seatType] || seatTypeColors.STANDARD;
    
    switch (status) {
      case "AVAILABLE":
        return colorSet.available;
      case "HOLDING":
        return colorSet.holding;
      case "BOOKED":
        return colorSet.booked;
      case "FIXING":
        return "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-400 border-2 opacity-60";
      default:
        return colorSet.available;
    }
  };

  // Get unique seat types from current room for legend
  const uniqueSeatTypes = useMemo(() => {
    if (!showTimeDetail?.room?.seats) return [];
    const types = new Set<string>();
    showTimeDetail.room.seats.forEach((seat) => {
      const typeName = seat.seat_type?.name?.toUpperCase() || "STANDARD";
      types.add(typeName);
    });
    return Array.from(types).map((type) => ({
      type,
      ...(seatTypeColors[type] || seatTypeColors.STANDARD)
    }));
  }, [showTimeDetail]);

  const canSelectSeat = (seat: SeatDetail) => {
    // Don't allow selection if currently holding seats
    if (isHolding) return false;
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

  // Handlers
  const handleBackToList = () => {
    setViewMode("list");
    setShowTimeDetail(null);
    setSelectedSeats([]);
  };

  const handleOpenBooking = () => {
    if (!showTimeDetail?.id) {
      toast.error("Vui lòng chọn suất chiếu");
      return;
    }
    navigate(`/seat-booking/${showTimeDetail.id}`);
  };

  const handleConfirmBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế");
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleFillMovieSearch = (movieName: string) => {
    setSearchQuery(movieName);
  };

  // === Seat Hold Functions ===
  
  // Format countdown for display (MM:SS)
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start countdown timer
  const startCountdown = useCallback((seconds: number) => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    setHoldCountdown(seconds);
    
    countdownIntervalRef.current = setInterval(() => {
      setHoldCountdown((prev) => {
        if (prev <= 1) {
          // Time expired
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setIsHolding(false);
          setHeldSeatIds([]);
          toast.warning("Thời gian giữ ghế đã hết. Ghế đã được trả lại.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Hold multiple seats
  const handleHoldSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế để giữ chỗ");
      return;
    }

    setHoldLoading(true);
    try {
      const seatIds = selectedSeats.map((seat) => seat.show_time_seat?.id).filter(Boolean) as string[];
      
      const response = await showTimeSeatService.bulkHoldSeats(seatIds, HOLD_TTL_SECONDS);
      
      if (response.success) {
        setIsHolding(true);
        setHeldSeatIds(seatIds);
        startCountdown(HOLD_TTL_SECONDS);
        toast.success(`Đã giữ ${selectedSeats.length} ghế thành công. Bạn có ${HOLD_TTL_SECONDS / 60} phút để hoàn tất đặt vé.`);
      } else {
        toast.error(response.error || "Không thể giữ ghế. Vui lòng thử lại.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi giữ ghế");
      console.error(error);
    } finally {
      setHoldLoading(false);
    }
  };

  // Cancel held seats
  const handleCancelHold = async () => {
    if (heldSeatIds.length === 0) return;

    setHoldLoading(true);
    try {
      const response = await showTimeSeatService.bulkCancelHoldSeats(heldSeatIds);
      
      if (response.success) {
        // Clear countdown
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        setIsHolding(false);
        setHeldSeatIds([]);
        setHoldCountdown(0);
        setSelectedSeats([]);
        toast.success("Đã hủy giữ ghế thành công");
      } else {
        toast.error(response.error || "Không thể hủy giữ ghế");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi hủy giữ ghế");
      console.error(error);
    } finally {
      setHoldLoading(false);
    }
  };

  // Load hold info on page load (to restore countdown after refresh)
  const loadHoldInfo = useCallback(async () => {
    if (selectedSeats.length === 0) return;
    
    const seatIds = selectedSeats.map((seat) => seat.show_time_seat?.id).filter(Boolean) as string[];
    if (seatIds.length === 0) return;

    // Check first seat to see if any are held
    try {
      const response = await showTimeSeatService.getHoldInfo(seatIds[0]);
      const data = response.data as any;
      if (response.success && data?.holdInfo) {
        const expiresAt = new Date(data.holdInfo.expiresAt);
        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        
        if (remainingSeconds > 0) {
          setIsHolding(true);
          setHeldSeatIds(seatIds);
          startCountdown(remainingSeconds);
        }
      }
    } catch (error) {
      console.error("Error loading hold info:", error);
    }
  }, [selectedSeats, startCountdown]);

  // Cleanup on unmount or when leaving booking view
  useEffect(() => {
    return () => {
      // Clear countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Cancel holds when navigating away from booking view
  const handleExitBooking = async () => {
    if (isHolding && heldSeatIds.length > 0) {
      await handleCancelHold();
    }
    setViewMode("detail");
  };

  const handleEventComboSearch = () => {
    setEventComboPage(1);
    loadEventCombos(1, eventComboSearch);
  };

  const handleFoodComboToggle = (combo: ComboType) => {
    setSelectedFoodCombos((prev) => {
      const exists = prev.find((c) => c.id === combo.id);
      if (exists) {
        return prev.filter((c) => c.id !== combo.id);
      }
      return [...prev, combo];
    });
  };

  const handleMenuItemQuantityChange = (item: MenuItemType, delta: number) => {
    setSelectedMenuItems((prev) => {
      const exists = prev.find((m) => m.item.id === item.id);
      if (exists) {
        const newQuantity = exists.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((m) => m.item.id !== item.id);
        }
        return prev.map((m) =>
          m.item.id === item.id ? { ...m, quantity: newQuantity } : m
        );
      }
      if (delta > 0) {
        return [...prev, { item, quantity: 1 }];
      }
      return prev;
    });
  };

  const handleEventSelect = (event: EventType) => {
    setSelectedEvent((prev) => (prev?.id === event.id ? null : event));
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    // Seats price (simplified - would need actual seat type prices)
    total += selectedSeats.length * 80000;
    // Event combo (if selected)
    if (selectedEventComboForBooking) {
      total += selectedEventComboForBooking.total_price || 0;
    }
    // Food combos
    total += selectedFoodCombos.reduce((sum, c) => sum + c.total_price, 0);
    // Menu items
    total += selectedMenuItems.reduce((sum, m) => sum + m.item.price * m.quantity, 0);
    return total;
  };

  // Render Event Combos Section
  const renderEventCombosSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Combo Sự Kiện
        </CardTitle>
        <CardDescription>Các combo đặc biệt kèm phim</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm combo..."
              value={eventComboSearch}
              onChange={(e) => setEventComboSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEventComboSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleEventComboSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Combo Grid */}
        {loadingEventCombos ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : eventCombos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có combo sự kiện nào
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {eventCombos.map((combo) => (
                <Card key={combo.id} className="overflow-hidden group">
                  <div className="relative h-24 overflow-hidden">
                    <img
                      src={combo.image || "/placeholder.png"}
                      alt={combo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => loadEventComboDetails(combo.id!)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardContent className="p-2 space-y-1">
                    <h4 className="font-medium text-sm line-clamp-1">{combo.name}</h4>
                    <p className="text-xs text-primary font-semibold">
                      {formatPrice(combo.total_price)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => {
                        // Get movie name from combo details
                        const comboDetail = eventCombosWithDetails.find((d: any) => d?.id === combo.id);
                        const movieName = comboDetail?.combo_movies?.[0]?.movie?.title || combo.name;
                        handleFillMovieSearch(movieName);
                      }}
                    >
                      <Ticket className="h-3 w-3 mr-1" />
                      Đặt vé
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {eventComboMeta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={eventComboPage <= 1}
                  onClick={() => setEventComboPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Trang {eventComboPage} / {eventComboMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={eventComboPage >= eventComboMeta.totalPages}
                  onClick={() => setEventComboPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Combo Detail Dialog - using ComboDetailDialog component */}
      <ComboDetailDialog
        combo={selectedEventComboDetail}
        open={eventComboDialogOpen}
        onOpenChange={setEventComboDialogOpen}
      />
    </Card>
  );

  // Render ShowTime List
  const renderShowTimeList = () => (
    <div className="space-y-4">
      {/* Event Combos Section */}
      {renderEventCombosSection()}

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
              onClick={() => loadShowTimeDetails(showTime.id as string)}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
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

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatTime(showTime.start_time)} - {formatTime(showTime.end_time || "")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{showTime.rooms?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(showTime.movies?.duration)}</span>
                </div>
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
                <h3 className="font-semibold mb-3">Chú thích ghế ngồi</h3>
                
                {/* Seat Types - Dynamic based on room */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Loại ghế:</p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueSeatTypes.map((seatType) => (
                      <div key={seatType.type} className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${seatType.legendBg} border-2 rounded`} />
                        <span className="text-sm">{seatType.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Seat Statuses with distinct visual patterns */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Trạng thái:</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 border-2 border-gray-400 rounded" />
                      <span className="text-sm">Còn trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded shadow-md" />
                      <span className="text-sm">Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 border-2 border-dashed border-gray-500 rounded" />
                      <span className="text-sm">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-500 border-2 border-gray-700 rounded" />
                      <span className="text-sm">Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded opacity-60 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-500 rotate-45" />
                        </div>
                      </div>
                      <span className="text-sm">Bảo trì</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-3">
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
        {/* Back Button - calls handleExitBooking to cancel holds */}
        <Button variant="ghost" onClick={handleExitBooking} disabled={holdLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại chi tiết
        </Button>

        {/* Movie & Showtime Info + Hold Controls */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <img
                src={showTimeDetail.movie?.thumbnail || "/placeholder.png"}
                alt={showTimeDetail.movie?.title}
                className="w-20 h-28 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{showTimeDetail.movie?.title}</h3>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
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
              
              {/* Countdown Timer & Hold Status */}
              {isHolding && holdCountdown > 0 && (
                <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <Timer className="h-5 w-5 text-amber-600 mb-1" />
                  <p className="text-xs text-amber-600 font-medium">Thời gian giữ ghế</p>
                  <p className={`text-2xl font-bold ${holdCountdown <= 60 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`}>
                    {formatCountdown(holdCountdown)}
                  </p>
                </div>
              )}
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ghế đã chọn</p>
                <p className="text-2xl font-bold text-primary">{selectedSeats.length}</p>
                {selectedSeats.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 justify-end max-w-[200px]">
                    {selectedSeats.map((seat) => (
                      <Badge key={seat.id} variant="secondary" className="text-xs">
                        {seat.seat_number}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seat Map - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Chọn ghế ngồi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Screen */}
            <div className="mb-8 text-center">
              <div className="w-1/2 mx-auto py-2 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-full text-center text-sm text-gray-600 font-medium">
                MÀN HÌNH
              </div>
            </div>

            {/* Seat Grid - Centered */}
            <ScrollArea className="max-h-[500px]">
              <div className="flex flex-col items-center space-y-2 p-4">
                {sortedRows.map((row) => (
                  <div key={row} className="flex items-center gap-2 justify-center">
                    <span className="w-8 text-center font-bold text-muted-foreground">
                      {row}
                    </span>
                    <div className="flex gap-1">
                      {groupedSeats[row].map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={!canSelectSeat(seat)}
                          className={`
                            w-9 h-9 rounded-md border text-xs font-medium
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
                    <span className="w-8 text-center font-bold text-muted-foreground">
                      {row}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seat Types - Dynamic based on room */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Loại ghế:</p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueSeatTypes.map((seatType) => (
                      <div key={seatType.type} className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${seatType.legendBg} border-2 rounded-md`} />
                        <span className="text-sm">{seatType.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Seat Statuses with distinct visual patterns */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Trạng thái:</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 border-2 border-gray-400 rounded-md" />
                      <span className="text-sm">Còn trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-md shadow-md" />
                      <span className="text-sm">Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 border-2 border-dashed border-gray-500 rounded-md" />
                      <span className="text-sm">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-500 border-2 border-gray-700 rounded-md" />
                      <span className="text-sm">Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded-md opacity-60 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-500 rotate-45" />
                        </div>
                      </div>
                      <span className="text-sm">Bảo trì</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hold/Cancel Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {!isHolding ? (
                  <Button
                    className="flex-1"
                    onClick={handleHoldSeats}
                    disabled={selectedSeats.length === 0 || holdLoading}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {holdLoading ? "Đang xử lý..." : `Giữ ${selectedSeats.length} ghế (${HOLD_TTL_SECONDS / 60} phút)`}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancelHold}
                    disabled={holdLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {holdLoading ? "Đang hủy..." : "Hủy giữ ghế"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Food Combos, Menu Items, Events - Grid Layout Below Seats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Food Combos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Combo Đồ Ăn/Thức Uống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Tìm combo..."
                value={foodComboSearch}
                onChange={(e) => setFoodComboSearch(e.target.value)}
                className="h-8 text-sm"
              />
              <ScrollArea className="h-48">
                {loadingFoodCombos ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : filteredFoodCombos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Không có combo</p>
                ) : (
                  <div className="space-y-1">
                    {filteredFoodCombos.map((combo) => (
                      <div
                        key={combo.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          selectedFoodCombos.some((c) => c.id === combo.id) 
                            ? "bg-primary/10 border border-primary" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleFoodComboToggle(combo)}
                      >
                        <Checkbox
                          checked={selectedFoodCombos.some((c) => c.id === combo.id)}
                        />
                        {combo.image && (
                          <img
                            src={combo.image}
                            alt={combo.name}
                            className="w-10 h-10 object-cover rounded shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{combo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(combo.total_price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadFoodComboDetails(combo.id!);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Food Combo Detail Dialog */}
          <ComboDetailDialog
            combo={selectedFoodComboDetail}
            open={foodComboDetailDialogOpen}
            onOpenChange={setFoodComboDetailDialogOpen}
          />

          {/* Menu Items */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Món Lẻ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Tìm món..."
                value={menuItemSearch}
                onChange={(e) => setMenuItemSearch(e.target.value)}
                className="h-8 text-sm"
              />
              <ScrollArea className="h-48">
                {loadingMenuItems ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Không có món</p>
                ) : (
                  <div className="space-y-1">
                    {filteredMenuItems.map((item) => {
                      const selected = selectedMenuItems.find((m) => m.item.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded transition-colors ${
                            selected ? "bg-primary/10 border border-primary" : "hover:bg-muted"
                          }`}
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMenuItemDetail(item);
                              setMenuItemDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleMenuItemQuantityChange(item, -1)}
                              disabled={!selected}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {selected?.quantity || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleMenuItemQuantityChange(item, 1)}
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

          {/* Menu Item Detail Dialog */}
          <MenuItemDetailDialog
            menuItem={selectedMenuItemDetail}
            open={menuItemDetailDialogOpen}
            onOpenChange={setMenuItemDetailDialogOpen}
          />

          {/* Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Sự Kiện (chọn 1)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Tìm sự kiện..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="h-8 text-sm"
              />
              <ScrollArea className="h-48">
                {loadingEvents ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Không có sự kiện</p>
                ) : (
                  <div className="space-y-1">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                          selectedEvent?.id === event.id
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleEventSelect(event)}
                      >
                        {event.image && (
                          <img
                            src={event.image}
                            alt={event.name}
                            className="w-10 h-10 object-cover rounded shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.name}</p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventDetail(event);
                            setEventDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {selectedEvent?.id === event.id && (
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Event Detail Dialog */}
          <EventDetailDialog
            event={selectedEventDetail}
            open={eventDetailDialogOpen}
            onOpenChange={setEventDetailDialogOpen}
          />
        </div>

        {/* Total & Payment - Fixed at bottom */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 sticky bottom-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-evenly">
              <div>
                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(calculateTotal())}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length === 0}
                className="px-8"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Thanh toán
              </Button>
            </div>
          </CardContent>
        </Card>

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
                {selectedFoodCombos.length > 0 && (
                  <p><strong>Combo:</strong> {selectedFoodCombos.map(c => c.name).join(", ")}</p>
                )}
                {selectedMenuItems.length > 0 && (
                  <p><strong>Món lẻ:</strong> {selectedMenuItems.map(m => `${m.item.name} x${m.quantity}`).join(", ")}</p>
                )}
                {selectedEvent && (
                  <p><strong>Sự kiện:</strong> {selectedEvent.name}</p>
                )}
                <p className="text-lg font-bold text-primary">
                  <strong>Tổng cộng:</strong> {formatPrice(calculateTotal())}
                </p>
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
                setSelectedFoodCombos([]);
                setSelectedMenuItems([]);
                setSelectedEvent(null);
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
