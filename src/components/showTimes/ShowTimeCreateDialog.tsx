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
    startDate: "",
    endDate: "",
    bufferTime: 10,
    adTime: 10,
    firstShowTime: "",
  });

  const [showTimesList, setShowTimesList] = useState<string[]>([]);

  /* ================== CALCULATE SHOW TIMES ================== */
  const calculateShowTimes = () => {
    if (!formData.firstShowTime) {
      toast.error("Vui lòng chọn suất chiếu đầu tiên");
      return;
    }

    const [hours, minutes] = formData.firstShowTime.split(":").map(Number);

    const times: string[] = [];
    let currentHours = hours;
    let currentMinutes = minutes;

    const movieDuration = 120;
    const totalSlotDuration =
      movieDuration + formData.bufferTime + formData.adTime;

    while (currentHours < 23) {
      times.push(
        `${String(currentHours).padStart(2, "0")}:${String(
          currentMinutes
        ).padStart(2, "0")}`
      );

      currentMinutes += totalSlotDuration;

      if (currentMinutes >= 60) {
        currentHours += Math.floor(currentMinutes / 60);
        currentMinutes = currentMinutes % 60;
      }
    }

    setShowTimesList(times);
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
                type="number"
                min={0}
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
                type="number"
                min={0}
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
              <Input
                type="time"
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
