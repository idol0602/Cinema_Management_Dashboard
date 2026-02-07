/**
 * Datetime utilities for converting UTC database times to Vietnam timezone (UTC+7)
 * for display purposes.
 */

const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Convert UTC string from database to Vietnam time Date object
 * @param utcString - UTC datetime string (e.g., "2026-02-07T14:34:00+00:00" or "2026-02-07 14:34:00+00")
 * @returns Date object in Vietnam timezone
 */
export const toVietnamTime = (utcString: string): Date | null => {
  if (!utcString) return null;

  try {
    // Normalize the string format
    let normalized = utcString;
    
    // Handle space format: "2026-02-07 14:34:00+00" -> "2026-02-07T14:34:00+00:00"
    if (utcString.includes(" ") && !utcString.includes("T")) {
      normalized = utcString.replace(" ", "T");
    }
    
    // Handle short timezone format: "+00" -> "+00:00"
    if (/\+\d{2}$/.test(normalized)) {
      normalized = normalized + ":00";
    }
    
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return null;
    
    return date;
  } catch (error) {
    console.error("Error parsing datetime:", utcString, error);
    return null;
  }
};

/**
 * Format UTC string to Vietnam date: "dd/mm/yy"
 * @param utcString - UTC datetime string from database
 * @returns Formatted date string in Vietnam timezone
 */
export const formatVietnamDate = (utcString: string): string => {
  const date = toVietnamTime(utcString);
  if (!date) return "N/A";

  return date.toLocaleDateString("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

/**
 * Format UTC string to Vietnam time: "HH:mm"
 * @param utcString - UTC datetime string from database
 * @returns Formatted time string in Vietnam timezone
 */
export const formatVietnamTime = (utcString: string): string => {
  const date = toVietnamTime(utcString);
  if (!date) return "N/A";

  return date.toLocaleTimeString("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Parse UTC string to Vietnam date and time parts
 * @param utcString - UTC datetime string from database
 * @returns Object with date and time strings in Vietnam timezone
 */
export const parseVietnamDateTime = (
  utcString: string
): { date: string; time: string } => {
  return {
    date: formatVietnamDate(utcString),
    time: formatVietnamTime(utcString),
  };
};

/**
 * Format UTC string to full Vietnam datetime: "HH:mm dd/mm/yyyy"
 * @param utcString - UTC datetime string from database
 * @returns Formatted datetime string in Vietnam timezone
 */
export const formatVietnamFullDateTime = (utcString: string | undefined): string => {
  if (!utcString) return "N/A";
  const date = toVietnamTime(utcString);
  if (!date) return "N/A";

  return date.toLocaleString("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Format a Date object to Vietnam locale date string
 * @param date - Date object or string (can be undefined)
 * @returns Formatted date string
 */
export const formatDateToVietnamese = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "N/A";

  return dateObj.toLocaleDateString("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
  });
};
