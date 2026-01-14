import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
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
    movieId: "",
    roomId: "",
    startDate: "",
    endDate: "",
    bufferTime: 10,
    adTime: 10,
    firstShowTime: "",
  });
  const [showTimesList, setShowTimesList] = useState<string[]>([]);

  // Calculate show times
  const calculateShowTimes = () => {
    if (!formData.firstShowTime) {
      toast.error("Vui lòng chọn suất chiếu đầu tiên");
      return;
    }

    const [hours, minutes] = formData.firstShowTime.split(":").map(Number);
    const times: string[] = [];
    let currentHours = hours;
    let currentMinutes = minutes;

    // Assuming average movie duration is 2 hours for calculation
    const movieDuration = 120;
    const totalSlotDuration =
      movieDuration + formData.bufferTime + formData.adTime;

    // Generate shows until 23:00 (11 PM)
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

  // Remove show time from list
  const removeShowTime = (index: number) => {
    setShowTimesList(showTimesList.filter((_, i) => i !== index));
  };

  // Handle create show times
  const handleCreateShowTimes = async () => {
    if (
      !formData.movieId ||
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

      // Create show times for each date
      const showTimesToCreate = [];
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
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
            movie_id: formData.movieId,
            room_id: formData.roomId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            day_type: dayType,
            is_active: true,
          });
        }
      }

      toast.success(`Tạo ${showTimesToCreate.length} suất chiếu thành công!`);

      if (onSubmit) {
        onSubmit(showTimesToCreate);
      }

      // Reset form
      onOpenChange(false);
      setFormData({
        movieId: "",
        roomId: "",
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
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Chọn Phim</label>
              <Select
                value={formData.movieId}
                onValueChange={(value) =>
                  setFormData({ ...formData, movieId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn phim --" />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id || ""}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Chọn Phòng</label>
              <Select
                value={formData.roomId}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn phòng --" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id || ""}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Từ ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? new Date(formData.startDate).toLocaleDateString("vi-VN")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.startDate
                        ? new Date(formData.startDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        startDate: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    disabled={(date) =>
                      formData.endDate
                        ? date > new Date(formData.endDate)
                        : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Đến ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? new Date(formData.endDate).toLocaleDateString("vi-VN")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.endDate ? new Date(formData.endDate) : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        endDate: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    disabled={(date) =>
                      formData.startDate
                        ? date < new Date(formData.startDate)
                        : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Thời gian đón đẹp (phút)
              </label>
              <Input
                type="number"
                value={formData.bufferTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bufferTime: Number(e.target.value),
                  })
                }
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Thời gian quảng cáo (phút)
              </label>
              <Input
                type="number"
                value={formData.adTime}
                onChange={(e) =>
                  setFormData({ ...formData, adTime: Number(e.target.value) })
                }
                min="0"
              />
            </div>
          </div>

          {/* First Show Time */}
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold">
                Chọn suất chiếu đầu tiên
              </label>
              <Input
                type="time"
                value={formData.firstShowTime}
                onChange={(e) =>
                  setFormData({ ...formData, firstShowTime: e.target.value })
                }
              />
            </div>
            <Button onClick={calculateShowTimes} variant="default">
              Tính toán suất chiếu
            </Button>
          </div>

          {/* Show Times List */}
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
                      <Badge variant="default">{index + 1}</Badge>
                      <span className="font-medium">{time}</span>
                    </div>
                    <button
                      onClick={() => removeShowTime(index)}
                      className="inline-flex items-center justify-center w-8 h-8 bg-destructive text-white rounded hover:bg-destructive/80 transition"
                    >
                      ✕
                    </button>
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
