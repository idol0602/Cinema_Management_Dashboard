/**
 * Shared seat type color configuration
 * Used across SeatBookingPage, SellPage, SeatList, and RoomList for consistent styling
 */

export interface SeatTypeColorConfig {
  bg: string;
  border: string;
  name: string;
  legendBg: string;
  // Additional properties for enhanced visuals
  gradient?: string;
  textColor?: string;
  // Status-specific colors for SellPage
  available: string;
  holding: string;
  booked: string;
}

export const seatTypeColors: Record<string, SeatTypeColorConfig> = {
  STANDARD: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-400 dark:border-blue-500",
    name: "Standard",
    legendBg: "bg-blue-200 dark:bg-blue-800 border-blue-400",
    gradient: "from-blue-100 to-blue-50",
    textColor: "text-blue-800 dark:text-blue-200",
    available: "bg-blue-100 hover:bg-blue-200 text-blue-800 cursor-pointer border-blue-400 border-2",
    holding: "bg-blue-200 text-blue-900 cursor-not-allowed border-blue-500 border-2 border-dashed",
    booked: "bg-blue-500 text-white cursor-not-allowed border-blue-700 border-2",
  },
  VIP: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-400 dark:border-amber-500",
    name: "VIP",
    legendBg: "bg-amber-200 dark:bg-amber-800 border-amber-400",
    gradient: "from-amber-100 to-amber-50",
    textColor: "text-amber-800 dark:text-amber-200",
    available: "bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer border-amber-400 border-2",
    holding: "bg-amber-200 text-amber-900 cursor-not-allowed border-amber-500 border-2 border-dashed",
    booked: "bg-amber-500 text-white cursor-not-allowed border-amber-700 border-2",
  },
  COUPLE: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-400 dark:border-pink-500",
    name: "Couple",
    legendBg: "bg-pink-200 dark:bg-pink-800 border-pink-400",
    gradient: "from-pink-100 to-pink-50",
    textColor: "text-pink-800 dark:text-pink-200",
    available: "bg-pink-100 hover:bg-pink-200 text-pink-800 cursor-pointer border-pink-400 border-2",
    holding: "bg-pink-200 text-pink-900 cursor-not-allowed border-pink-500 border-2 border-dashed",
    booked: "bg-pink-500 text-white cursor-not-allowed border-pink-700 border-2",
  },
  SWEETBOX: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-400 dark:border-purple-500",
    name: "Sweet Box",
    legendBg: "bg-purple-200 dark:bg-purple-800 border-purple-400",
    gradient: "from-purple-100 to-purple-50",
    textColor: "text-purple-800 dark:text-purple-200",
    available: "bg-purple-100 hover:bg-purple-200 text-purple-800 cursor-pointer border-purple-400 border-2",
    holding: "bg-purple-200 text-purple-900 cursor-not-allowed border-purple-500 border-2 border-dashed",
    booked: "bg-purple-500 text-white cursor-not-allowed border-purple-700 border-2",
  },
  DELUXE: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-400 dark:border-emerald-500",
    name: "Deluxe",
    legendBg: "bg-emerald-200 dark:bg-emerald-800 border-emerald-400",
    gradient: "from-emerald-100 to-emerald-50",
    textColor: "text-emerald-800 dark:text-emerald-200",
    available: "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer border-emerald-400 border-2",
    holding: "bg-emerald-200 text-emerald-900 cursor-not-allowed border-emerald-500 border-2 border-dashed",
    booked: "bg-emerald-500 text-white cursor-not-allowed border-emerald-700 border-2",
  },
  PREMIUM: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-400 dark:border-cyan-500",
    name: "Premium",
    legendBg: "bg-cyan-200 dark:bg-cyan-800 border-cyan-400",
    gradient: "from-cyan-100 to-cyan-50",
    textColor: "text-cyan-800 dark:text-cyan-200",
    available: "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 cursor-pointer border-cyan-400 border-2",
    holding: "bg-cyan-200 text-cyan-900 cursor-not-allowed border-cyan-500 border-2 border-dashed",
    booked: "bg-cyan-500 text-white cursor-not-allowed border-cyan-700 border-2",
  },
  IMAX: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-400 dark:border-indigo-500",
    name: "IMAX",
    legendBg: "bg-indigo-200 dark:bg-indigo-800 border-indigo-400",
    gradient: "from-indigo-100 to-indigo-50",
    textColor: "text-indigo-800 dark:text-indigo-200",
    available: "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 cursor-pointer border-indigo-400 border-2",
    holding: "bg-indigo-200 text-indigo-900 cursor-not-allowed border-indigo-500 border-2 border-dashed",
    booked: "bg-indigo-500 text-white cursor-not-allowed border-indigo-700 border-2",
  },
  DBOX: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-400 dark:border-orange-500",
    name: "D-BOX",
    legendBg: "bg-orange-200 dark:bg-orange-800 border-orange-400",
    gradient: "from-orange-100 to-orange-50",
    textColor: "text-orange-800 dark:text-orange-200",
    available: "bg-orange-100 hover:bg-orange-200 text-orange-800 cursor-pointer border-orange-400 border-2",
    holding: "bg-orange-200 text-orange-900 cursor-not-allowed border-orange-500 border-2 border-dashed",
    booked: "bg-orange-500 text-white cursor-not-allowed border-orange-700 border-2",
  },
};

/**
 * Get seat color configuration by type
 * Falls back to STANDARD if type not found
 */
export const getSeatTypeColor = (type: string): SeatTypeColorConfig => {
  return seatTypeColors[type] || seatTypeColors.STANDARD;
};

/**
 * Get all available seat types
 */
export const getAllSeatTypes = (): string[] => {
  return Object.keys(seatTypeColors);
};

/**
 * Seat status colors (shared across components)
 */
export const seatStatusColors = {
  AVAILABLE: {
    class: "hover:scale-105 cursor-pointer transition-transform",
  },
  SELECTED: {
    class: "bg-primary border-2 border-primary text-primary-foreground shadow-lg scale-105 cursor-pointer ring-2 ring-offset-1 ring-primary",
  },
  HOLDING: {
    class: "border-2 border-dashed cursor-not-allowed opacity-80",
  },
  BOOKED: {
    class: "bg-gray-500 border-2 border-gray-700 text-white cursor-not-allowed",
  },
  FIXING: {
    class: "bg-gray-200 border-2 border-gray-400 opacity-60 cursor-not-allowed relative",
  },
};
