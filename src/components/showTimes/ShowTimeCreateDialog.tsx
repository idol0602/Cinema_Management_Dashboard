"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MultiSelectComboboxTable } from "../ui/SelectToTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import type { movieType } from "@/types/movie.type";
import type { RoomType } from "@/types/room.type";
import type { ShowTimeType } from "@/types/showTime.type";
import { showTimeService } from "@/services/showTime.service";
import { showTimePaginateConfig } from "@/config/paginate/show_time.config";

interface ShowTimeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movies: movieType[];
  rooms: RoomType[];
  onSubmit?: (showTimes: any[]) => void;
}

export function ShowTimeCreateDialog({
  open,
  onOpenChange,
  movies,
  rooms,
  onSubmit,
}: ShowTimeCreateDialogProps) {
  const [formData, setFormData] = useState({
    movieIds: [] as string[],
    roomId: [] as string[],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    bufferTime: 10,
    adTime: 10,
    firstShowTime: "10:00 SA",
    closingTime: "10:30 CH",
  });

  const [showTimesList, setShowTimesList] = useState<ShowTimeType[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );

  /* ================== CALCULATE SHOW TIMES ================== */
  const calculateShowTimes = async () => {
    const showTimeCore: Omit<ShowTimeType, "id" | "room_id">[] = [];
    let timeReduce: string = formData.firstShowTime || "";
    let curDate: string = formData.startDate || "";

    if (!formData.firstShowTime) {
      toast.error("Vui lòng chọn suất chiếu đầu tiên");
      return;
    }

    //
    const selectedMovies = movies.filter((movie) => {
      if (formData.movieIds.includes(movie.id + "")) {
        return movie;
      }
    });
    if (selectedMovies.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 phim");
      return;
    }

    while (curDate <= formData.endDate) {
      timeReduce = formData.firstShowTime || "";
      while (timeReduce !== "over closing time") {
        const showTimeTemp: Omit<ShowTimeType, "id" | "room_id">[] = [];
        let isOverClosingTime = false;
        for (const movie of selectedMovies) {
          if (
            "over closing time" ==
            addMinutesToTime(
              timeReduce,
              (movie.duration || 120) + formData.adTime
            )
          ) {
            isOverClosingTime = true;
            break;
          }

          showTimeTemp.push({
            movie_id: movie.id + "",
            start_time: combineDateAndTimeToUTC(curDate, timeReduce),
            end_time: combineDateAndTimeToUTC(
              curDate,
              addMinutesToTime(
                timeReduce,
                (movie.duration || 120) + formData.adTime
              )
            ),
            day_type: getDayType(curDate),
            is_active: true,
          });
          timeReduce = addMinutesToTime(
            timeReduce,
            (movie.duration || 120) + formData.adTime + formData.bufferTime
          );
        }
        if (isOverClosingTime) {
          timeReduce = "over closing time";
        }
        showTimeCore.push(...showTimeTemp);
      }
      // Tăng ngày
      const nextDate = new Date(curDate);
      nextDate.setDate(nextDate.getDate() + 1);
      curDate = nextDate.toISOString().split("T")[0];
    }

    const showTimeCreated: ShowTimeType[] =
      (await findAndPaginate(1, undefined, undefined)) || [];

    const data: ShowTimeType[] = [];

    for (const roomId of formData.roomId) {
      for (const showTime of showTimeCore) {
        data.push({
          ...showTime,
          room_id: roomId,
        });
      }
    }
    console.log("data", data);
    console.log("showTimeCreated", showTimeCreated);

    const finalShowTimes = removeConflitRange(data, showTimeCreated);

    const removedCount = data.length - finalShowTimes.length;
    console.log("finalShowTimes", finalShowTimes);
    setShowTimesList(finalShowTimes);

    if (removedCount > 0) {
      toast.warning(`⚠️ Đã loại ${removedCount} suất chiếu trùng giờ`);
    }
    toast.success(
      `✓ Tính toán được ${finalShowTimes.length} suất chiếu hợp lệ`
    );
  };

  const findAndPaginate = async (
    page = 1,
    limit = undefined,
    sortBy = `${showTimePaginateConfig.defaultSortBy[0][0]}:${showTimePaginateConfig.defaultSortBy[0][1]}`
  ) => {
    try {
      // Validate dữ liệu đầu vào
      if (!formData.roomId || formData.roomId.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 phòng");
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error("Vui lòng chọn khoảng thời gian");
        return;
      }

      // Xây dựng filter object
      const filters: any = {
        "filter[room_id][$in]": formData.roomId.join(","),
        "filter[start_time][$gte]": `${formData.startDate}T00:00:00Z`,
        "filter[end_time][$lte]": `${formData.endDate}T23:59:59Z`,
      };

      const response = await showTimeService.findAndPaginate({
        page,
        limit,
        sortBy,
        ...filters,
      });

      if (response.success && response.data) {
        const data = response.data as ShowTimeType[];
        return data;
      } else {
        toast.error(response.error || "Lỗi khi tìm kiếm suất chiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tìm kiếm");
      console.error(error);
    }
  };

  const removeShowTime = (index: number) => {
    setShowTimesList(showTimesList.filter((_, i) => i !== index));
    const newSelected = new Set(selectedIndices);
    newSelected.delete(index);
    setSelectedIndices(newSelected);
  };

  // Toggle select một suất chiếu
  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  // Select/Deselect tất cả
  const handleSelectAll = () => {
    if (selectedIndices.size === showTimesList.length) {
      // Deselect all
      setSelectedIndices(new Set());
    } else {
      // Select all
      setSelectedIndices(new Set(showTimesList.map((_, i) => i)));
    }
  };

  // Xóa những suất chiếu được chọn
  const handleDeleteSelected = () => {
    if (selectedIndices.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 suất chiếu để xóa");
      return;
    }

    const newList = showTimesList.filter((_, i) => !selectedIndices.has(i));
    setShowTimesList(newList);
    setSelectedIndices(new Set());
  };

  /* ================== SUBMIT ================== */
  const handleCreateShowTimes = async () => {
    try {
      if (showTimesList.length === 0) {
        toast.error("Không có suất chiếu để tạo");
        return;
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo suất chiếu");
      console.error(error);
    }
  };

  // HELPER FUCTIONS
  const addMinutesToTime = (timeStr: string, addMinutes: number): string => {
    const [timePart, period] = timeStr.trim().split(" ");
    if (!timePart || !period) {
      throw new Error("Invalid time format");
    }

    const [hh, mm] = timePart.split(":");

    let hour = parseInt(hh, 10);
    const minute = parseInt(mm, 10);

    if (isNaN(hour) || isNaN(minute)) {
      throw new Error("Invalid time format");
    }

    // Convert sang 24h
    if (period === "CH" && hour !== 12) hour += 12;
    if (period === "SA" && hour === 12) hour = 0;

    const totalMinutes = hour * 60 + minute + addMinutes;

    // 🚨 vượt quá 24h
    if (totalMinutes >= closingTimeToMinutes(formData.closingTime)) {
      console.log("over closing time");
      return "over closing time";
    }

    // Tính lại giờ phút
    const newHour24 = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;

    // Convert về 12h + SA/CH
    const newPeriod = newHour24 >= 12 ? "CH" : "SA";
    let newHour12 = newHour24 % 12;
    if (newHour12 === 0) newHour12 = 12;

    const newHH = String(newHour12).padStart(2, "0");
    const newMM = String(newMinute).padStart(2, "0");

    return `${newHH}:${newMM} ${newPeriod}`;
  };

  const getDayType = (dateStr: string): "WEEKEND" | "WEEKDAY" => {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    const day = date.getDay();
    // 0 = Sunday, 6 = Saturday

    return day === 0 || day === 6 ? "WEEKEND" : "WEEKDAY";
  };

  const combineDateAndTimeToUTC = (
    dateStr: string, // "2026-01-15"
    timeStr: string // "10:20 SA" | "10:20 CH"
  ): string => {
    // Parse date
    const [year, month, day] = dateStr.split("-").map(Number);

    if (!year || !month || !day) {
      throw new Error("Invalid date format");
    }

    // Parse time
    const [timePart, period] = timeStr.trim().split(" ");
    const [hh, mm] = timePart.split(":").map(Number);

    if (isNaN(hh) || isNaN(mm) || (period !== "SA" && period !== "CH")) {
      throw new Error("Invalid time format");
    }

    // Convert to 24h
    let hour24 = hh;
    if (period === "CH" && hh !== 12) hour24 += 12;
    if (period === "SA" && hh === 12) hour24 = 0;

    // Create UTC date
    const date = new Date(Date.UTC(year, month - 1, day, hour24, mm, 0));

    // Format YYYY-MM-DD HH:mm:ss+00
    const yyyy = date.getUTCFullYear();
    const MM = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const HH = String(date.getUTCHours()).padStart(2, "0");
    const mm2 = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = "00";

    return `${yyyy}-${MM}-${dd} ${HH}:${mm2}:${ss}+00`;
  };

  const toDate = (value: string): Date => {
    const normalized = value.replace(" ", "T").replace(/\+\d{2}$/, "Z");
    return new Date(normalized);
  };

  const isOverlapTime = (a: ShowTimeType, b: ShowTimeType): boolean => {
    const aRoom = String(a.room_id);
    const bRoom = String(b.room_id);

    if (aRoom !== bRoom) return false;

    const aStart = toDate(a.start_time);
    const aEnd = toDate(a.end_time || "");
    const bStart = toDate(b.start_time);
    const bEnd = toDate(b.end_time || "");

    const hasOverlap = aStart < bEnd && bStart < aEnd;

    return hasOverlap;
  };

  const removeConflitRange = (
    newShowTimes: ShowTimeType[],
    existingShowTimes: ShowTimeType[]
  ): ShowTimeType[] => {
    const filtered = newShowTimes.filter(
      (newTime) =>
        !existingShowTimes.some((existing) => isOverlapTime(newTime, existing))
    );

    return filtered;
  };

  // Helper function để lấy thông tin phim
  const getMovieInfo = (movieId: string) => {
    return movies.find((m) => m.id + "" === movieId);
  };

  // Helper function để tính thời lượng (phút)
  const getDuration = (startStr: string, endStr: string): number => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      return Math.round((end.getTime() - start.getTime()) / 60000);
    } catch {
      return 0;
    }
  };

  const closingTimeToMinutes = (closingTime: string): number => {
    const [timePart, period] = closingTime.trim().split(" ");
    if (!timePart || !period) {
      throw new Error("Invalid time format");
    }

    const [hh, mm] = timePart.split(":");
    let hour = parseInt(hh, 10);
    const minute = parseInt(mm, 10);

    if (isNaN(hour) || isNaN(minute)) {
      throw new Error("Invalid time format");
    }

    // Convert to 24h
    if (period === "CH" && hour !== 12) hour += 12;
    if (period === "SA" && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  // Helper function để format thời gian (HH:MM)
  // const formatTime = (dateStr: string): string => {
  //   try {
  //     const date = new Date(dateStr);
  //     return date.toLocaleTimeString("vi-vn", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       hour12: false,
  //     });
  //   } catch {
  //     return "--:--";
  //   }
  // };

  // Helper function để format ngày (DD/MM/YY)
  // const formatDate = (dateStr: string): string => {
  //   try {
  //     const date = new Date(dateStr);
  //     const year = String(date.getFullYear()).slice(-2);
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const day = String(date.getDate()).padStart(2, "0");
  //     return `${day}/${month}/${year}`;
  //   } catch {
  //     return "";
  //   }
  // };

  const formatDate = (dateStr: string): string => {
    // Parse "2026-01-10 14:30:00+00" → extract date part
    const datePart = dateStr.split(" ")[0]; // "2026-01-10"
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  };

  const formatTime = (dateStr: string): string => {
    // Parse "2026-01-10 14:30:00+00" → extract time part
    const parts = dateStr.split(" ");
    if (parts.length >= 2) {
      const timePart = parts[1]; // "14:30:00"
      const [hour, minute] = timePart.split(":");
      return `${hour}:${minute}`;
    }
    return "--:--";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Mới Suất Chiếu</DialogTitle>
          <DialogDescription>
            Nhập thông tin và tính toán danh sách suất chiếu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ================= BASIC INFO ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MultiSelectComboboxTable
              items={movies}
              selected={movies.filter((movie) =>
                formData.movieIds.includes(movie.id + "")
              )}
              onChange={(selectedMovies) =>
                setFormData({
                  ...formData,
                  movieIds: selectedMovies.map((m) => m.id + ""),
                })
              }
              getId={(movie) => movie.id + ""}
              getLabel={(movie) => movie.title}
              placeholder="Chọn Phim"
            />

            <MultiSelectComboboxTable
              items={rooms}
              selected={rooms.filter((room) =>
                formData.roomId.includes(room.id + "")
              )}
              onChange={(selectedRooms) =>
                setFormData({
                  ...formData,
                  roomId: selectedRooms.map((r) => r.id + ""),
                })
              }
              getId={(room) => room.id + ""}
              getLabel={(room) => room.name}
              placeholder="Chọn Phòng"
            />
          </div>

          {/* ================= DATES ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Từ ngày</label>
              <DatePickerInput
                value={
                  formData.startDate ? new Date(formData.startDate) : undefined
                }
                onChange={(dateString) =>
                  setFormData({
                    ...formData,
                    startDate: dateString || "",
                  })
                }
                placeholder="Chọn ngày bắt đầu"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Đến ngày</label>
              <DatePickerInput
                value={
                  formData.endDate ? new Date(formData.endDate) : undefined
                }
                onChange={(dateString) =>
                  setFormData({
                    ...formData,
                    endDate: dateString || "",
                  })
                }
                placeholder="Chọn ngày kết thúc"
              />
            </div>
          </div>

          {/* ================= BUFFER / AD ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Thời gian đón khách (phút)
              </label>
              <Input
                type="string"
                value={formData.bufferTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bufferTime: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Thời gian quảng cáo (phút)
              </label>
              <Input
                type="string"
                value={formData.adTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adTime: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* ================= FIRST SHOW TIME ================= */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold">
                Chọn suất chiếu đầu tiên
              </label>
              <TimePickerInput
                value={formData.firstShowTime}
                onChange={(timeStr) =>
                  setFormData({
                    ...formData,
                    firstShowTime: timeStr || "",
                  })
                }
                placeholder="HH:MM SA/CH"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold">Giờ đóng rạp</label>
              <TimePickerInput
                value={formData.closingTime}
                onChange={(timeStr) =>
                  setFormData({
                    ...formData,
                    closingTime: timeStr || "",
                  })
                }
                placeholder="HH:MM SA/CH"
              />
            </div>
            <Button onClick={calculateShowTimes}>Tính toán suất chiếu</Button>
          </div>

          {/* ================= SHOW TIMES LIST ================= */}
          {showTimesList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  Danh sách suất chiếu đã tính toán ({showTimesList.length})
                </h4>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        selectedIndices.size === showTimesList.length &&
                        showTimesList.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">Chọn tất cả</span>
                  </label>
                  {selectedIndices.size > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteSelected}
                    >
                      Xóa ({selectedIndices.size})
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                {showTimesList.map((showTime, index) => {
                  const movieInfo = getMovieInfo(showTime.movie_id);
                  const duration = getDuration(
                    showTime.start_time,
                    showTime.end_time || ""
                  );
                  const startTime = formatTime(showTime.start_time);
                  const startDate = formatDate(showTime.start_time);
                  const isSelected = selectedIndices.has(index);

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-slate-200"
                      } hover:shadow-sm`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(index)}
                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 space-y-1 ml-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {index + 1}
                          </Badge>
                          <span className="font-semibold text-slate-900">
                            {movieInfo?.title || "Phim không xác định"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">🕐</span>
                            <span>{startTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">📅</span>
                            <span>{startDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">⏱️</span>
                            <span>{duration} phút</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">🏷️</span>
                            <span className="capitalize">
                              {showTime.day_type === "WEEKEND"
                                ? "Cuối tuần"
                                : "Ngày thường"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleCreateShowTimes}
            disabled={showTimesList.length === 0}
          >
            Tạo Suất Chiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
