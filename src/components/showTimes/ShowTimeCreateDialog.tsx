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
    firstShowTime: "",
  });

  const [showTimesList, setShowTimesList] = useState<ShowTimeType[]>([]);

  /* ================== CALCULATE SHOW TIMES ================== */
  const calculateShowTimes = () => {
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
      while (timeReduce !== "over 24 hours") {
        const showTimeTemp: Omit<ShowTimeType, "id" | "room_id">[] = [];
        for (const movie of selectedMovies) {
          if (
            "over 24 hours" ==
            addMinutesToTime(
              timeReduce,
              (movie.duration || 120) + formData.adTime
            )
          ) {
            timeReduce = "over 24 hours";
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
        showTimeCore.push(...showTimeTemp);
      }
      curDate = new Date(
        new Date(curDate).setDate(new Date(curDate).getDate() + 1)
      )
        .toISOString()
        .split("T")[0];
    }
    console.log(showTimeCore);
    console.log(formData.roomId);
    console.log(formData.startDate, formData.endDate);
  };

  const findAndPaginate = async (
    page = 1,
    limit = undefined,
    sortBy = `${showTimePaginateConfig.defaultSortBy[0][0]}:${showTimePaginateConfig.defaultSortBy[0][1]}`,
    search = undefined,
    searchBy = undefined,
    filter = {
      is_active: "true",
    }
  ) => {
    try {
      const response = await showTimeService.findAndPaginate({
        page,
        limit,
        sortBy,
        search,
        searchBy,
        filter,
      });

      if (response.success && response.data) {
        const data = response.data as ShowTimeType[];
        console.log("Fetched show times:", data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeShowTime = (index: number) => {
    setShowTimesList(showTimesList.filter((_, i) => i !== index));
  };

  /* ================== SUBMIT ================== */
  const handleCreateShowTimes = async () => {
    if (
      formData.movieIds.length === 0 ||
      !formData.roomId ||
      !formData.startDate ||
      showTimesList.length === 0
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const startDate = new Date(formData.startDate);
      const endDate = formData.endDate ? new Date(formData.endDate) : startDate;

      const showTimesToCreate: any[] = [];

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        for (const movieId of formData.movieIds) {
          for (const time of showTimesList) {
            const [hours, minutes] = time.split(":").map(Number);

            const startDateTime = new Date(d);
            startDateTime.setHours(hours, minutes, 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(hours + 2, minutes, 0, 0);

            const dayType =
              startDateTime.getDay() === 0 || startDateTime.getDay() === 6
                ? "weekend"
                : "weekday";

            showTimesToCreate.push({
              movie_id: movieId,
              room_id: formData.roomId,
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              day_type: dayType,
              is_active: true,
            });
          }
        }
      }

      toast.success(`Tạo ${showTimesToCreate.length} suất chiếu thành công`);

      onSubmit?.(showTimesToCreate);
      onOpenChange(false);

      setFormData({
        movieIds: [],
        roomId: [],
        startDate: "",
        endDate: "",
        bufferTime: 10,
        adTime: 10,
        firstShowTime: "",
      });
      setShowTimesList([]);
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
    if (totalMinutes >= 1440) {
      return "over 24 hours";
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
    return new Date(value.replace(" ", "T"));
  };

  const isOverlapTime = (
    a: Omit<ShowTimeType, "id" | "room_id">,
    b: Omit<ShowTimeType, "id" | "room_id">
  ): boolean => {
    const aStart = toDate(a.start_time);
    const aEnd = toDate(a.end_time as string);
    const bStart = toDate(b.start_time);
    const bEnd = toDate(b.end_time as string);

    return aStart < bEnd && bStart < aEnd;
  };

  const removeConflitRange = (
    a: Omit<ShowTimeType, "id" | "room_id">[],
    b: Omit<ShowTimeType, "id" | "room_id">[]
  ): Omit<ShowTimeType, "id" | "room_id">[] => {
    return a.filter((itemA) => !b.some((itemB) => isOverlapTime(itemA, itemB)));
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
                Chọn suất chiếu đầu tiên (HH:MM SA/CH)
              </label>
              <Input
                type="string"
                value={formData.firstShowTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    firstShowTime: e.target.value,
                  })
                }
              />
            </div>
            <Button onClick={calculateShowTimes}>Tính toán suất chiếu</Button>
          </div>

          {/* ================= SHOW TIMES LIST ================= */}
          {showTimesList.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                Danh sách suất chiếu trong ngày
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {showTimesList.map((time, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted p-3 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Badge>{index + 1}</Badge>
                      <span className="font-medium">{time}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeShowTime(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
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
