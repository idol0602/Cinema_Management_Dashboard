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
  onSubmit?: (showTimes: unknown) => void;
  onRefresh?: () => void;
}

export function ShowTimeCreateDialog({
  open,
  onOpenChange,
  movies,
  rooms,
  onSubmit,
  onRefresh,
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
    try {
      if (!formData.firstShowTime) {
        toast.error("Vui lòng chọn suất chiếu đầu tiên");
        return;
      }

      const selectedMovies = movies.filter((movie) =>
        formData.movieIds.includes(movie.id + "")
      );
      if (selectedMovies.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 phim");
        return;
      }

      if (formData.roomId.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 phòng");
        return;
      }

      // Lấy danh sách suất chiếu hiện tại
      const existingShowTimes: ShowTimeType[] =
        (await findAndPaginate(1, undefined, undefined)) || [];

      const finalShowTimes: ShowTimeType[] = [];

      // Lặp qua từng phòng
      for (const roomId of formData.roomId) {
        // Lặp qua từng ngày
        let curDateStr = formData.startDate;
        while (curDateStr <= formData.endDate) {
          let movieIndex = 0;

          // Bắt đầu từ giờ mở cửa
          let currentTime = formData.firstShowTime;

          // Lặp qua từng phim trong ngày này
          while (
            currentTime !== "over closing time" &&
            movieIndex < selectedMovies.length
          ) {
            const movie = selectedMovies[movieIndex];
            const movieDuration = movie.duration || 120;

            // Tính thời gian kết thúc của phim
            const endTime = addMinutesToTime(
              currentTime,
              movieDuration + formData.adTime
            );

            if (endTime === "over closing time") {
              // Phim này vượt quá giờ đóng rạp, chuyển sang ngày tiếp theo
              break;
            }

            // Tạo object suất chiếu dự kiến
            const proposedShowTime: ShowTimeType = {
              movie_id: movie.id + "",
              room_id: roomId,
              start_time: combineDateAndTimeToUTC(curDateStr, currentTime),
              end_time: combineDateAndTimeToUTC(curDateStr, endTime),
              day_type: getDayType(curDateStr),
              is_active: true,
            };

            // Kiểm tra xem có overlap không
            const hasOverlap = existingShowTimes.some((existing) =>
              isOverlapTime(proposedShowTime, existing)
            );

            if (!hasOverlap) {
              // Nếu không overlap, thêm vào danh sách kết quả
              finalShowTimes.push(proposedShowTime);

              // Cập nhật existingShowTimes để kiểm tra phim tiếp theo
              existingShowTimes.push(proposedShowTime);

              // Tăng index phim lên
              movieIndex++;

              // Tăng thời gian cho phim tiếp theo
              currentTime = addMinutesToTime(endTime, formData.bufferTime);
            } else {
              // Nếu có overlap, tăng thời gian lên và thử lại
              currentTime = addMinutesToTime(currentTime, 15); // Tăng 15 phút thử lại
              if (currentTime === "over closing time") {
                break;
              }
            }
          }

          // Chuyển sang ngày tiếp theo
          const [year, month, day] = curDateStr.split("-").map(Number);
          const nextDate = new Date(year, month - 1, day + 1);
          const nextYear = nextDate.getFullYear();
          const nextMonth = String(nextDate.getMonth() + 1).padStart(2, "0");
          const nextDay = String(nextDate.getDate()).padStart(2, "0");
          curDateStr = `${nextYear}-${nextMonth}-${nextDay}`;
        }
      }

      setShowTimesList(finalShowTimes);

      if (finalShowTimes.length === 0) {
        toast.warning("Không tìm được khoảng thời gian thích hợp cho phim nào");
      } else {
        toast.success(
          `✓ Tính toán được ${finalShowTimes.length} suất chiếu hợp lệ`
        );
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tính toán suất chiếu");
      console.error(error);
    }
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
      const filters: unknown = {
        "filter[room_id][$in]": formData.roomId.join(","),
        "filter[start_time][$gte]": `${formData.startDate}T00:00:00Z`,
        "filter[end_time][$lte]": `${formData.endDate}T23:59:59Z`,
        "filter[is_active][$eq]": true,
      };

      const response = await showTimeService.findAndPaginate({
        page,
        limit,
        sortBy,
        ...(filters || {}),
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

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === showTimesList.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(showTimesList.map((_, i) => i)));
    }
  };

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

      // Gọi API bulkCreate
      const response = await showTimeService.bulkCreate(showTimesList);

      if (response.success) {
        toast.success(`✓ Tạo thành công ${showTimesList.length} suất chiếu`);

        // Clear form
        setShowTimesList([]);
        setSelectedIndices(new Set());

        // Gọi callback nếu có
        onSubmit?.(response.data);

        // Đóng dialog sau 1 giây
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);

        onRefresh?.();
      } else {
        toast.error(response.error || "Lỗi khi tạo suất chiếu");
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

    // 🚨 vượt quá giờ đóng rạp
    if (totalMinutes >= closingTimeToMinutes(formData.closingTime)) {
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

  const getMovieInfo = (movieId: string) => {
    return movies.find((m) => m.id + "" === movieId);
  };

  const getRoomInfo = (roomId: string) => {
    return rooms.find((r) => r.id + "" === roomId);
  };

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

  const formatDate = (dateStr: string): string => {
    const datePart = dateStr.split(" ")[0];
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  };

  const formatTime = (dateStr: string): string => {
    const parts = dateStr.split(" ");
    if (parts.length >= 2) {
      const timePart = parts[1];
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
                  const roomInfo = getRoomInfo(showTime.room_id);
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
                            <span className="font-medium">🏢</span>
                            <span>
                              {roomInfo?.name || "Phòng không xác định"}
                            </span>
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
